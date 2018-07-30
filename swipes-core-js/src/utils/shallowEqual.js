export default (o1, o2) => {
  if((!o1 && o2) || (!o2 && o1)) return false;
  if(!o1 && !o2) return true;
  if(typeof o1 !== 'object' || typeof o2 !== 'object') return o1 === o2;

  for(let key in o1) {
    if(o2[key] !== o1[key]) return false;
  }
  for(let key in o2) {
    if(o2[key] !== o1[key]) return false;
  }
  return true;
}