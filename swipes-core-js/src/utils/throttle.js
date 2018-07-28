export default function(func, wait, lock) {
  let ctx;
  let args;
  let rtn;
  let timeoutID; // caching
  let last = 0;

  function call() {
    timeoutID = 0;
    last = +new Date();
    rtn = func.apply(ctx, args);
    ctx = null;
    args = null;
  }
  function clear() {
    if (timeoutID) {
      clearTimeout(timeoutID);
      timeoutID = 0;
      last = 0;
    }
  };

  function throttled() {
    ctx = this;
    args = arguments;
    const delta = new Date() - last;
    if (!timeoutID) {
      const callback = lock ? clear : call;
      if (delta >= wait) call();
      else timeoutID = setTimeout(callback, wait - delta);
    }

    return rtn;
  }
  throttled.isRunning = () => !!timeoutID;
  throttled.clear = clear;
  return throttled;
}