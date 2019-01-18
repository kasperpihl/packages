import { fromJS } from 'immutable';
import * as types from '../constants';

const initialState = fromJS({});

export default function cacheReducer(state = initialState, action) {
  const { payload, type } = action;

  switch (type) {
    case types.CACHE_SAVE: {
      if (payload.data && payload.data.archived) return state;
      return state.setIn(payload.path, fromJS(payload.data));
    }
    case types.CACHE_SAVE_BATCH: {
      payload.data.forEach(d => {
        state = state.setIn([...payload.path, d.id], fromJS(d));
      });
      return state;
    }
    case types.CACHE_CLEAR: {
      return state.deleteIn(payload.path);
    }
    case 'update': {
      payload.updates.forEach(({ type, data }) => {
        // const path = data.id.split("-");
        // path[path.length - 1] = data.id;
        // const currentVal = state.getIn([type, ...path]);
        // // Ensure latest value wins!
        // if (!currentVal || currentVal.get("updated_at") < data.updated_at) {
        //   if (data.archived) {
        //     state = state.deleteIn([type, ...path]);
        //   } else {
        //     state = state.setIn([type, ...path], fromJS(data));
        //   }
        // }
      });
      return state;
    }
    case types.RESET_STATE: {
      return initialState;
    }
    default:
      return state;
  }
}
