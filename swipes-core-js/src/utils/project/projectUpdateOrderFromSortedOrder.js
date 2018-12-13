export default clientState => {
  const origOrder = clientState.get('ordering');
  let newOrder = origOrder;

  clientState.get('sortedOrder').forEach((taskId, index) => {
    if (origOrder.get(taskId) !== index) {
      newOrder = newOrder.set(taskId, index);
    }
  });
  return clientState.set('ordering', newOrder);
};
