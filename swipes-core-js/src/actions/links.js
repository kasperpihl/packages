import * as ca from './';

export const create = (link) => (d, getState) => d(ca.api.request('links.create', {
  link,
  organization_id: getState().me.getIn(['organizations', 0, 'id']),
}));
