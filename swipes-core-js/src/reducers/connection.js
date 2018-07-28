import { fromJS } from 'immutable';
import { REHYDRATE } from 'redux-persist';
import * as types from '../constants';

const initialState = fromJS({
  lastConnect: null,
  lastVersion: null,
  token: null,
  forceFullFetch: false,
  readyInOrg: false,
  hasConnected: false,
  notificationCounter: 0,
  status: 'offline',
  versionInfo: {},
});
const forceRefresh = state => state.set('lastConnect', null)
  .set('forceFullFetch', true)
  .set('hasConnected', false)
  .set('readyInOrg', false);

export default function connectionReducer(state = initialState, action) {
  const {
    type,
    payload,
  } = action;

  switch (type) {
    case 'init': {
      return state.set('lastConnect', payload.timestamp)
        .set('forceFullFetch', false)
        .set('hasConnected', true)
        .set('readyInOrg', !!payload.me.organizations.length);
    }
    case 'me': {
      if (!payload.me.organizations.length) {
        return state.set('hasConnected', true);
      }
    }
    case REHYDRATE:
      if (action && action.payload && action.payload.connection) {
        const { connection } = action.payload;
        let newState = initialState.set('lastVersion', state.get('lastVersion'));
        if (connection.get('token')) {
          newState = initialState.set('token', connection.get('token'))
            .set('lastConnect', connection.get('lastConnect'))
            .set('lastVersion', state.get('lastVersion'))
            .set('hasConnected', connection.get('hasConnected'))
            .set('readyInOrg', connection.get('readyInOrg'));
          // Check if the stored version is different for the one that's loaded on open
          if (state.get('lastVersion') !== connection.get('lastVersion')) {
            newState = forceRefresh(newState);
          }
        }
        return newState;
      }
      return state;
    case types.SET_LAST_VERSION: {
      return state.set('lastVersion', payload.version);
    }
    case types.SET_UPDATE_STATUS: {
      return state.mergeIn(['versionInfo'], fromJS(payload));
    }
    case types.SET_CONNECTION_STATUS: {
      return state.set('status', payload.status)
        .set('nextRetry', payload.nextRetry)
        .set('reconnectAttempt', payload.reconnectAttempt);
    }
    case types.UPDATE_NOTIFICATION_COUNTER: {
      return state.set('notificationCounter', payload.counter);
    }
    // ======================================================
    // Authorization methods
    // ======================================================
    case 'organization_updated': {
      if (state.get('readyInOrg')) {
        return state;
      }
      return forceRefresh(state);
    }
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
    case 'users.signin':
    case 'users.signup': {
      return state.set('token', payload.token);
    }
    case types.RESET_STATE: {
      return initialState;
    }
    default:
      return state;
  }
}
