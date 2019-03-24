import userGet from './userGet';

export default (userId, teamId, size) => {
  const sizes = [192, 96, 64];
  if (sizes.indexOf(size) === -1) {
    size = 192;
  }

  const sizeString = `${size}x${size}`;

  const user = userGet(userId, teamId);
  if (!user) {
    return undefined;
  }

  return user.getIn(['photo', sizeString]);
};
