import {
  string,
} from 'valjs';

import * as a from './';
import { valAction } from '../classes/utils';

export const create = valAction('milestones.create', [
  string.min(1).max(155).require(),
], title => (d, getState) => d(a.api.request('milestones.create', {
  organization_id: getState().me.getIn(['organizations', 0, 'id']),
  title,
  restricted: false,
})));

export const addGoal = valAction('milestones.addGoal', [
  string.require(),
  string.require(),
], (milestoneId, goalId) => (d, getState) => {
  const currentMilestoneId = getState().goals.getIn([goalId, 'milestone_id']);
  return d(a.api.request('milestones.addGoal', {
    goal_id: goalId,
    current_milestone_id: currentMilestoneId,
    milestone_id: milestoneId,
    organization_id: getState().me.getIn(['organizations', 0, 'id']),
  }));
});

export const removeGoal = valAction('milestones.removeGoal', [
  string.require(),
  string.require(),
], (milestoneId, goalId) => (d, getState) => d(a.api.request('milestones.removeGoal', {
  goal_id: goalId,
  milestone_id: milestoneId,
  organization_id: getState().me.getIn(['organizations', 0, 'id']),
})));

export const reorderGoals = (milestoneId, goalId, destination, position) => a.api.request('milestones.goalsReorder', {
  milestone_id: milestoneId,
  goal_id: goalId,
  destination,
  position,
});

export const rename = valAction('milestones.rename', [
  string.require(),
  string.require(),
], (milestoneId, title) => (d, getState) => d(a.api.request('milestones.rename', {
  milestone_id: milestoneId,
  title,
  organization_id: getState().me.getIn(['organizations', 0, 'id']),
})));

export const deleteMilestone = valAction('milestones.delete', [
  string.require(),
], milestoneId => (d, getState) => d(a.api.request('milestones.delete', {
  organization_id: getState().me.getIn(['organizations', 0, 'id']),
  milestone_id: milestoneId,
})));

export const open = valAction('milestones.open', [
  string.require(),
], milestoneId => (d, getState) => d(a.api.request('milestones.open', {
  organization_id: getState().me.getIn(['organizations', 0, 'id']),
  milestone_id: milestoneId,
})));

export const close = valAction('milestones.close', [
  string.require(),
], milestoneId => (d, getState) => d(a.api.request('milestones.close', {
  organization_id: getState().me.getIn(['organizations', 0, 'id']),
  milestone_id: milestoneId,
})));
