import { fromJS } from 'immutable';
import * as types from '../constants';

const initialState = fromJS({
  lastConnect: null,
  lastVersion: null,
  myId: null,
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
        .set('lastConnect', payload.timestamp);
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
