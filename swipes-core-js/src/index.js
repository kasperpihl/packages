import * as actions from './actions';
import * as reducers from './reducers';
import * as selectors from './selectors';
import * as constants from './constants';

import Socket from './classes/socket';
import FilterHandler from './classes/filter-handler';
import MessageGenerator from './message-generator';

const init = (store, delegate) => {
  window.delegate = delegate;
  window.socket = new Socket(store, delegate);
  window.msgGen = new MessageGenerator(store);
  window.beta = (flag) => window.msgGen.me.beta(flag);
  window.filterHandler = new FilterHandler(store);
};

export {
  actions,
  init,
  reducers,
  selectors,
  constants,
};
