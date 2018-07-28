import * as ca from './';

// ======================================================
// Mark notifications as read
// ======================================================
export const mark = payload => dp => dp(ca.api.request('notifications.markAsSeen', {
  notification_ids: payload,
}));

export const setLastReadTs = (ts) => (d, getState) => {
  const lastReadTs = getState().me.getIn(['settings', 'last_read_ts']);

  if(!lastReadTs || lastReadTs < ts) {
    d(ca.me.updateSettings({ last_read_ts: ts }));
  }
}
