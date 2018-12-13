export default (clientState, idToComplete, shouldComplete) => {
  const indexToComplete = clientState.getIn(['ordering', idToComplete]);
  const orgIndent = clientState.getIn(['indention', idToComplete]);

  let deltaIndex = indexToComplete;
  let deltaIndent = orgIndent;
  let newClientState = clientState;
  do {
    // Set all children and grandchildren
    let deltaId = clientState.getIn(['sortedOrder', deltaIndex]);
    newClientState = newClientState.setIn(
      ['completion', deltaId],
      !!shouldComplete
    );
    deltaIndex++;
    deltaId = clientState.getIn(['sortedOrder', deltaIndex]);
    deltaIndent = newClientState.getIn(['indention', deltaId]);
  } while (
    deltaIndent > orgIndent &&
    deltaIndex < newClientState.get('sortedOrder').size
  );

  return newClientState;
};
