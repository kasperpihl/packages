export default (obj, path) => {
  if(typeof obj === 'undefined' || typeof path !== 'string') {
    return undefined;
  }
  const parts = path.split('.');
  for(let i = 0 ; i < parts.length ; i++) {
    const part = parts[i];
    obj = obj[part];
    if(typeof obj === 'undefined' || obj === null) {
      return undefined;
    }
  }
  return obj;
}