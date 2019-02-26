import { fromJS } from 'immutable';
import * as types from '../constants';

const initialState = fromJS({
  lastConnect: null,
  lastVersion: null,
  myId: null,
  unread: {},
  status: 'offline',
  versionInfo: {}
});

export default function connectionReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case 'me.init': {
      return state
        .set('myId', payload.me.user_id)
        .set('unread', fromJS(payload.unread))
        .set('lastConnect', payload.timestamp);
    }
    case 'update': {
      const { type, data } = payload;
      if (type === 'discussion') {
        if (data.deleted) {
          state = state.deleteIn(['unread', data.discussion_id]);
        } else {
          const lastReadAt =
            data.followers[state.get('myId')] ||
            state.getIn(['unread', data.discussion_id]) ||
            null;
          const lastMessageAt = data.last_comment_at;
          if (lastMessageAt) {
            if (lastMessageAt !== lastReadAt) {
              state = state.setIn(['unread', data.discussion_id], lastReadAt);
            } else {
              state = state.deleteIn(['unread', data.discussion_id]);
            }
          }
        }
      }
      return state;
    }
    case types.SET_LAST_VERSION: {
      return state.set('lastVersion', payload.version);
    }
    case types.SET_UPDATE_STATUS: {
      return state.mergeIn(['versionInfo'], fromJS(payload));
    }
    case types.SET_CONNECTION_STATUS: {
      return state
        .set('status', payload.status)
        .set('nextRetry', payload.nextRetry)
        .set('reconnectAttempt', payload.reconnectAttempt);
    }
    case types.RESET_STATE: {
      return initialState;
    }
    default:
      return state;
  }
}
