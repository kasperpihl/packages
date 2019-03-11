export default function projectDeleteTaskId(clientState, localState, taskId) {
  clientState = clientState.deleteIn(['ordering', taskId]);
  clientState = clientState.deleteIn(['completion', taskId]);
  clientState = clientState.deleteIn(['indention', taskId]);
  clientState = clientState.deleteIn(['tasks_by_id', taskId]);
  clientState = clientState.set(
    'sortedOrder',
    clientState.get('sortedOrder').filter(tId => tId !== taskId)
  );

  localState = localState.deleteIn(['expanded', taskId]);
  localState = localState.deleteIn(['hasChildren', taskId]);
  return [clientState, localState];
}
