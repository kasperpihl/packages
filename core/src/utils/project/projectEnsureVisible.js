export default function projectEnsureVisible(
  clientState,
  localState,
  visibleIds
) {
  let enforceVisibleIndention = 0;
  clientState
    .get('sortedOrder')
    .reverse()
    .forEach((taskId, i) => {
      const indention = clientState.getIn(['indention', taskId]);
      const hasChildren = localState.getIn(['hasChildren', taskId]);
      const expanded = localState.getIn(['expanded', taskId]);

      if (
        indention > enforceVisibleIndention &&
        visibleIds.indexOf(taskId) > -1
      ) {
        enforceVisibleIndention = indention;
      } else if (indention < enforceVisibleIndention) {
        if (hasChildren && !expanded) {
          localState = localState.setIn(['expanded', taskId], true);
          enforceVisibleIndention = indention;
        }
      }
    });

  return [clientState, localState];
}
