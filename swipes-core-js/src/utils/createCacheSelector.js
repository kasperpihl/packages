import { createSelector } from 'reselect';

const sorterDesc = key => l => l && l.sort(
  (a, b) => b.get(key).localeCompare(a.get(key))
);
const sorterAsc = key => l => l && l.sort(
  (a, b) => a.get(key).localeCompare(b.get(key))
);

export default (cache, lastValue) => {
  let { orderBy, path, filter } = cache;
  if(!Array.isArray(path)) path = [path];
  const getCachePath = state => state.cache.getIn(path)
  return createSelector(
    [getCachePath],
    (objects) => {
      let orderKey = orderBy;
      if(filter) {
        objects = objects.filter(filter);
      }
      if(orderBy) {
        if(orderBy.startsWith('-')) {
          orderKey = orderBy.slice(1);
          objects = sorterDesc(orderKey)(objects);
          objects = objects.filter(d => d.get(orderKey) >= lastValue);
        } else {
          objects = sorterAsc(orderKey)(objects);
          objects = objects.filter(d => d.get(orderKey) <= lastValue);
        }
      }
      return objects;
    }
  )
}