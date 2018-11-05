import userGet from './userGet';

export default userId => {
  const user = userGet(userId);
  if (!user) {
    return undefined;
  }
  const lastName = user.getIn(['profile', 'last_name']) || '';
  return lastName
    .split(' ')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
};
