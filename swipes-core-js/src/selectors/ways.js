import { createSelector } from 'reselect';
import { searchSelectorFromKeys } from '../classes/utils';

const getWays = state => state.ways;

export const getSorted = createSelector(
  [getWays],
  ways => ways.sort((b, c) => b.get('title').localeCompare(c.get('title'))),
);

export const search = searchSelectorFromKeys([
  'title',
  'description',
], getWays);
