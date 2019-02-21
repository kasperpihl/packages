import { fromJS } from 'immutable';
import * as types from '../constants';

const initialState = fromJS({});

export default function meReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case 'me.init': {
      return fromJS(payload.me);
    }
    case 'update': {
      const { type, data } = payload;
      if (type === 'me' && data.user_id === state.get('user_id')) {
        return state.merge(fromJS(data));
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
