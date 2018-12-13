export default (clientState, localState, id) => {
  const sortedOrder = clientState.get('sortedOrder');
  const i = clientState.getIn(['ordering', id]);
  const currId = sortedOrder.get(i);
  const prevId = sortedOrder.get(i - 1);
  const nextId = sortedOrder.get(i + 1);
  const currIndention = clientState.getIn(['indention', currId]);
  if (prevId) {
    const prevIndention = clientState.getIn(['indention', prevId]);
    const hasChildren = currIndention > prevIndention;
    if (hasChildren !== localState.getIn(['hasChildren', prevId])) {
      localState = localState.setIn(['hasChildren', prevId], hasChildren);
      // localState = localState.setIn(['expanded', prevId], hasChildren);
    }
  }
  const hasChildren =
    (clientState.getIn(['indention', nextId]) || 0) > currIndention;

  if (hasChildren !== clientState.getIn(['hasChildren', currId])) {
    localState = localState.setIn(['hasChildren', currId], hasChildren);
    // localState = localState.setIn(['expanded', currId], hasChildren);
  }
  return localState;
};
