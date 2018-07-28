import { createSelector } from 'reselect';
import * as cs from './';

const getAutoComplete = state => state.autoComplete;
const getState = state => state;

export const getResults = createSelector(
  [getAutoComplete, getState],
  (autoComplete, state) => {
    const types = autoComplete.getIn(['options', 'types']);
    if (types && types.indexOf('users') > -1) {
      return cs.users.autoComplete(state);
    }
    return [];
  },
);
