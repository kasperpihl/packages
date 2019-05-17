import * as types from 'src/redux/constants';
import request from 'src/utils/request';
import randomString from 'src/utils/randomString';
import { setStore } from 'src/utils/store/storeGet';

export default class Socket {
  constructor(store, options = {}) {
    window.socket = this;
    setStore(store); // Make store accessible from core
    this.store = store;
    this.options = options;
    this.reconnect_attempts = 0;
    this.subscriptions = {};
    const version = store.getState().global.get('version');
    // Send in the current version. We use this to check if its different from last open
    store.dispatch({ type: types.SET_LAST_VERSION, payload: { version } });
    store.subscribe(this.storeChange);

    if (window.addEventListener) {
      window.addEventListener('beforeunload', () => this.forceClose(true));
    }
  }
  subscribe = handler => {
    const id = randomString(5);
    this.subscriptions[id] = handler;
    return this.unsubscribe.bind(null, id);
  };
  unsubscribe = id => {
    delete this.subscriptions[id];
  };
  storeChange = () => {
    const { connection, auth } = this.store.getState();
    const shouldReset = !!(!auth.get('token') && this.token);
    this.token = auth.get('token');
    if (shouldReset) {
      this.store.dispatch({ type: types.RESET_STATE });
    }

    const forceFullFetch = connection.get('forceFullFetch');

    if (this.isConnected && (!this.token || forceFullFetch)) {
      this.forceClose(true);
    }
    if (
      this.token &&
      !this.isConnecting &&
      !this.isConnected &&
      !this.hasTimer
    ) {
      this.timedConnect(this.timerForAttempt());
    }
  };
  forceClose(killSocket) {
    if (this.ws && killSocket) {
      this.ws.close();
    } else {
      this.onCloseHandler();
    }
  }
  onCloseHandler = () => {
    this.isConnecting = false;
    this.isConnected = false;
    this.reconnect_attempts += 1;
    let nextRetry;
    if (this.token) {
      const time = this.timerForAttempt();
      this.timedConnect(time, true);
      nextRetry = new Date();
      nextRetry.setSeconds(nextRetry.getSeconds() + time / 1000);
    } else {
      this.reconnect_attempts = 0;
      this.timer = undefined;
    }
    this.changeStatus('offline', nextRetry);
  };
  timedConnect(time) {
    if (this.isConnecting || this.hasTimer) {
      return;
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(this.connect.bind(this), time);
    this.hasTimer = true;
  }
  connect() {
    const { getState } = this.store;
    let url = getState().global.get('apiUrl');

    if (url.includes('localhost')) {
      url = 'ws://localhost:7000';
    } else {
      url = 'wss://socket.wspc.io';
    }

    this.openSocket(url);
  }
  openSocket(url) {
    if (this.isConnecting || this.forceOffline) {
      return;
    }
    this.hasTimer = false;
    this.isConnecting = true;
    this.changeStatus('connecting');

    // If we already have the socket open, close it and try again.
    if (this.ws) {
      this.ws.onclose = () => null;
      this.ws.close();
    }

    let wsUrl = `${url.replace(/http(s)?/, 'ws$1')}`;
    wsUrl = `${wsUrl}?token=${this.token}`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      this.fetchInit();
    };

    this.ws.onmessage = this.message;

    this.ws.onclose = () => {
      this.onCloseHandler();
    };
  }
  fetchInit() {
    request('me.init').then(res => {
      this.isConnecting = false;
      this.isConnected = true;
      if (res && res.ok) {
        this.reconnect_attempts = 0;
        this.changeStatus('online');
      } else if (res && res.error) {
        if (
          ['reload_required', 'update_required'].indexOf(res.error.message) > -1
        ) {
          this.forceOffline = true;
        }
        this.forceClose();
      }
    });
  }
  changeStatus = (status, nextRetry) => {
    this.status = status;
    this.store.dispatch({
      type: types.SET_CONNECTION_STATUS,
      payload: {
        status,
        reconnectAttempt: this.reconnect_attempts,
        nextRetry
      }
    });
  };
  message = message => {
    const data = JSON.parse(message.data);
    const { type, payload } = data;

    if (!type || !this.isConnected) {
      return;
    }
    if (type === 'update') {
      return this.handleUpdate(payload);
    }
    return this.store.dispatch({ type, payload });
  };

  handleUpdate = update => {
    if (this.lastUpdateId !== update.update_id) {
      if (window && window.ipcListener) {
        window.ipcListener.handleDesktopNotifications(update);
      }
      this.lastUpdateId = update.update_id;
      update.rows.forEach(r => {
        Object.values(this.subscriptions).forEach(handler => handler(r));
        this.store.dispatch({ type: 'update', payload: r });
      });
    }
  };

  timerForAttempt() {
    const maintenance = this.store
      .getState()
      .connection.getIn(['versionInfo', 'maintenance']);
    if (maintenance) return 180000;
    switch (this.reconnect_attempts) {
      case 0:
        return 0;
      case 1:
      case 2:
      case 3:
        return 500;
      case 4:
        return 1000;
      case 5:
        return 5000;
      case 6:
        return 10000;
      case 7:
        return 30000;
      default:
        return 180000;
    }
  }
}
