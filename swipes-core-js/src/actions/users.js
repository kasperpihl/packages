import * as ca from './';

export const signup = obj => ca.api.request('users.signup', { ...obj });

export const confirmEmail = confirmationToken => ca.api.request('users.confirmEmail', {
  confirmation_token: confirmationToken,
})