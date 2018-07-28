import {
  string,
  array,
} from 'valjs';

import * as a from './';
import { valAction } from '../classes/utils';

export const create = valAction('goals.create', [
  string.min(1).max(155).require(),
  string,
  array.of(string),
], (title, milestoneId, assignees) => (d, getState) => d(a.api.request('goals.create', {
  goal: {
    title,
    assignees: assignees || [],
  },
  milestone_id: milestoneId,
  organization_id: getState().me.getIn(['organizations', 0, 'id']),
})));


export const loadWay = valAction('goals.loadWay', [
  string.require(),
  string.require(),
], (goalId, wayId) => d => d(a.api.request('goals.loadWay', {
  goal_id: goalId,
  way_id: wayId,
})));

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


export const attachmentsReorder = valAction('goals.attachmentsReorder', [
  string.require(),
  array.of(string).require(),
], (goalId, attachmentOrder) => d => d(a.api.request('attachments.reorder', {
  target_id: goalId,
  attachment_order: attachmentOrder,
})));

export const stepsReorder = (goalId, stepOrder) => a.api.request('goals.stepsReorder', {
  goal_id: goalId,
  step_order: stepOrder,
});

