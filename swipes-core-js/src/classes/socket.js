import { fromJS } from 'immutable';
import * as types from '../constants';

import { bindAll } from './utils';
import * as a from '../actions';

const PING_TIMER = 5000;
const EXPECTED_PONG = 9000;

export default class Socket {
  constructor(store, delegate) {
    this.store = store;
    this.reconnect_attempts = 0;
    bindAll(this, ['message', 'changeStatus', 'storeChange', 'onCloseHandler']);
    const version = store.getState().globals.get('version');
    // Send in the current version. We use this to check if its different from last open
    store.dispatch({ type: types.SET_LAST_VERSION, payload: { version } });
    store.subscribe(this.storeChange);

    if (window.addEventListener) {
      window.addEventListener('beforeunload', () => this.forceClose(true));
    }
  }
  storeChange() {
    const { connection } = this.store.getState();
    this.token = connection.get('token');

    const forceFullFetch = connection.get('forceFullFetch');

    if (this.isConnected && (!this.token || forceFullFetch)) {
      this.forceClose(true);
    }
    if (this.token && !this.isConnecting && !this.isConnected && !this.hasTimer) {
      this.timedConnect(this.timerForAttempt());
    }
  }
  forceClose(killSocket) {
    if (this.ws && killSocket) {
      this.ws.close();
    } else {
      this.onCloseHandler();
    }
  }
  onCloseHandler() {
    this.isConnecting = false;
    this.isConnected = false;
    this.reconnect_attempts += 1;
    let nextRetry;
    if (this.token) {
      const time = this.timerForAttempt();
      this.timedConnect(time, true);
      nextRetry = new Date();
      nextRetry.setSeconds(nextRetry.getSeconds() + (time / 1000));
    } else {
      this.reconnect_attempts = 0;
      this.timer = undefined;
    }
    this.changeStatus('offline', nextRetry);
  }
  timedConnect(time) {
    if (this.isConnecting || this.hasTimer) {
      return;
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(this.connect.bind(this), time);
    this.hasTimer = true;
  }
  connect() {
    const { getState } = this.store;
    let url = getState().globals.get('apiUrl');

    if (!url) {
      console.warn('Socket requires globals reducer to have apiUrl to be set');
      return;
    }

    if (url.includes('localhost')) {
      url = 'http://localhost:5000';
    }

    this.fetchMe(url);
  }
  fetchMe(url) {
    if (this.isConnecting || this.forceOffline) {
      return;
    }
    this.hasTimer = false;
    this.isConnecting = true;
    this.changeStatus('connecting');

    this.store.dispatch(a.api.request('me')).then((res) => {
      if (res.redirectUrl) {
        // The api was redirected. Connect to staging
        this.forceConnectUrl = 'https://staging.swipesapp.com';
      }
      if(res.ok) {
        this.hasOrg = !!res.me.organizations.length;
        this.openSocket(url);
      } else {
        this.onCloseHandler();
      }
    });
  }
  openSocket(url) {

    if (!window.WebSocket || this.isSocketConnected) {
      return this.fetchInit();
    }

    if (this.forceConnectUrl) {
      url = this.forceConnectUrl;
      this.forceConnectUrl = null;
    }
    let wsUrl = `${url.replace(/http(s)?/, 'ws$1')}/ws`;
    wsUrl = `${wsUrl}?token=${this.token}`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      this.isSocketConnected = true;
      this._pingTimer = setInterval(() => {
        this.sendPing();
      }, 5000);
      this.fetchInit();
    };

    this.ws.onmessage = this.message;

    this.ws.onclose = () => {
      this.lastPong = null;
      this.isSocketConnected = false;
      clearInterval(this._pingTimer);
      this.onCloseHandler();
    };
  }
  fetchInit() {
    if(!this.hasOrg) {
      this.isConnecting = false;
      this.isConnected = true;
      this.reconnect_attempts = 0;
      this.changeStatus('online');
      return;
    }
    this.store.dispatch(a.me.init()).then((res) => {
      this.isConnecting = false;
      this.isConnected = true;
      if (res && res.ok) {
        this.reconnect_attempts = 0;
        this.changeStatus('online');
      } else if (res && res.error) {
        if (['reload_required', 'update_required'].indexOf(res.error.message) > -1) {
          this.forceOffline = true;
        }
        this.forceClose();
      }
    });
  }
  changeStatus(status, nextRetry) {
    this.status = status;
    this.store.dispatch({
      type: types.SET_CONNECTION_STATUS,
      payload: {
        status,
        reconnectAttempt: this.reconnect_attempts,
        nextRetry,
      },
    });
  }
  message(message) {
    const data = JSON.parse(message.data);
    const {
      type,
      payload,
    } = data;

    if (!type || (!this.isConnected && type !== 'pong')) {
      return;
    }
    if (type === 'pong') {
      this.lastPong = new Date().getTime();
    }
    if (type === 'token_revoked') {
      const currToken = this.store.getState().connection.get('token');
      if (payload.token_to_revoke === currToken) {
        return this.store.disatch({ type: types.RESET_STATE });
      }
    }
    const socketData = Object.assign({ ok: true }, payload && payload.data);
    this.store.dispatch({ type, payload: socketData });

    this.handleNotifications(payload);
  }
  handleNotifications(payload) {
    if (payload && payload.notification_data && Object.keys(payload.notification_data).length) {
      this.store.dispatch({
        type: types.NOTIFICATION_ADD,
        payload: payload.notification_data,
      });

      if (window && window.ipcListener && window.msgGen) {
        const n = fromJS(payload.notification_data);
        const nToSend = window.msgGen.notifications.getDesktopNotification(n);
        if (nToSend) {
          window.ipcListener.sendNotification(nToSend);
        }
      }
    }
  }
  sendPing() {
    if (this.ws && this.ws.readyState == this.ws.OPEN) {
      const now = new Date().getTime();
      if (this.lastPong && (now - this.lastPong > EXPECTED_PONG)) {
        this.forceClose(true);
      } else {
        this.ws.send(JSON.stringify({
          type: 'ping',
          id: 1,
        }));
      }
    }
  }
  timerForAttempt() {
    const maintenance = this.store.getState().connection.getIn(['versionInfo', 'maintenance']);
    if (maintenance) return 180000;
    switch (this.reconnect_attempts) {
      case 0: return 0;
      case 1:
      case 2:
      case 3: return 500;
      case 4: return 1000;
      case 5: return 5000;
      case 6: return 10000;
      case 7: return 30000;
      default: return 180000;
    }
  }
}
