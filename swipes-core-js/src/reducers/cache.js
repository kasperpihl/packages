import { fromJS } from 'immutable';
import * as types from '../constants';

const initialState = fromJS({});

export default function cacheReducer (state = initialState, action) {
  const {
    payload,
    type,
  } = action;

  switch (type) {
    case types.CACHE_SAVE: {
      return state.setIn(payload.path, payload.data);
    }
    case types.CACHE_SAVE_BATCH: {
      payload.data.forEach((d) => {
        state = state.setIn([...payload.path, d.id], fromJS(d));
      })
      return state;
    }
    case types.CACHE_CLEAR: {
      return state.deleteIn(payload.path);
    }
    case 'update': {
      payload.updates.forEach(({ type, data }) => {
        const path = data.id.split('-');
        path[path.length - 1] = data.id;
        state = state.mergeIn([type, ...path], data);
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