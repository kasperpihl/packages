import { fromJS } from 'immutable';
import * as types from '../constants';

const initialState = fromJS({});

const updateKeyPath = (state, keyPath, data) => {
  if(!state.getIn(keyPath)) {
    return state;
  }

  return state.mergeIn(keyPath, data);
}

export default function cacheReducer (state = initialState, action) {
  const {
    payload,
    type,
  } = action;

  switch (type) {
    case types.CACHE_SAVE: {
      return state.setIn(payload.path, payload.data);
    }
    case types.CACHE_CLEAR: {
      return state.deleteIn(payload.path);
    }
    case 'update': {
      payload.updates.forEach(({ type, data, id }) => {
        state = updateKeyPath(state, [type, ...id.split('-')], data);
      })
      return state;
    }
    case types.RESET_STATE: {
      return initialState;
    }
    default:
      return state
  }
}