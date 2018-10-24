import * as ca from './';

export const confirmEmail = confirmationToken =>
  ca.api.request('users.confirmEmail', {
    confirmation_token: confirmationToken,
  });
