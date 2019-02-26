import { useRef, useReducer } from 'react';
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
      case 'merge':
        const newItems = action.payload.handler(state);
        if (!Array.isArray(newItems)) {
          console.warn(
            'usePaginationRequest mergeItems did not return an array as expected'
          );
          return state;
        }
        return newItems;
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
    let newParams = params;
    if (items.length) {
      const index = type === 'new' ? 0 : items.length - 1;
      newParams = {
        ...params,
        cursor: items[index][cursorKey],
        fetch_new: type === 'new'
      };
    }
    return fetchRequest(type, newParams);
  });

  const fetchNew = () => fetchMoreRef.current('new');
  const fetchNext = () => fetchMoreRef.current('next');

  const req = useRequest(endpoint, params, res => {
    hasMoreRef.current = res.has_more;
    dispatch({ type: 'seed', payload: res[resultPath] });
  });

  const mergeItems = handler => {
    if (typeof handler !== 'function') {
      throw Error('mergeItems expects function as first param');
    }
    dispatch({
      type: 'merge',
      payload: { handler }
    });
  };

  return {
    ...req,
    hasMore: hasMoreRef.current,
    mergeItems,
    items,
    fetchNew,
    fetchNext
  };
}
