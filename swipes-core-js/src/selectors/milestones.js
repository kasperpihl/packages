import { createSelector } from 'reselect';
import { List } from 'immutable';
import GoalsUtil from '../classes/goals-util';
import { searchSelectorFromKeys } from '../classes/utils';

const getMilestone = (state, props) => state.milestones.get(props.milestoneId);
const getAllGoals = state => state.goals;
const getMilestones = state => state.milestones;

export const getGoals = createSelector(
  [getMilestone, getAllGoals],
  (milestone, goals) => {
    if (!milestone) {
      return List();
    }
    return msgGen.milestones.getGoals(milestone, goals);
  },
);

export const getGroupedGoals = createSelector(
  [getMilestone, getAllGoals],
  (m, goals) => m.get('goal_order').map(l => l.map(gId => goals.get(gId))),
);

export const getGrouped = createSelector(
  [getMilestones],
  (milestones) => {
    let gm = milestones.sort((a, b) => {
      if (a.get('closed_at') && b.get('closed_at')) {
        return b.get('closed_at').localeCompare(a.get('closed_at'));
      } else if (a.get('closed_at') || b.get('closed_at')) {
        return a.get('closed_at') ? 1 : -1;
      }
      return b.get('created_at').localeCompare(a.get('created_at'));
    }).groupBy(m => (m.get('closed_at') ? 'Achieved' : 'Current Milestones'));
    gm = gm.set('Achieved', gm.get('Achieved') || List());
    gm = gm.set('Current plans', gm.get('Current Milestones') || List());
    return gm;
  },
);

export const getCurrent = createSelector(
  [getMilestones],
  milestones => milestones.filter(m => !m.get('closed_at')).sort((m1, m2) => msgGen.milestones.getName(m1).localeCompare(msgGen.milestones.getName(m2))),
);

export const search = searchSelectorFromKeys([
  'title',
], getMilestones);

export const searchCurrent = searchSelectorFromKeys([
  'title',
], getCurrent);
