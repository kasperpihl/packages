import storeGet from '../store/storeGet';

export default user => {
  if (typeof user === 'string') {
    return storeGet().getState().me;
  }
  return user;
};
