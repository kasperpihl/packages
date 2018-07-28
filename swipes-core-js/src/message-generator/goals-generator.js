import moment from 'moment';
import { List } from 'immutable';
import GoalsUtil from '../classes/goals-util';
import timeAgo from '../utils/time/timeAgo';

export default class Goals {
  constructor(store, parent) {
    this.store = store;
    this.parent = parent;
  }
  getGoal(goal) {
    if (typeof goal === 'string') {
      return this.store.getState().goals.get(goal);
    }
    return goal;
  }
  getRelatedFilter(goalId) {
    const goal = this.getGoal(goalId);
    if (!goal) {
      return [];
    }
    const helper = new GoalsUtil(goal);

    return helper.getOrderedAttachments().toList().filter(
      a => a && a.getIn(['link', 'service', 'name']) === 'swipes' && a.getIn(['link', 'service', 'type']) === 'note',
    ).map(a => a.getIn(['link', 'service', 'id']))
      .toJS();
  }
  getStatus(goalId) {
    const goal = this.getGoal(goalId);
    if (!goal) {
      return 'now';
    }
    if (goal.get('milestone_id')) {
      return this.parent.milestones.getStatusForGoalId(goal.get('milestone_id'), goal.get('id'));
    }
    const helper = new GoalsUtil(goal);
    return helper.getIsCompleted() ? 'done' : 'now';
  }
  getAssignees(goalId) {
    const goal = this.getGoal(goalId);
    if (!goal) {
      return List([]);
    }
    const helper = new GoalsUtil(goal);
    return helper.getAssignees();
  }
}
