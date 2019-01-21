import userGet from './userGet';

export default (userId, organizationId) => {
  const user = userGet(userId, organizationId);
  if (!user) {
    return undefined;
  }
  const firstName = user.get('first_name') || '';
  return firstName
    .split(' ')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
};
