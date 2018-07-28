import * as a from './';

export const add = (goalId, title, assignees) => a.api.request('steps.add', {
  goal_id: goalId,
  step: {
    title,
    assignees: assignees || [],
  },
});

export const assign = (goalId, stepId, assignees) => a.api.request('steps.assign', {
  goal_id: goalId,
  step_id: stepId,
  assignees,
});

export const rename = (goalId, stepId, title) => a.api.request('steps.rename', {
  goal_id: goalId,
  step_id: stepId,
  title,
});

export const remove = (goalId, stepId) => a.api.request('steps.delete', {
  goal_id: goalId,
  step_id: stepId,
});