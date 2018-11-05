import Fuse from 'fuse.js';
import { Map } from 'immutable'
import {
  string,
  array,
  object,
  any,
} from 'valjs';

import * as constants from '../constants';
import { valAction } from '../classes/utils';
import * as selectors from '../selectors';

// ======================================================
// Auto Completing
// ======================================================
export const search = valAction('autoComplete.search', [
  string.require(),
  object.as({
    types: array.of(any.of('users').require()).require(),
    delegate: object.require(),
  }).require(),
], (string, options) => (d, getState) => {
  let results = null;
  const blockedIdentifier = getState().autoComplete.get('blockedIdentifier');
  if(blockedIdentifier === options.identifier) {
    return;
  }
  if(string && string !== getState().autoComplete.get('string')) {
    d({ type: constants.AUTO_COMPLETE_SET_STRING, payload: { 
      string,
      options: Map(options),
    }});
    
    results = selectors.autoComplete.getResults(getState(), string);
    results = results.length ? results : null;
    d({
      type: constants.AUTO_COMPLETE,
      payload: { results } 
    });

  } else if(!string) {
    d({ type: constants.AUTO_COMPLETE_CLEAR, payload: null });
  }
  
})

export const clear = () => {
  return { type: constants.AUTO_COMPLETE_CLEAR, payload: null };
}

export const blockIdentifier = (key) => {
  return { type: constants.AUTO_COMPLETE_BLOCK_IDENTIFIER, payload: { key } };
}