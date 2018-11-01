import Socket from './classes/Socket';

const init = (store, options = {}) => {
  window.socket = new Socket(store, options);
};

export { init };
