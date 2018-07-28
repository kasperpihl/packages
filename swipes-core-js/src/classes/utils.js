import { fromJS, Map } from 'immutable';
import { createSelector } from 'reselect'
import createCachedSelector from 're-reselect';

import Fuse from 'fuse.js';
import { funcWrap } from 'valjs';

export function getURLParameter(name) {
  return decodeURIComponent((new  RegExp(`[?|&]${name}=` + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null; // eslint-disable-line
}

export function searchSelectorFromKeys(keys, getAll) {
  const getSearchString = (state, props) => props.searchString;
  const arraySelector = createSelector(
    [ getAll ],
    list => list.toList().toJS(),
  );
  const options = getFuzzyOptionsWithKeys(keys);
  return createCachedSelector(
    [arraySelector, getSearchString],
    (list, string) => {
      let fuse = new Fuse(list, options); // "list" is the item array
      return fuse.search(string || '');
    }
  )(
    (state, props) => getSearchString(state, props) || ''
  )
}

export function getFuzzyOptionsWithKeys(keys) {
  return Object.assign({
    shouldSort: true,
    includeScore: true,
    includeMatches: true,
    // location: 0,
    // id: 'id',
    threshold: 0.5,
    // distance: 1000,
    maxPatternLength: 32,
    minMatchCharLength: 2,
  }, { keys });
}

export const parseVersionString = (version) => {
  const x = version.split('.');
  const major = parseInt(x[0], 10) || 0;
  const minor = parseInt(x[1], 10) || 0;
  const patch = parseInt(x[2], 10) || 0;

  return {
    major,
    minor,
    patch,
  };
};

export function hasMinorChange(current, last) {
  if(!last){
    return true;
  }
  current = parseVersionString(current);
  last = parseVersionString(last);
  return (current.major > last.major || current.minor > last.minor);
}

export function reducerInitToMap(payload, key, state) {
  let collection = Map();
  if(!payload.full_fetch) {
    collection = state;
  }
  if(payload[key]) {
    payload[key].forEach((obj) => {
      collection = collection.set(obj.id, fromJS(obj));
      if(obj.archived || obj.deleted) {
        collection = collection.delete(obj.id);
      }
    })
  }
  
  return collection;
}

export const URL_REGEX = /(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?/gim;


export function valAction(actionName, arrayArgs, actionHandler) {
  function handler(valErr) {
    if (!valErr) {
      return actionHandler(...Array.prototype.slice.call(arguments, 1));
    }
    console.warn(`Schema for redux action: ${actionName}`);
    arrayArgs.forEach((a, i) => {
      console.log(`---- Argument ${i} ----`);
      console.log(a.toString());
      console.log(`--------------------`);
    });
    console.warn(`ERROR: ${valErr}`);
    return () => Promise.resolve();
  }
  return funcWrap(arrayArgs, handler);
}

export function miniIconForId(id) {
  if(id.startsWith('G')) {
    return 'MiniGoal';
  } else if (id.startsWith('M')) {
    return 'MiniMilestone';
  } else if (id.startsWith('N')) {
    return 'MiniNote';
  } else if (id.startsWith('F')) {
    return 'MiniFile';
  } else if (id.startsWith('P')) {
    return 'Messages';
  }
}

export function iconForId(id) {
  if(id.startsWith('G')) {
    return 'Goals';
  } else if (id.startsWith('M')) {
    return 'Milestones';
  } else if (id.startsWith('N')) {
    return 'Note';
  } else if (id.startsWith('F')) {
    return 'File';
  } else if (id.startsWith('P')) {
    return 'Messages';
  }
}

export function typeForId(id) {
  if(id.startsWith('G')) {
    return 'Goal';
  } else if (id.startsWith('M')) {
    return 'Milestone';
  } else if (id.startsWith('N')) {
    return 'Note';
  } else if (id.startsWith('F')) {
    return 'File';
  }
}

export function navForContext(id) {
  let title;
  if (typeof id === 'object') {
    title = id.get('title');
    id = id.get('id');

  }
  if(id.startsWith('G')) {
    return {
      id: 'GoalOverview',
      title: 'Goal overview',
      props: {
        goalId: id,
      },
    };
  } else if (id.startsWith('M')) {
    return {
      id: 'PlanOverview',
      title: 'Plan overview',
      props: {
        milestoneId: id,
      },
    };
  } else if(id.startsWith('P')) {
    return {
      id: 'PostView',
      title: 'Post',
      props: {
        postId: id,
      }
    }
  } else if (id.startsWith('N')) {
    return {
      id: 'SideNote',
      title: 'Note',
      props: {
        id,
        title,
      },
    };
  } else if (id.startsWith('F')) {
    return 'MiniFile';
  }
}

export function iconForService(service) {
  switch (service) {
    case 'slack':
      return 'SlackLogo';
    case 'dropbox':
      return 'DropboxLogo';
    case 'jira':
      return 'JiraLogo';
    case 'drive':
      return 'DriveLogo';
    case 'asana':
      return 'AsanaLogo';
    default:
      return 'SwipesLogo';
  }
}

export function attachmentIconForService(service) {
  const type = (typeof service.get === 'function') ? service.get('type') : service.type;
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

export function queryStringToObject(query) {
  const object = {};
  const segments = query.split('&');

  segments.forEach((seg) => {
    const pair = seg.split('=');

    pair[0] = decodeURIComponent(pair[0]);
    pair[1] = decodeURIComponent(pair[1]);

    if (typeof object[pair[0]] === 'undefined') {
      object[pair[0]] = pair[1];
    } else if (typeof object[pair[0]] === 'string') {
      const arr = [object[pair[0]], pair[1]];
      object[pair[0]] = arr;
    } else {
      object[pair[0]].push(pair[1]);
    }
  });
  return object;
}

export function truncateString(string, maxLength) {
  if (typeof string === 'string' && maxLength < string.length) {
    string = string.substr(0, maxLength);
    return `${string}...`;
  }
  return string;
}

export function bindAll(context, methodNames) {
  methodNames.forEach((methodName) => {
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

export function randomString(length, possible) {
  let text = '';
  possible = possible || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
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
      _loadingStates,
    }
  }
  function updateLoadingState(name, prop, label, duration, callback) {
    if (unmounted) return;

    let newState = {};
    if(prop) newState[prop] = label;

    _loadingStates = Object.assign({}, _loadingStates, { [name]: newState });
    ctx.setState({ _loadingStates });
    setClearTimer(name, duration, callback);
  }
  function setLoading(name, label, duration, callback) {
    updateLoadingState(name, 'loading', label || 'Loading', duration, callback);
  }
  function clearLoading(name, label, duration, callback) {
    if (label && label.substr(0, 1) === '!') {
      return updateLoadingState(name, 'error', label.substr(1), duration, callback);
    } 
    updateLoadingState(name, 'success', label, duration, callback);
  }
  setClearTimer = (name, duration, callback) => {
    clearTimeout(timers[name]);
    if (typeof duration === 'number') {
      timers[name] = setTimeout(() => {
        if (!unmounted) {
          if(typeof callback === 'function') {
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