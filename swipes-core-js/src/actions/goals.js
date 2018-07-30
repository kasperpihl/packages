import * as a from './';

export const create = (title, milestoneId, assignees) => a.api.request('goals.create', {
  goal: {
    title,
    assignees: assignees || [],
  },
  milestone_id: milestoneId,
});


export const loadWay = (goalId, wayId) => a.api.request('goals.loadWay', {
  goal_id: goalId,
  way_id: wayId,
});

export const rename = (goalId, title) => a.api.request('goals.rename', {
  goal_id: goalId,
  title,
});

export const assign = (goalId, assignees) => a.api.request('goals.assign', {
  goal_id: goalId,
  assignees,
});

export const notify = (gId, notification) => a.api.request('goals.notify', {
  goal_id: gId,
  ...notification.toJS(),
});

export const completeStep = (gId, sId) => a.api.request('goals.completeStep', {
  goal_id: gId,
  step_id: sId,
});

export const incompleteStep = (gId, sId) => a.api.request('goals.incompleteStep', {
  goal_id: gId,
  step_id: sId,
});

export const complete = gId => a.api.request('goals.complete', {
  goal_id: gId,
});

export const incomplete = gId => a.api.request('goals.incomplete', {
  goal_id: gId,
});

export const archive = goalId => a.api.request('goals.archive', { goal_id: goalId });


export const attachmentsReorder = (goalId, attachmentOrder) => a.api.request('attachments.reorder', {
  target_id: goalId,
  attachment_order: attachmentOrder,
});

export const stepsReorder = (goalId, stepOrder) => a.api.request('goals.stepsReorder', {
  goal_id: goalId,
  step_order: stepOrder,
});

