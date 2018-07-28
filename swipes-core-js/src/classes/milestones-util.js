import { fromJS } from 'immutable';

export default class MilestonesUtil {

  constructor(milestone, myId) {
    this.milestone = milestone;
    this.id = myId;
  }

  getId() {
    return this.milestone.get('id');
  }

  getLastActivity() {
    return this.milestone.get('history').last();
  }
  getLastActivityByType(type) {
    return this.milestone.get('history').findLast((a) => a.get('type') === type);
  }
}
