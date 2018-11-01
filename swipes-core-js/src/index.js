import * as reducers from './reducers';

import Socket from './classes/Socket';

const init = store => {
  window.socket = new Socket(store);
};

export { init, reducers };
