import storeGet from '../store/storeGet';

export default (user, teamId) => {
  if (typeof user === 'string') {
    const me = storeGet().getState().me;
    // Support Personal stuff
    if (user === 'me' || teamId === me.get('user_id')) {
      return me;
    }

    return storeGet()
      .getState()
      .teams.getIn([teamId, 'users', user]);
  }
  return user;
};
