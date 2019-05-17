import { fromJS } from 'immutable';
import * as types from '../constants';

const initialState = fromJS({
  lastConnect: null,
  lastVersion: null,
  myId: null,
  unread: {},
  unreadByTeam: {},
  status: 'offline',
  clientUpdate: null,
  maintenance: null
});

export default function connectionReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case 'me.init': {
      return state
        .set('myId', payload.me.user_id)
        .set('unreadByTeam', fromJS(payload.unread_by_team))
        .set('lastConnect', payload.timestamp);
    }
    case 'update': {
      const { type, data } = payload;
      if (type === 'discussion' && data.owned_by) {
        if (data.deleted) {
          state = state.deleteIn([
            'unreadByTeam',
            data.owned_by,
            data.discussion_id
          ]);
        } else {
          if (data.members) {
            const lastReadAt =
              data.members[state.get('myId')] ||
              state.getIn([
                'unreadByTeam',
                data.owned_by,
                data.discussion_id
              ]) ||
              null;
            const lastMessageAt = data.last_comment_at;

            if (lastMessageAt) {
              if (lastMessageAt !== lastReadAt) {
                state = state.setIn(
                  ['unreadByTeam', data.owned_by, data.discussion_id],
                  lastMessageAt
                );
              } else {
                state = state.deleteIn([
                  'unreadByTeam',
                  data.owned_by,
                  data.discussion_id
                ]);
              }
            }
          }
        }
      }
      return state;
    }
    case types.SET_LAST_VERSION: {
      return state.set('lastVersion', payload.version);
    }
    case types.SET_CONNECTION_INFO: {
      return state
        .set('clientUpdate', payload.clientUpdate)
        .set('maintenance', payload.maintenance);
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
