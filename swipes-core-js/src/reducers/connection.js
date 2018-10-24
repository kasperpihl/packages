import { fromJS } from 'immutable';
import { REHYDRATE } from 'redux-persist';
import * as types from '../constants';

const initialState = fromJS({
  lastConnect: null,
  lastVersion: null,
  forceFullFetch: false,
  readyInOrg: false,
  hasConnected: false,
  notificationCounter: 0,
  status: 'offline',
  versionInfo: {},
});
const forceRefresh = state =>
  state
    .set('lastConnect', null)
    .set('forceFullFetch', true)
    .set('hasConnected', false)
    .set('readyInOrg', false);

export default function connectionReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case 'init': {
      return state
        .set('lastConnect', payload.timestamp)
        .set('forceFullFetch', false)
        .set('hasConnected', true);
    }
    case 'me': {
      if (!payload.me.organizations.length) {
        return state.set('hasConnected', true);
      }
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
    // ======================================================
    // Authorization methods
    // ======================================================
    case 'organizations.delete':
    case 'organizations.leave':
    case 'user_organization_left':
    case 'organizations.create':
    case 'organizations.join':
    case 'organization_deleted':
    case 'user_disabled':
    case 'organization_created': {
      return forceRefresh(state);
    }
    case types.RESET_STATE: {
      return initialState;
    }
    default:
      return state;
  }
}
