import { fromJS } from 'immutable';
import * as types from '../constants';

const initialState = fromJS({});

export default function meReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case 'me.init': {
      return fromJS(payload.me);
    }
    case types.RESET_STATE: {
      return initialState;
    }
    default:
      return state;
  }
}
