import { fromJS, Map } from 'immutable';
import { reducerInitToMap } from '../classes/utils';
import * as types from '../constants';

const initialState = fromJS({});

const updateStateFromOrg = (state, org) => {
  let tempState = state;
  const disabledUsers = org.disabled_users || [];
  const pendingUsers = org.pending_users || [];
  const activeUsers = org.active_users || [];
  state.forEach((u) => {
    const isDisabled = !!(disabledUsers.indexOf(u.get('id')) > -1)
    if(!!u.get('disabled') !== isDisabled) {
      tempState = tempState.setIn([u.get('id'), 'disabled'], isDisabled);
    }
    const isPending = !!(pendingUsers.indexOf(u.get('id')) > -1);
    if(!!u.get('pending') !== isPending) {
      tempState = tempState.setIn([u.get('id'), 'pending'], isPending);
    }
    const isActive = !!(activeUsers.indexOf(u.get('id')) > -1);
    if(!!u.get('active') !== isActive) {
      tempState = tempState.setIn([u.get('id'), 'active'], isActive);
    }
  });
  return tempState;
}

export default function usersReducer(state = initialState, action) {
  const { payload, type } = action;
  switch (type) {
    case 'init': {
      let tempState = reducerInitToMap(payload, 'users', state);
      tempState = tempState.set('USOFI', fromJS(payload.sofi));
      if(payload.me.organizations[0]){
        tempState = updateStateFromOrg(tempState, payload.me.organizations[0]);
      }

      return tempState;
    }
    case 'me.uploadProfilePhoto':
    case 'me.updateProfile':
    case 'profile_updated': {
      return state.mergeIn([payload.user_id, 'profile'], fromJS(payload.profile));
    }
    case 'organization_user_invited':
    case 'organizations.inviteUser':{
      const tempState = state.set(payload.user.id, fromJS(payload.user));
      return updateStateFromOrg(tempState, payload.organization);
    }
    case 'organizations.enableUser':
    case 'organizations.disableUser':
    case 'organization_updated': {
      let tempState = updateStateFromOrg(state, payload.organization);
      return tempState;
    }
    case types.RESET_STATE: {
      return initialState;
    }
    default:
      return state;
  }
}
