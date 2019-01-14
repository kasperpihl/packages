import { fromJS } from 'immutable';
import * as types from '../constants';

const initialState = fromJS({});

export default function meReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case 'me.init': {
      let newState = initialState;
      payload.organizations.forEach(org => {
        newState = newState.set(org.organization_id, org);
      });
      payload.users.forEach(user => {
        newState = newState.setIn(
          [user.organization_id, 'users', user.user_id],
          user
        );
      });
      return newState;
    }
    case types.RESET_STATE: {
      return initialState;
    }
    default:
      return state;
  }
}
