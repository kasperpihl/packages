import userGet from './userGet';

export default (userId, size) => {
  const sizes = [192, 96, 64];
  if (sizes.indexOf(size) === -1) {
    size = 192;
  }
  const sizeString = `${size}x${size}`;

  const user = userGet(userId);
  if (!user) {
    return undefined;
  }
  return user.getIn(['profile', 'photos', sizeString]);
};
