import storeGet from '../store/storeGet';

export default (user, organizationId) => {
  if (typeof user === 'string') {
    const me = storeGet().getState().me;
    // Support Personal stuff
    if (user === 'me' || organizationId === me.get('user_id')) {
      return me;
    }

    return storeGet()
      .getState()
      .organizations.getIn([organizationId, 'users', user]);
  }
  return user;
};
