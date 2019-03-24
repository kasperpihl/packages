import { useRef, useReducer, useEffect } from 'react';
import request from 'src/utils/request';
import useCallbackRef from 'src/react/_hooks/useCallbackRef';
import useRequest from 'src/react/_hooks/useRequest';

export default function usePaginationRequest(endpoint, params, options) {
  if (
    typeof options !== 'object' ||
    !options.idAttribute ||
    !options.cursorKey ||
    !options.resultPath
  ) {
    throw Error(
      'usePaginationRequest expects an option object with: idAttribute, cursorKey and resultPath'
    );
  }

  const { idAttribute, cursorKey, resultPath } = options;
  const hasMoreRef = useRef(false);

  const [items, dispatch] = useReducer((state, action) => {
    const hasAlreadyFilter = item =>
      !action.payload.find(it => item[idAttribute] === it[idAttribute]);
    switch (action.type) {
      case 'mergeItem': {
        return state.map(item => {
          if (item[idAttribute] === action.payload[idAttribute]) {
            return { ...item, ...action.payload };
          }
          return item;
        });
      }
      case 'prependItem': {
        return [action.payload].concat(
          state.filter(
            item => item[idAttribute] !== action.payload[idAttribute]
          )
        );
      }
      case 'appendItem': {
        return state
          .filter(item => item[idAttribute] !== action.payload[idAttribute])
          .concat([action.payload]);
      }
      case 'seed':
        return action.payload;
      case 'new':
        return action.payload.concat(state.filter(hasAlreadyFilter));
      case 'next':
        return state.filter(hasAlreadyFilter).concat(action.payload);
    }
  }, null);

  async function fetchRequest(type, params) {
    const res = await request(endpoint, params);
    if (res.ok) {
      if (type !== 'new') {
        hasMoreRef.current = res.has_more;
      }
      dispatch({
        type,
        payload: res[resultPath]
      });
    }
    return res;
  }

  const fetchMoreRef = useCallbackRef(function(type) {
    if (!items) return;
    const newParams = { ...params };
    if (options.cursorKey === 'skip') {
      // Support skip/limit
      newParams.skip = type === 'new' ? 0 : items.length;
    } else if (items.length) {
      // Support cursor style >< key
      const index = type === 'new' ? 0 : items.length - 1;
      newParams.cursor = items[index][cursorKey];
      newParams.fetch_new = type === 'new';
    }
    return fetchRequest(type, newParams);
  });

  const fetchNew = () => fetchMoreRef.current('new');
  const fetchNext = () => fetchMoreRef.current('next');

  const req = useRequest(endpoint, params, res => {
    hasMoreRef.current = res.has_more;
    dispatch({ type: 'seed', payload: res[resultPath] });
  });

  const mergeItem = payload => dispatch({ type: 'mergeItem', payload });

  const prependItem = payload => dispatch({ type: 'prependItem', payload });

  const appendItem = payload => dispatch({ type: 'appendItem', payload });

  return {
    ...req,
    hasMore: hasMoreRef.current,
    mergeItem,
    prependItem,
    appendItem,
    items,
    fetchNew,
    fetchNext
  };
}
