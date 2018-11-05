import * as types from '../constants'
import { fromJS } from 'immutable'
const initialState = fromJS({
  string: null,
  options: {},
  results: null,
  blockedIdentifier: null,
});

export default function autoComplete (state = initialState, action) {
  const {
    type,
    payload,
  } = action;
  switch (type) {
    case types.AUTO_COMPLETE_SET_STRING: {
      return state.set('string', payload.string)
                  .set('options', payload.options)
                  .set('blockedIdentifier', null);
    }
    case types.AUTO_COMPLETE: {
      return state.set('results', payload.results);
    }
    case types.AUTO_COMPLETE_BLOCK_IDENTIFIER: {
      return state.set('blockedIdentifier', payload.key);
    }
    case types.AUTO_COMPLETE_CLEAR:
    case types.RESET_STATE: {
      return initialState;
    }
    default:{
      return state;
    }
  }
}
