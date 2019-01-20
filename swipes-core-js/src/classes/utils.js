import { funcWrap } from 'valjs';

export const URL_REGEX = /(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?/gim;

export function miniIconForId(id) {
  if (id.startsWith('N')) {
    return 'MiniNote';
  } else if (id.startsWith('F')) {
    return 'MiniFile';
  } else if (id.startsWith('P')) {
    return 'Messages';
  }
}

export function iconForId(id) {
  if (id.startsWith('N')) {
    return 'Note';
  } else if (id.startsWith('F')) {
    return 'File';
  } else if (id.startsWith('P')) {
    return 'Messages';
  }
}

export function typeForId(id) {
  if (id.startsWith('N')) {
    return 'Note';
  } else if (id.startsWith('F')) {
    return 'File';
  }
}

export function attachmentIconForService(service) {
  const type =
    typeof service.get === 'function' ? service.get('type') : service.type;
  switch (type) {
    case 'url':
      return 'Hyperlink';
    case 'note':
      return 'Note';
    default:
      return 'File';
  }
}

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

export function truncateString(string, maxLength) {
  if (typeof string === 'string' && maxLength < string.length) {
    string = string.substr(0, maxLength);
    return `${string}...`;
  }
  return string;
}

export function bindAll(context, methodNames) {
  methodNames.forEach(methodName => {
    if (typeof context[methodName] !== 'function') {
      console.warn('trying to bind non-existing function', methodName);
    } else {
      context[methodName] = context[methodName].bind(context);
    }
  });
}
export function size(obj) {
  if (obj == null) return 0;
  return Object.keys(obj).length;
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
