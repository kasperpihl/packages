export default (clientState, localState) => {
  let blockIndentionMoreThan = -1;

  return localState.set(
    'visibleOrder',
    clientState.get('sortedOrder').filter((taskId, i) => {
      const indention = clientState.getIn(['indention', taskId]);
      if (blockIndentionMoreThan > -1 && indention > blockIndentionMoreThan) {
        return false;
      }
      if (blockIndentionMoreThan > -1 && indention <= blockIndentionMoreThan) {
        blockIndentionMoreThan = -1;
      }
      if (
        localState.getIn(['hasChildren', taskId]) &&
        !localState.getIn(['expanded', taskId])
      ) {
        blockIndentionMoreThan = indention;
      }
      return true;
    })
  );
};
