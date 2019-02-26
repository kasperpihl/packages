import { fromJS } from 'immutable';
import * as types from '../constants';

const initialState = fromJS({});

export default function organizationsReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case 'me.init': {
      let newState = initialState;
      payload.organizations.forEach(org => {
        newState = newState.set(org.organization_id, fromJS(org));
      });
      payload.users.forEach(user => {
        newState = newState.setIn(
          [user.organization_id, 'users', user.user_id],
          fromJS(user)
        );
      });
      return newState;
    }
    case 'update': {
      const { type, data } = payload;
      if (type === 'organization') {
        if (data.deleted) {
          return state.delete(data.organization_id);
        }
        if (!state.get(data.organization_id)) {
          data.users = {};
        }
        return state.mergeIn([data.organization_id], fromJS(data));
      }
      if (type === 'organization_user') {
        return state.mergeIn(
          [data.organization_id, 'users', data.user_id],
          fromJS(data)
        );
      }
      if (type === 'me') {
        let newState = state;
        state.forEach(org => {
          if (org.getIn(['users', data.user_id])) {
            newState = state.mergeIn(
              [org.get('organization_id'), 'users', data.user_id],
              fromJS(data)
            );
          }
        });
        return newState;
      }
      return state;
    }
    case types.RESET_STATE: {
      return initialState;
    }
    default:
      return state;
  }
}
