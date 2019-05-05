import * as types from '../redux/constants';
import storeGet from './store/storeGet';
import * as connectionActions from 'src/redux/connection/connectionActions';

export default (endpoint, data, options = {}) => {
  let apiUrl = '';
  if (typeof location !== 'undefined') {
    apiUrl = `${location.origin}/v1/`;
  }
  let headerObj = {};

  const store = storeGet();
  if (store) {
    apiUrl = `${store.getState().global.get('apiUrl')}/v1/`;
    const { auth, connection, global } = store.getState();
    const hasRequiredUpdate = connection.getIn(['clientUpdate', 'required']);
    if (hasRequiredUpdate) {
      return Promise.resolve({
        ok: false,
        error: 'update_required'
      });
    }

    const apiHeaders = global.get('apiHeaders');
    headerObj = (apiHeaders && apiHeaders.toJS()) || {};
    headerObj.Authorization = `Bearer ${auth.get('token')}`;
  }

  const headers = new Headers(headerObj);

  let body;
  if (!options.formData) {
    body = JSON.stringify(data);
    headers.append('Content-Type', 'application/json');
  } else {
    body = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      body.append(k, v);
    });
  }

  const serData = {
    method: options.method || 'POST',
    headers,
    body
  };
  let redirectUrl;
  return new Promise((resolve, reject) => {
    fetch(apiUrl + endpoint, serData)
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
          if (redirectUrl) {
            res.redirectUrl = redirectUrl;
          }

          if (store) {
            store.dispatch(connectionActions.handleApiResponse(res));
            store.dispatch({
              type: endpoint,
              payload: res
            });
          }

          resolve(res);

          if (res.update) {
            setTimeout(() => {
              window.socket.handleUpdate(res.update);
            }, 1);
          }
        } else {
          if (store) {
            store.dispatch(connectionActions.handleApiResponse(res));
          }
          if (res.error === 'not_authed' && store) {
            store.dispatch({ type: types.RESET_STATE });
          }

          return Promise.reject(res);
        }
      })
      .catch(e => {
        if (typeof e.ok === 'boolean') {
          return resolve(e);
        }

        resolve({ ok: false, error: 'Connection error' });
      });
  });
};
