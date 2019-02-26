import * as types from '../redux/constants';

export default (payload, state, dispatch) => {
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
