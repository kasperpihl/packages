import * as reducers from './reducers';

import Socket from './classes/socket';
import FilterHandler from './classes/filter-handler';
import MessageGenerator from './message-generator';

const init = store => {
  window.socket = new Socket(store);
  window.msgGen = new MessageGenerator(store);
  window.beta = flag => window.msgGen.me.beta(flag);
  window.filterHandler = new FilterHandler(store);
};

export { init, reducers };
