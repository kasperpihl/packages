import userGet from './userGet';
import userGetFirstName from './userGetFirstName';
import userGetLastName from './userGetLastName';

export default userId => {
  const user = userGet(userId);
  if (!user) {
    return undefined;
  }
  const firstName = userGetFirstName(user);
  const lastName = userGetLastName(user);
  let fullName = firstName;
  if (lastName.length) {
    fullName += ` ${lastName}`;
  }
  return fullName;
};
