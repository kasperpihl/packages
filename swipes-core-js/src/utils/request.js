import * as types from '../redux/constants';
import storeGet from './store/storeGet';
import handleUpdatesNeeded from './handleUpdatesNeeded';

export default (options, data) => {
  const store = storeGet();
  const apiUrl = `${store.getState().global.get('apiUrl')}/v1/`;
  let command;
  if (typeof options !== 'object') {
    command = `${options}`;
    options = null;
  } else {
    command = options.command;
  }

  options = options || {};

  const { auth, connection, me, global } = store.getState();
  let body = Object.assign(
    {
      token: auth.get('token'),
      organization_id: me.getIn(['organizations', 0, 'id']) || null,
    },
    data
  );
  const updateRequired = connection.getIn(['versionInfo', 'updateRequired']);
  const reloadRequired = connection.getIn(['versionInfo', 'reloadRequired']);
  if (updateRequired || reloadRequired) {
    return Promise.resolve({
      ok: false,
      update_required: updateRequired,
      reload_required: reloadRequired,
    });
  }
  const apiHeaders = global.get('apiHeaders');
  const extraHeaders = (apiHeaders && apiHeaders.toJS()) || {};

  const headers = new Headers({
    ...extraHeaders,
  });

  if (!options.formData) {
    body = JSON.stringify(body);
    headers.append('Content-Type', 'application/json');
  } else {
    const values = Object.entries(body);
    body = new FormData();
    values.forEach(([k, v]) => {
      body.append(k, v);
    });
  }

  const serData = {
    method: 'POST',
    headers,
    body,
  };
  let redirectUrl;
  return new Promise((resolve, reject) => {
    fetch(apiUrl + command, serData)
      .then(r => {
        if (
          r &&
          r.url &&
          !apiUrl.startsWith('https://staging') &&
          r.url.startsWith('https://staging')
        ) {
          redirectUrl = r.url;
        }
        if (!r.headers.get('Content-Type')) {
          return Promise.reject(Error('No server response'));
        }
        return r.json();
      })
      .then(res => {
        if (res && res.ok) {
          handleUpdatesNeeded(res, store.getState(), store.dispatch);
          if (redirectUrl) {
            res.redirectUrl = redirectUrl;
          }
          if (res.updates) {
            store.dispatch({
              type: 'update',
              payload: { updates: res.updates },
            });
          }
          store.dispatch({
            type: command,
            payload: res,
          });
        } else {
          if (res.error === 'not_authed') {
            store.dispatch({ type: types.RESET_STATE });
          }
          return Promise.reject({ message: res.error });
        }

        // Let's return a promise for convenience.
        resolve(res);
      })
      .catch(e => {
        if (store.getState().global.get('isDev')) {
          console.warn(command, e);
        }
        resolve({ ok: false, error: e.message || 'unknown error' });
      });
  });
};