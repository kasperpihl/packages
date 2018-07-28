import * as types from '../constants';
import { fromJS, Map } from 'immutable';
import { reducerInitToMap } from '../classes/utils';

const initialState = fromJS({});

export default function onboardingReducer(state = initialState, action) {
  const { payload, type } = action;
  switch (action.type) {
    case 'init': {
      return reducerInitToMap(payload, 'onboarding', state);;
    }
    case types.RESET_STATE: {
      return initialState;
    }
    default:
      return state;
  }
}
