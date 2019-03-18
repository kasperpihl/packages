import userGet from './userGet';

export default (userId, organizationId) => {
  const user = userGet(userId, organizationId);

  if (!user) {
    return undefined;
  }

  return user.getIn(['photo']);
};
