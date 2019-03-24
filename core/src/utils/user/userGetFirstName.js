import userGet from './userGet';

export default (userId, teamId) => {
  const user = userGet(userId, teamId);
  if (!user) {
    return undefined;
  }
  const firstName = user.get('first_name') || '';
  return firstName
    .split(' ')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
};
