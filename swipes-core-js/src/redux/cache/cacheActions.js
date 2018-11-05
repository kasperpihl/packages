import { fromJS } from 'immutable';
import * as types from '../constants';

// ======================================================
// Simple persistent cache
// ======================================================

export const getSelector = (selector, props) => (d, getState) => {
  return selector ? selector(getState(), props) : fromJS([]);
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