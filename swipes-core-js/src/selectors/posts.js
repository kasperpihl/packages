import { createSelector } from 'reselect';
import { searchSelectorFromKeys } from '../classes/utils';

const getRelatedFilter = (state, props) => props.relatedFilter;
const getContext = (state, props) => props.context;
const getPosts = state => state.posts;

export const getSorted = createSelector(
  [getPosts],
  posts => posts.toList().sort((a, b) => b.get('created_at').localeCompare(a.get('created_at'))),
);

export const makeGetRelatedList = () => createSelector(
  [getSorted, getRelatedFilter],
  (posts, fs) => posts.filter(p => (fs && fs.indexOf(p.getIn(['context', 'id'])) > -1)),
);

export const makeGetFilteredList = () => createSelector(
  getSorted,
  getContext,
  (posts, context) => {
    if (context && context.id) {
      return posts.filter(p => p.getIn(['context', 'id']) === context.id);
    } else if (context && context.get('id')) {
      return posts.filter(p => p.getIn(['context', 'id']) === context.get('id'));
    }
    return posts;
  },
);
/*

*/

export const searchablePosts = createSelector(
  [getPosts],
  posts => posts.map(p => p.set('comments', p.get('comments').toList())).toList(),
);

export const search = searchSelectorFromKeys([
  'message',
  'comments.message',
  'attachments.title',
  'comments.attachments.title',
], searchablePosts);
