import { createSelector } from 'reselect';
import createCachedSelector from 're-reselect';
import { search as searchGoals } from './goals';
import { search as searchMilestones } from './milestones';

const getSearchString = (state, props) => props.searchString;
const getState = state => state;

export const search = createCachedSelector(
  [getSearchString, searchGoals, searchMilestones],
  (searchString, foundGoals, foundMilestones) => {
    if (!searchString || !searchString.length) {
      return null;
    }
    return foundGoals
      .concat(foundMilestones)
      .sort((a, b) => (a.score > b.score ? 1 : b.score > a.score ? -1 : 0));
  }
)((state, props) => getSearchString(state, props) || '');
