import * as ca from './';

export const create = payload => (dp, getState) => dp(ca.api.request('posts.create', {
  organization_id: getState().me.getIn(['organizations', 0, 'id']),
  ...payload,
}));

export const follow = payload => (dp, getState) => dp(ca.api.request('posts.follow', {
  ...payload,
}));

export const unfollow = payload => (dp, getState) => dp(ca.api.request('posts.unfollow', {
  ...payload,
}));

export const archive = payload => (dp, getState) => dp(ca.api.request('posts.archive', {
  ...payload,
}));

export const addComment = payload => (dp, getState) => dp(ca.api.request('posts.addComment', {
  ...payload,
}));

export const addReaction = payload => (dp, getState) => dp(ca.api.request('posts.addReaction', {
  ...payload,
}));

export const removeReaction = payload => (dp, getState) => dp(ca.api.request('posts.removeReaction', {
  ...payload,
}));

export const commentAddReaction = payload => (dp, getState) => dp(ca.api.request('posts.commentAddReaction', {
  ...payload,
}));

export const commentRemoveReaction = payload => (dp, getState) => dp(ca.api.request('posts.commentRemoveReaction', {
  ...payload,
}));
