import { request } from './api';
export const init = () => (d, getState) => {
  const { connection, globals } = getState();
  const forceFullFetch = connection.get('forceFullFetch');
  const withoutNotes = globals.get('withoutNotes');
  const lastConnect = connection.get('lastConnect');

  const options = {
    without_notes: withoutNotes,
  };

  if (!forceFullFetch && lastConnect) {
    options.timestamp = lastConnect;
  }

  return d(request('init', options));
};

export const disconnectService = aId =>
  request('users.serviceDisconnect', { account_id: aId });

export const handleOAuthSuccess = (serviceName, query) => {
  if (typeof query === 'string') {
    query = JSON.parse(query);
  }

  const options = {
    query,
    service_name: serviceName,
  };

  return request('services.authsuccess', options);
};

export const uploadProfilePhoto = photo => (d, getState) => {
  const formData = new FormData();
  formData.append('token', getState().auth.get('token'));
  formData.append('photo', photo);
  return d(
    request(
      {
        command: 'me.uploadProfilePhoto',
        formData: true,
      },
      {
        photo,
      }
    )
  );
};
