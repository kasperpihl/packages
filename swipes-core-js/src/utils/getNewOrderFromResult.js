export default function(order, result) {
  const { index: sourceI } = result.source;
  const { index: destI } = result.destination;
  const itemId = order.get(sourceI);
  order = order.delete(sourceI);
  return order.insert(destI, itemId);
}