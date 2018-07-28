import { List, Set } from 'immutable';
import MilestonesUtil from '../classes/milestones-util';
import { timeAgo } from '../utils/time/timeAgo';

export default class Milestones {
  constructor(store, parent) {
    this.store = store;
    this.parent = parent;
  }
  getMilestone(milestone) {
    if (typeof milestone === 'string') {
      const { milestones } = this.store.getState();
      return milestones.get(milestone);
    }
    return milestone;
  }
  getName(milestoneId) {
    if (milestoneId === 'none') {
      return 'No plan';
    }
    const milestone = this.getMilestone(milestoneId);
    if (milestone) {
      return milestone.get('title');
    }
    return 'Any plan';
  }
  getAssignees(milestoneId) {
    let goals = this.getGoals(milestoneId);
    if(milestoneId === 'none') {
      goals = this.store.getState().goals.filter(g => !g.get('milestone_id'));
    }
    if(!goals) {
      return List();
    }
    let all = new Set();
    goals.forEach((goal) => {
      const assignees = this.parent.goals.getAssignees(goal);
      all = all.union(assignees);
    });
    
    return all.toList();
  }
  getStatusForGoalId(milestoneId, goalId) {
    const milestone = this.getMilestone(milestoneId);
    let status = 'now';
    if(milestone) {
      milestone.get('goal_order').forEach((goals, label) => {
        if(goals.contains(goalId)) {
          status = label;
        }
      })
    }
    return status;
  }

  getRelatedFilter(milestoneId) {
    const milestone = this.getMilestone(milestoneId);
    if(!milestone) {
      return [];
    }
    return this.getGoalIds(milestone).toJS()

  }
  getGoalIds(milestoneId, overrideGoals) {
    const milestone = this.getMilestone(milestoneId);
    if(!milestone) {
      return List();
    }
    return milestone.getIn(['goal_order', 'later']).concat(
                  milestone.getIn(['goal_order', 'now'])).concat(
                  milestone.getIn(['goal_order', 'done']))
  }
  getGoals(milestoneId, overrideGoals) { 
    const state = this.store.getState();
    const goals = overrideGoals || state.goals;
    return this.getGoalIds(milestoneId, overrideGoals).map(gId => goals.get(gId));
  }
}
