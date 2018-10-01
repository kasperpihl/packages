import { fromJS } from 'immutable';
import * as types from '../constants';

const initialState = fromJS({
  token: null
});

export default function globals(state = initialState, action) {
  const { payload, type } = action;
  switch (type) {
    case 'users.signin':
    case 'users.signup': {
      return state.set('token', payload.token);
    }
    case types.RESET_STATE: {
      return initialState;
    }
    default: {
      return state;
    }
  }
}
