export function traverseElement(target, iterator) {
  do {
    if (target && !iterator(target)) {
      target = target.parentNode;
    } else {
      target = undefined;
    }
  } while (target);
  return target;
}

export function setupLoading(ctx) {
  let _loadingStates = {};
  let unmounted = false;
  const defaultObj = {};
  const timers = {};
  if (!ctx.state) {
    ctx.state = {};
  }
  ctx.state._loadingStates = _loadingStates;
  const currComponentWillUnmount = ctx.componentWillUnmount;
  ctx.componentWillUnmount = () => {
    unmounted = true;
    if (typeof currComponentWillUnmount === 'function') {
      currComponentWillUnmount.bind(ctx)();
    }
  };
  let setClearTimer;
  function bindLoading() {
    return {
      isLoading: this.isLoading,
      getLoading: this.getLoading,
      clearLoading: this.clearLoading,
      setLoading: this.setLoading,
      bindLoading: this.bindLoading,
      _loadingStates
    };
  }
  function updateLoadingState(name, prop, label, duration, callback) {
    if (unmounted) return;

    let newState = {};
    if (prop) newState[prop] = label;

    _loadingStates = Object.assign({}, _loadingStates, { [name]: newState });
    ctx.setState({ _loadingStates });
    setClearTimer(name, duration, callback);
  }
  function setLoading(name, label, duration, callback) {
    updateLoadingState(name, 'loading', label || 'Loading', duration, callback);
  }
  function clearLoading(name, label, duration, callback) {
    if (label && label.substr(0, 1) === '!') {
      return updateLoadingState(
        name,
        'error',
        label.substr(1),
        duration,
        callback
      );
    }
    updateLoadingState(name, 'success', label, duration, callback);
  }
  setClearTimer = (name, duration, callback) => {
    clearTimeout(timers[name]);
    if (typeof duration === 'number') {
      timers[name] = setTimeout(() => {
        if (!unmounted) {
          if (typeof callback === 'function') {
            callback();
          }
          clearLoading(name);
        }
      }, duration);
    }
  };
  function getLoading(name) {
    return _loadingStates[name] || defaultObj;
  }
  function isLoading(name) {
    return (_loadingStates[name] || defaultObj).loading;
  }

  ctx.setLoading = setLoading.bind(ctx);
  ctx.isLoading = isLoading.bind(ctx);
  ctx.getLoading = getLoading.bind(ctx);
  ctx.clearLoading = clearLoading.bind(ctx);
  ctx.bindLoading = bindLoading.bind(ctx);
}
