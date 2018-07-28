import { fromJS } from 'immutable';

export default class GoalsUtil {
  constructor(goal, myId) {
    this.goal = goal;
    this.id = myId;
  }
  updateGoal(goal) {
    this.goal = goal;
  }

  getId() {
    return this.goal.get('id');
  }

  // ======================================================
  // Get stepIndex
  // ======================================================
  getStepIndexForId(id) {
    return this.goal.get('step_order').findKey(v => (v === id));
  }

  getStepOrder() {
    return this.goal.get('step_order');
  }

  // ======================================================
  // Get step
  // ======================================================

  getStepByIndex(index) {
    if (!this.goal) {
      return undefined;
    }
    const id = this.goal.getIn(['step_order', index]);
    return this.getStepById(id);
  }
  getStepById(id) {
    if (!this.goal) {
      return undefined;
    }
    return this.goal.getIn(['steps', id]);
  }
  getIsStepCompleted(s) {
    if (typeof s === 'string') {
      s = this.goal.getIn(['steps', s]);
    }
    return s.get('completed_at');
  }
  getIsCompleted() {
    return !!(this.goal && this.goal.get('completed_at')) || false;
  }
  getCompletedBy() {
    return !!(this.goal && this.goal.get('completed_by')) || false;
  }
  amIAssigned() {
    const step = this.getCurrentStep();
    if (!step) {
      return false;
    }
    return !!step.get('assignees').find(a => (a === this.id));
  }
  getNewStepOrder(oldIndex, newIndex) {
    const movedId = this.goal.getIn(['step_order', oldIndex]);
    return this.goal.get('step_order').delete(oldIndex).insert(newIndex, movedId);
  }
  getOrderedSteps() {
    return this.goal.get('step_order').map(id => this.goal.getIn(['steps', id]));
  }
  getAttachmentById(id) {
    if (!this.goal) {
      return undefined;
    }
    return this.goal.getIn(['attachments', id]);
  }
  getAttachmentOrder() {
    return this.goal.get('attachment_order');
  }
  getOrderedAttachments() {
    return this.getAttachmentOrder().map(id => this.goal.getIn(['attachments', id]));
  }
  getAttachmentsForFlags(flags) {
    flags = fromJS(flags || []);
    return flags.map(fId => (this.goal.getIn(['attachments', fId]))).filter(v => !!v);
  }
  getNumberOfCompletedSteps() {
    if (this.getIsCompleted()) {
      return this.goal.get('step_order').size;
    }
    let numberOfCompleted = 0;
    this.getOrderedSteps().forEach((s) => {
      if (this.getIsStepCompleted(s)) {
        numberOfCompleted += 1;
      }
    });
    return numberOfCompleted;
  }
  getNumberOfSteps() {
    if (!this.goal) {
      return undefined;
    }
    return this.goal.get('step_order').size;
  }
  getStepTitleFromId(id) {
    return this.goal.getIn(['steps', id, 'title']);
  }
  getAssignees() {
    return this.goal.get('assignees') || fromJS([]);
  }
  getAssigneesButMe() {
    return this.getAssignees().filter(aId => aId !== this.id);
  }
  getAssigneesForStepId(id) {
    const stepIndex = this.getStepIndexForId(id);
    return this.getAssigneesForStepIndex(stepIndex);
  }
  getAssigneesForStepIndex(i) {
    const step = this.getStepByIndex(i);
    if (!step) {
      return fromJS([]);
    }
    return step.get('assignees');
  }
  getActivityByIndex(index) {
    return this.goal.getIn(['history', index]);
  }
  getLastActivity() {
    return this.goal.get('history').last();
  }
  getLastActivityByType(type) {
    return this.goal.get('history').findLast(a => a.get('type') === type);
  }
  getLastActivityIndex() {
    return this.goal.get('history').size - 1;
  }
  hasIRepliedToHistory(hE) {
    const history = this.goal.get('history');
    const index = history.findIndex(h => h.get('group_id') === hE.get('group_id'));
    return history.find(h => h.get('reply_to') === index);
  }
  getObjectForWay() {
    return {
      title: this.goal.get('title'),
      assignees: this.goal.get('assignees'),
      steps: this.goal.get('steps').map(g => g.delete('completed_at')).filter(g => this.goal.get('step_order').includes(g.get('id'))),
      step_order: this.goal.get('step_order'),
      attachments: this.goal.get('attachments'),
      attachment_order: this.goal.get('attachment_order'),
    };
  }
}
