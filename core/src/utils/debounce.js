export default function(func, wait, immediate) {
  let timeout;
  let args;
  let context;
  let timestamp;
  let result;
  let hasCalledSecondTime;
  if (wait == null) wait = 100;

  function later() {
    const last = Date.now() - timestamp;

    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate || hasCalledSecondTime) {
        result = func.apply(context, args);
        context = args = null;
        hasCalledSecondTime = undefined;
      }
    }
  }

  function debounced() {
    context = this;
    args = arguments;
    timestamp = Date.now();
    const callNow = immediate && !timeout;
    const isSecondTime = immediate && timeout && !hasCalledSecondTime;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }
    if (isSecondTime) {
      hasCalledSecondTime = true;
    }

    return result;
  }

  debounced.isRunning = () => !!timeout;

  debounced.clear = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}