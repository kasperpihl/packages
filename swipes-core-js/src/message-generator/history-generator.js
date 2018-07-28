import { Map, List } from 'immutable';
import GoalsUtil from '../classes/goals-util';

export default class HistoryGenerator {
  constructor(store, parent) {
    this.store = store;
    this.parent = parent;
  }
  _getGoal(goalId) {
    return this.store.getState().goals.get(goalId);
  }
  _getHelper(goalId) {
    const me = this.store.getState().me;
    const goal = this._getGoal(goalId);
    return new GoalsUtil(goal, me.get('id'));
  }
  getNotificationWrapperForHistory(id, h, options) {
    let def = {
      icon: true,
      doneAt: true,
      title: true,
      subtitle: true,
      attachments: true,
      message: true,
    };
    def = Object.assign(def, options);

    const helper = this._getHelper(id);
    return Map({
      doneAt: def.doneAt ? h.get('done_at') : null,
      title: def.title ? this.getTitle(helper.getId(), h) : null,
      subtitle: def.subtitle ? this.getSubtitle(helper.getId(), h) : null,
      userId: h.get('done_by'),
      message: def.message ? h.get('message') : null,
      icon: def.icon ? this.getIcon(h) : null,
      attachments: def.attachments ? this.getAttachments(helper.getId(), h) : null,
    });
  }
  getTitle(id, h) {
    const me = this.store.getState().me;
    let from = this.parent.users.getName(h.get('done_by'));
    from = from.charAt(0).toUpperCase() + from.slice(1);
    const helper = this._getHelper(id);

    switch (h.get('type')) {
      case 'goal_created':
        return `${from} kicked off this goal`;
      case 'goal_completed':
        return `${from} completed this goal`;
      case 'goal_incompleted':
        return `${from} incompleted this goal`;

      case 'goal_archived':
        return `${from} archived this goal`;
      case 'step_incompleted': {
        const step = helper.getStepById(h.get('step_id'));
        if (step) {
          return `${from} incompleted '${step.get('title')}'`;
        }
        return `${from} incompleted a step`;
      }
      case 'step_completed': {
        const step = helper.getStepById(h.get('step_id'));
        if (step) {
          return `${from} completed '${step.get('title')}'`;
        }
        return `${from} completed a step`;
      }

      case 'goal_notify': {
        const yourself = h.get('done_by') === me.get('id');
        // console.log(h.get('assignees') && h.get('assignees').toJS());
        const to = this.parent.users.getNames(h.get('assignees') || List([me.get('id')]), {
          yourself,
          number: 1,
        });
        const type = h.get('notification_type') || h.getIn(['meta', 'notification_type']);
        if (h.get('request')) {
          if (type === 'update') return `${from} asked ${to} for an update`;
          else if (type === 'feedback') return `${from} asked ${to} for feedback`;
          else if (type === 'assets') return `${from} asked ${to} for assets`;
          else if (type === 'decision') return `${from} asked ${to} for a decision`;
        }
        if (type === 'update') return `${from} gave ${to} an update`;
        else if (type === 'feedback') return `${from} gave ${to} feedback`;
        else if (type === 'assets') return `${from} gave ${to} assets`;
        else if (type === 'decision') return `${from} gave ${to} a decision`;

        return `${from} wrote ${to}`;
      }
      case 'milestone_added': {
        return `${from} added the milestone "${msgGen.milestones.getName(h.get('milestone_id'))}"`;
      }
      case 'milestone_removed': {
        return `${from} removed the milestone "${msgGen.milestones.getName(h.get('milestone_id'))}"`;
      }
      default:
        return h.get('type');
    }
  }

  getSubtitle(id, h) {
    const helper = this._getHelper(id);
    switch (h.get('type')) {
      case 'step_completed': {
        const stepTitle = helper.getStepTitleFromId(h.get('to'));
        const fromStepTitle = helper.getStepTitleFromId(h.get('from'));
      }
      default:
        return undefined;
    }
  }
  getAttachments(id, h) {
    const helper = this._getHelper(id);
    return helper.getAttachmentsForFlags(h.get('flags'));
  }
  getIcon(h) {
    switch (h.get('type')) {
      case 'goal_created':
        return 'Plus';

      case 'goal_completed':
        return 'Star';

      case 'goal_archived':
        return 'Archive';

      case 'step_completed':
        return 'ActivityCheckmark';
      case 'step_incompleted':
        return 'Iteration';

      case 'goal_notify':
        switch (h.get('notification_type') || h.getIn(['meta', 'notification_type'])) {
          case 'update': return 'Status';
          case 'feedback': return 'Feedback';
          case 'assets': return 'Assets';
          case 'decision': return 'Decision';
          default: return 'GotNotified';
        }


      default:
        return 'GotNotified';
    }
  }
}
