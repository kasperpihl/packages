import { fromJS } from 'immutable';
import * as types from '../constants';
import { reducerInitToMap } from '../classes/utils';

const initialState = fromJS({});

export default function posts(state = initialState, action) {
  const { payload, type } = action;
  switch (action.type) {
    case 'init': {
      return reducerInitToMap(payload, 'posts', state);
    }
    case 'post_created':
    case 'posts.create': {
      if (state.get(payload.post.id)) {
        return state;
      }
      return state.mergeIn([payload.post.id], fromJS(payload.post));
    }
    case 'post_followed':
    case 'posts.follow': {
      const {
        post_id,
        user_id,
      } = payload;

      if (!state.get(post_id)) {
        return state;
      }

      return state.updateIn([post_id, 'followers'], followers => followers.insert(0, user_id));
    }
    case 'post_unfollowed':
    case 'posts.unfollow': {
      const {
        post_id,
        user_id,
      } = payload;

      if (!state.get(post_id)) {
        return state;
      }

      return state.updateIn([post_id, 'followers'], followers => followers.filter(f => f !== user_id));
    }
    case 'post_archived':
    case 'posts.archive': {
      if (!state.get(payload.post_id)) {
        return state;
      }
      return state.delete(payload.post_id);
    }
    case 'post_comment_added':
    case 'posts.addComment': {
      const { post_id, comment } = payload;

      if (!state.get(post_id)) {
        return state;
      }

      return state.setIn([post_id, 'comments', comment.id], fromJS(comment));
    }
    case 'posts.addReaction':
    case 'post_reaction_added': {
      const { post_id, reaction } = payload;
      if (!state.get(post_id)) {
        return state;
      }
      return state.updateIn([post_id, 'reactions'], reactions => reactions.filter(r => r.get('created_by') !== reaction.created_by).insert(0, fromJS(reaction)));
    }
    case 'posts.removeReaction':
    case 'post_reaction_removed': {
      const { post_id, user_id } = payload;
      if (!state.get(post_id)) {
        return state;
      }
      return state.updateIn([post_id, 'reactions'], reactions => reactions.filter(r => r.get('created_by') !== payload.user_id));
    }
    case 'posts.commentAddReaction':
    case 'post_comment_reaction_added': {
      const { post_id, reaction, comment_id } = payload;
      if (!state.get(post_id)) {
        return state;
      }
      return state.updateIn([post_id, 'comments', comment_id, 'reactions'], reactions => reactions.filter(r => r.get('created_by') !== reaction.created_by).insert(0, fromJS(reaction)));
    }
    case 'posts.commentRemoveReaction':
    case 'post_comment_reaction_removed': {
      const { post_id, user_id, comment_id } = payload;

      if (!state.get(post_id)) {
        return state;
      }
      return state.updateIn([post_id, 'comments', comment_id, 'reactions'], reactions => reactions.filter(r => r.get('created_by') !== payload.user_id));
    }
    case types.RESET_STATE: {
      return initialState;
    }
    default:
      return state;
  }
}
