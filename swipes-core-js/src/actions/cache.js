import * as types from '../constants';

// ======================================================
// Simple persistent cache
// ======================================================

export const getSelector = (selector, props) => (d, getState) => {
  return selector(getState(), props);
}

export const saveBatch = (path, data) => {
  if(!Array.isArray(path)) path = [path];
  return { 
    type: types.CACHE_SAVE_BATCH,
    payload: { 
      path,
      data,
    }
  }
}

export const save = (path, data) => {
  if(!Array.isArray(path)) path = [path];
  return { 
    type: types.CACHE_SAVE,
    payload: { 
      path,
      data,
    }
  }
};

export const clear = (path) => {
  if(!Array.isArray(path)) path = [path];
  return {
    type: types.CACHE_CLEAR,
    payload: {
      path,
    }
  }
};