import { fromJS } from 'immutable';
import * as types from '../constants';

const initialState = fromJS({
  lastConnect: null,
  lastVersion: null,
  notificationCounter: 0,
  status: 'offline',
  versionInfo: {},
});

export default function connectionReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case 'init': {
      return state.set('lastConnect', payload.timestamp);
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
    case types.UPDATE_NOTIFICATION_COUNTER: {
      return state.set('notificationCounter', payload.counter);
    }
    case types.RESET_STATE: {
      return initialState;
    }
    default:
      return state;
  }
}
