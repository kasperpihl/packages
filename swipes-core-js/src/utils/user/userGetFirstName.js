import userGet from './userGet';

export default userId => {
  const user = this.userGet(userId);
  if (!user) {
    return undefined;
  }
  const firstName = user.getIn(['profile', 'first_name']) || '';
  return firstName
    .split(' ')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
};
