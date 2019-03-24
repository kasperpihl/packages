import { fromJS } from 'immutable';
import * as types from '../constants';

const initialState = fromJS({});

export default function teamsReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case 'me.init': {
      let newState = initialState;
      payload.teams.forEach(team => {
        newState = newState.set(team.team_id, fromJS(team));
      });
      payload.users.forEach(user => {
        newState = newState.setIn(
          [user.team_id, 'users', user.user_id],
          fromJS(user)
        );
      });
      return newState;
    }
    case 'update': {
      const { type, data } = payload;
      if (type === 'team') {
        if (data.deleted) {
          return state.delete(data.team_id);
        }
        if (!state.get(data.team_id)) {
          data.users = {};
        }
        return state.mergeIn([data.team_id], fromJS(data));
      }
      if (type === 'team_user') {
        return state.mergeIn(
          [data.team_id, 'users', data.user_id],
          fromJS(data)
        );
      }
      if (type === 'me') {
        let newState = state;
        state.forEach(team => {
          if (team.getIn(['users', data.user_id])) {
            newState = state.mergeIn(
              [team.get('team_id'), 'users', data.user_id],
              fromJS(data)
            );
          }
        });
        return newState;
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
