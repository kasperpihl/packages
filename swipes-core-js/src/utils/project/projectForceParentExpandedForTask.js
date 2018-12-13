export default (clientState, localState, taskId) => {
  const taskIndent = clientState.getIn(['indention', taskId]);
  const sortedOrder = clientState.get('sortedOrder');
  let parentId;
  let deltaI = clientState.getIn(['ordering', taskId]) - 1;

  while (typeof parentId === 'undefined' && deltaI >= 0) {
    const dTaskId = sortedOrder.get(deltaI);
    const indent = clientState.getIn(['indention', dTaskId]);
    if (indent < taskIndent) {
      parentId = dTaskId;
    }
    deltaI--;
  }
  if (parentId && !localState.getIn(['expanded', parentId])) {
    localState = localState.setIn(['expanded', parentId], true);
  }
  return localState;
};
