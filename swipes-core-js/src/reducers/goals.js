import { fromJS, Map } from 'immutable';
import { reducerInitToMap } from '../classes/utils';
import * as types from '../constants';

const initialState = fromJS({});

export default function goalsReducer(state = initialState, action) {
  const {
    type,
    payload,
  } = action;

  switch (type) {
    case 'init': {
      let goals = reducerInitToMap(payload, 'goals', state);

      const stars = payload.me.settings.starred_goals;
      goals = goals.map(g => g.set('starred', stars.indexOf(g.get('id')) > -1));
      return goals;
    }
    case 'milestones.close':
    case 'milestone_closed': {
      if (payload.goal_ids) {
        payload.goal_ids.forEach((id) => {
          state = state.setIn([id, 'milestone_id'], null);
        });
      }
      return state;
    }
    case 'goal_renamed':
    case 'goals.rename': {
      if (state.getIn([payload.goal_id, 'title']) === payload.title) {
        return state;
      }
      return state.setIn([payload.goal_id, 'title'], payload.title);
    }
    case 'goals.assign':
    case 'goal_assigned': {
      if(payload.steps) {
        state = state.setIn([payload.goal_id, 'steps'], fromJS(payload.steps));
      }
      return state.setIn([payload.goal_id, 'assignees'], fromJS(payload.assignees));

    }
    case 'goals.loadWay':
    case 'goal_loaded_way':
    case 'goals.complete':
    case 'goal_completed':
    case 'goals.incomplete':
    case 'goal_incompleted':
    case 'goals.completeStep':
    case 'goals.incompleteStep':
    case 'step_completed':
    case 'step_incompleted':
    case 'goal_notify':
    case 'goals.notify': {
      return state.mergeIn([payload.goal.id], payload.goal);
    }
    case 'step_added':
    case 'steps.add': {
      if (state.getIn([payload.goal_id, 'steps', payload.step.id])) {
        return state;
      }
      if(payload.goal_assignees) {
        state = state.setIn([payload.goal_id, 'assignees'], fromJS(payload.goal_assignees));
      }
      if (typeof payload.completed_at !== 'undefined') {
        state = state.setIn([payload.goal_id, 'completed_at'], payload.completed_at);
      }
      state = state.setIn([payload.goal_id, 'step_order'], fromJS(payload.step_order));
      return state.setIn([payload.goal_id, 'steps', payload.step.id], fromJS(payload.step));
    }
    case 'step_deleted':
    case 'steps.delete': {
      if (!state.getIn([payload.goal_id, 'steps', payload.step_id])) {
        return state;
      }
      if (typeof payload.completed_at !== 'undefined') {
        state = state.setIn([payload.goal_id, 'completed_at'], payload.completed_at);
      }
      return state.updateIn([payload.goal_id], (g) => {
        g = g.updateIn(['step_order'], s => s.filter(id => id !== payload.step_id));
        return g.setIn(['steps', payload.step_id, 'deleted'], true);
      });
    }
    case 'step_renamed':
    case 'steps.rename': {
      if (state.getIn([payload.goal_id, 'steps', payload.step_id, 'title']) === payload.title) {
        return state;
      }
      return state.setIn([payload.goal_id, 'steps', payload.step_id, 'title'], payload.title);
    }
    case 'step_assigned':
    case 'steps.assign': {
      if(payload.goal_assignees) {
        state = state.setIn([payload.goal_id, 'assignees'], fromJS(payload.goal_assignees));
      }
      return state.setIn([
        payload.goal_id, 'steps', payload.step_id, 'assignees',
      ], fromJS(payload.assignees));
    }
    case 'goals.stepsReorder':
    case 'step_reordered': {
      return state.setIn([payload.goal_id, 'step_order'], fromJS(payload.step_order));
    }

    case 'attachments.reorder':
    case 'attachment_reordered': {
      if(payload.target_id.startsWith('G')) {
        return state.setIn([payload.target_id, 'attachment_order'], fromJS(payload.attachment_order));
      }
      return state;
    }

    case 'goal_archived':
    case 'goals.archive': {
      if (!state.get(payload.goal_id)) {
        return state;
      }
      return state.delete(payload.goal_id);
    }
    case 'goals.create':
    case 'goal_created': {
      if (state.get(payload.id)) {
        return state;
      }
      return state.mergeIn([payload.goal.id], fromJS(payload.goal));
    }
    case 'history_updated': {
      return state.updateIn([payload.target.id], (g) => {
        const hIndex = payload.target.history_index;
        if (!g || !g.getIn(['history', hIndex])) return g;
        return g.setIn(['history', hIndex], fromJS(payload.changes));
      });
    }
    case 'files.upload':
    case 'attachments.add':
    case 'attachment_added': {
      return state.updateIn([payload.target_id], (g) => {
        const aId = payload.attachment.id;
        if (!g || g.getIn(['attachments', aId])) return g;
        g = g.set('attachment_order', fromJS(payload.attachment_order));
        return g.setIn(['attachments', aId], fromJS(payload.attachment));
      });
    }
    case 'attachments.rename':
    case 'attachment_renamed': {
      return state.updateIn([payload.target_id], (g) => {
        const aId = payload.attachment_id;
        if (!g || g.getIn(['attachments', aId, 'title']) === payload.title) return g;
        return g.setIn(['attachments', aId, 'title'], payload.title);
      });
    }
    case 'attachment_deleted':
    case 'attachments.delete': {
      return state.updateIn([payload.target_id], (g) => {
        const aId = payload.attachment_id;
        if (!g || g.getIn(['attachments', aId, 'deleted'])) return g;
        g = g.updateIn(['attachment_order'], ao => ao.filter(id => id !== aId));
        return g.setIn(['attachments', aId, 'deleted'], true);
      });
    }
    case 'milestones.removeGoal':
    case 'milestone_goal_removed': {
      return state.setIn([payload.goal_id, 'milestone_id'], null);
    }
    case 'milestones.addGoal':
    case 'milestone_goal_added': {
      return state.setIn([payload.goal_id, 'milestone_id'], payload.milestone_id);
    }
    case 'milestones.delete':
    case 'milestone_deleted': {
      if(payload.goal_ids) {
        payload.goal_ids.forEach(gId => {
          if (state.get(gId)) {
            state = state.delete(gId);
          }
        });
      }
      return state;
    }
    case 'me.updateSettings':
    case 'settings_updated': {
      const stars = payload.settings.starred_goals;
      if (stars) {
        return state.map(g => g.set('starred', stars.indexOf(g.get('id')) > -1));
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
