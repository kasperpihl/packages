import { createSelector } from 'reselect';
import createCachedSelector from 're-reselect';
import { search as searchGoals } from './goals';
import { search as searchMilestones } from './milestones';
import { search as searchPosts } from './posts';


const getSearchString = (state, props) => props.searchString;
const getState = state => state;

export const search = createCachedSelector(
  [getSearchString, searchGoals, searchMilestones, searchPosts],
  (searchString, foundGoals, foundMilestones, foundPosts) => {
    if (!searchString || !searchString.length) {
      return null;
    }
    return foundGoals.concat(foundMilestones).concat(foundPosts).sort(
      (a, b) => ((a.score > b.score) ? 1 : ((b.score > a.score) ? -1 : 0)),
    );
  },
)(
  (state, props) => getSearchString(state, props) || '',
);
