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
        state = state.setIn(
          [...payload.path, d[payload.idAttribute]],
          fromJS(d)
        );
      });
      return state;
    }
    case types.CACHE_CLEAR: {
      return state.deleteIn(payload.path);
    }
    case 'update': {
      const { type, data } = payload;
      if (type === 'discussion') {
        if (data.deleted) {
          state = state.deleteIn(['discussion', data.discussion_id]);
          state = state.deleteIn(['comment', data.discussion_id]);
        } else {
          state = state.mergeIn(
            ['discussion', data.discussion_id],
            fromJS(data)
          );
        }
      }
      if (type === 'comment') {
        state = state.mergeIn(
          ['comment', data.discussion_id, data.comment_id],
          fromJS(data)
        );
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
