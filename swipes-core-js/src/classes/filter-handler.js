import { Map, List } from 'immutable';
import * as types from '../constants';
import { bindAll } from './utils';

export default class FilterHandler {
  constructor(store) {
    this.store = store;
    bindAll(this, ['storeChange']);
    store.subscribe(this.storeChange);
  }
  storeChange() {
    const state = this.store.getState();
    this.myId = state.me.get('id');

    const notifications = state.notifications;
    const lastReadTs = state.me.getIn(['settings', 'last_read_ts']);
    if (notifications !== this.prevNotifications || lastReadTs !== this.prevLastReadTs) {
      this.prevNotifications = this.prevNotifications || List();
      let counter = 0;

      notifications.forEach((n, i) => {
        if (!n.get('seen_at') && (!lastReadTs || lastReadTs < n.get('created_at'))) {
          counter += 1;
        }
      });
      const currUnread = state.connection.get('notificationCounter');

      this.prevNotifications = notifications;
      this.prevLastReadTs = lastReadTs;
      if (currUnread !== counter) {
        this.store.dispatch({ type: types.UPDATE_NOTIFICATION_COUNTER, payload: { counter } });
        if (window.ipcListener) {
          window.ipcListener.setBadgeCount(`${counter || ''}`);
        }
      }
    }
  }
}
