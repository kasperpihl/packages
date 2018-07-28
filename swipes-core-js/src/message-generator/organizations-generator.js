import moment from 'moment';

export default class Milestones {
  constructor(store, parent) {
    this.store = store;
    this.parent = parent;
  }
  isValid() {
    const org = this.store.getState().me.getIn(['organizations', 0]);
    if(org) {
      const now = moment();
      const endingAt = org.getIn(['trial', 'ending_at']);
      if(endingAt.diff(now, 'days') < 0) {
        return false;
      }
    }
    return true;
  }
  getDaysLeft() {
    const org = this.store.getState().me.getIn(['organizations', 0]);
    if(org && org.get('trial')) {
      const now = moment();
      const trial = org.get('trial');
      const endingAt = moment(trial.get('ending_at'));
      return endingAt.diff(now, 'days');
    }
    return undefined;
  }
}
