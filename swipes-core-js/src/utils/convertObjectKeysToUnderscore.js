import camelCaseToUnderscore from './camelCaseToUnderscore';

export default function(obj) {
  Object.keys(obj).forEach((key) => {
    const newKey = camelCaseToUnderscore(key);
    if(newKey !== key){
      obj[newKey] = obj[key];
      delete obj[key];
    }
  });
  return obj;
}