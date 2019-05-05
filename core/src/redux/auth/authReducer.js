import { fromJS } from 'immutable';
import * as types from '../constants';

const initialState = fromJS({
  token: null
});

export default function authReducer(state = initialState, action) {
  const { payload, type } = action;
  switch (type) {
    case 'user.signin':
    case 'user.signup': {
      return state.set('token', payload.token);
    }
    case 'user.signout':
    case types.RESET_STATE: {
      return initialState;
    }
    default: {
      return state;
    }
  }
}
