import userGet from './userGet';

export default (userId, teamId) => {
  const user = userGet(userId, teamId);
  if (!user) {
    return undefined;
  }
  const lastName = user.get('last_name') || '';
  return lastName
    .split(' ')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
};
