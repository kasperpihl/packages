import * as ca from './';

export const complete = (id) => (d, getState) => {
  const orgOnboarding = getState().me.getIn(['settings', 'onboarding']);
  let onboarding = orgOnboarding;
  onboarding = onboarding.updateIn(['completed'], (completed) => {
    if(!completed.get(id)){
      completed = completed.set(id, true);
    }
    return completed;
  });
  if(onboarding !== orgOnboarding) {
    if(window.delegate && typeof window.delegate.sendEvent === 'function'){
      window.delegate.sendEvent('Onboarding step completed', {
        Type: id,
      });
    }
    d(ca.me.updateSettings({ onboarding: onboarding.toJS() }));
  }
}
