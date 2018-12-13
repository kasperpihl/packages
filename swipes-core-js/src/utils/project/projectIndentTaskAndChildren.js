export default (clientState, id, modifier = 0) => {
  const originalIndention = clientState.getIn(['indention', id]);
  const index = clientState.getIn(['ordering', id]);
  const prevId = clientState.getIn(['sortedOrder', index - 1]);
  const maxIndent = prevId ? clientState.getIn(['indention', prevId]) + 1 : 0;
  const newIndent = originalIndention + modifier;
  if (newIndent > maxIndent || newIndent < 0) {
    return clientState;
  }
  clientState = clientState.setIn(['indention', id], newIndent);

  let foundNextSiblingOrLess = false;
  let i = index;
  while (!foundNextSiblingOrLess) {
    const prevIndention = clientState.getIn([
      'indention',
      clientState.getIn(['sortedOrder', i])
    ]);

    i++;
    const currId = clientState.getIn(['sortedOrder', i]);
    const currIndention = clientState.getIn(['indention', currId]);

    if (
      typeof currIndention === 'undefined' ||
      currIndention <= originalIndention
    ) {
      foundNextSiblingOrLess = true;
    } else {
      const targetIndent = Math.min(
        prevIndention + 1,
        currIndention + modifier
      );
      if (currIndention !== targetIndent) {
        clientState = clientState.setIn(['indention', currId], targetIndent);
      }
    }
  }

  return clientState;
};
