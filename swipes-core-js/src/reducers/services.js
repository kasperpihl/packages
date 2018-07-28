import { fromJS, Map } from 'immutable';
import { reducerInitToMap } from '../classes/utils';
import * as types from '../constants';

const initialState = fromJS({});

export default function servicesReducer(state = initialState, action) {
  const { payload, type } = action;
  switch (type) {
    case 'init': {
      return reducerInitToMap(payload, 'services', state);
    }
    case types.RESET_STATE: {
      return initialState;
    }
    default:
      return state;
  }
}
