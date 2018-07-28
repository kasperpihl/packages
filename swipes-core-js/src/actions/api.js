import * as types from '../constants';

const handleUpdatesNeeded = (payload, state, dispatch) => {
  if (!payload) {
    return;
  }
  const { connection } = state;
  const updateRequired = connection.getIn(['versionInfo', 'updateRequired']);
  const updateAvailable = connection.getIn(['versionInfo', 'updateAvailable']);
  const updateUrl = connection.getIn(['versionInfo', 'updateUrl']);
  const reloadAvailable = connection.getIn(['versionInfo', 'reloadAvailable']);
  const reloadRequired = connection.getIn(['versionInfo', 'reloadRequired']);
  const maintenance = connection.getIn(['versionInfo', 'maintenance']);

  if (
    payload.update_required !== updateRequired ||
    payload.update_available !== updateAvailable ||
    payload.update_url !== updateUrl ||
    payload.reload_required !== reloadRequired ||
    payload.reload_available !== reloadAvailable ||
    payload.maintenance !== maintenance
  ) {
    dispatch({
      type: types.SET_UPDATE_STATUS,
      payload: {
        maintenance: payload.maintenance,
        updateRequired: payload.update_required,
        updateAvailable: payload.update_available,
        updateUrl: payload.update_url,
        reloadRequired: payload.reload_required,
        reloadAvailable: payload.reload_available,
      },
    });
  }
};

export const request = (options, data) => (d, getState) => {
  const apiUrl = `${getState().globals.get('apiUrl')}/v1/`;
  let command;
  if (typeof options !== 'object') {
    command = `${options}`;
    options = null;
  } else {
    command = options.command;
  }

  options = options || {};

  const { connection, me, globals } = getState();
  let body = Object.assign({}, {
    token: connection.get('token'),
    organization_id: me.getIn(['organizations', 0, 'id']) || null,
  }, data);
  const updateRequired = connection.getIn(['versionInfo', 'updateRequired']);
  const reloadRequired = connection.getIn(['versionInfo', 'reloadRequired']);
  if (updateRequired || reloadRequired) {
    return Promise.resolve({
      ok: false,
      update_required: updateRequired,
      reload_required: reloadRequired,
    });
  }
  const apiHeaders = globals.get('apiHeaders');
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
      .then((r) => {
        if (r && r.url && !apiUrl.startsWith('https://staging') && r.url.startsWith('https://staging')) {
          redirectUrl = r.url;
        }
        if (!r.headers.get('Content-Type')) {
          return Promise.reject(Error('No server response'));
        }
        return r.json();
      }).then((res) => {
        if (res && res.ok) {
          handleUpdatesNeeded(res, getState(), d);
          if (redirectUrl) {
            res.redirectUrl = redirectUrl;
          }
          d({
            type: command,
            payload: res,
          });
        } else {
          if (res.error === 'not_authed') {
            d({ type: types.RESET_STATE });
          }
          return Promise.reject({ message: res.error });
        }

        // Let's return a promise for convenience.
        resolve(res);
      }).catch((e) => {
        if (getState().globals.get('isDev')) {
          console.warn(command, e);
        }
        resolve({ ok: false, error: e.message || 'unknown error' });
      });
  });
};

export const serviceRequest = (serviceName, method, parameters, stream) => {
  // console.log('args from actions', serviceName, method, parameters);
  const options = {
    service: serviceName,
    data: {
      method,
      parameters,
    },
  };
  const req = stream ? 'services.stream' : 'services.request';
  return request(req, options);
};

export const serviceStream = (serviceName, method, parameters) =>
  serviceRequest(serviceName, method, parameters, true);
