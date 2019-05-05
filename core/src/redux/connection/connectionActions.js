import * as types from '../constants';
import { fromJS } from 'immutable';

export function handleApiResponse(res) {
  return {
    type: types.SET_CONNECTION_INFO,
    payload: {
      maintenance: res.error === 'maintenance' || null,
      clientUpdate: (res.client_update && fromJS(res.client_update)) || null
    }
  };
}
