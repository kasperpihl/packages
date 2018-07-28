import { fromJS } from 'immutable';

const initialState = fromJS({});

export default function globals(state = initialState, action) {
  const { payload, type } = action;
  switch (type) {
    case 'UPDATE_API_HEADERS': {
      return state.mergeIn(['apiHeaders'], payload);
    }
    default: {
      return state;
    }
  }
}
