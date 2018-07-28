export default function(target, className) {
  let node;
  do {
    if (target.classList.contains(className)) {
      node = target;
    }
    target = target.parentNode;
  } while (!node && target && typeof target.getAttribute === 'function');
  return node;
}