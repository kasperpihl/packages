export default clientState => {
  // Verify
  const allCompletedForLevel = {};
  let currentIndention = -1;
  let numberOfCompleted = 0;
  const order = clientState.get('sortedOrder');
  for (let index = order.size - 1; index >= 0; index--) {
    const id = order.get(index);
    const indention = clientState.getIn(['indention', id]);
    const completed = !!clientState.getIn(['completion', id]);
    if (completed) {
      numberOfCompleted++;
    }
    const key = '' + indention; // Make sure key is a string

    // set the allCompleted for this level, if it does not exist.
    if (typeof allCompletedForLevel[key] === 'undefined') {
      allCompletedForLevel[key] = !!completed;
    }

    // If we hit a lower indention
    if (indention < currentIndention) {
      const childLevelKey = `${indention + 1}`; // Make sure key is a string

      // check if all of it's children are completed or incomplete
      const childCompleted = allCompletedForLevel[childLevelKey];
      // assign child value to the parent element if needed.
      if (childCompleted !== completed) {
        clientState = clientState.setIn(['completion', id], childCompleted);
        completed = childCompleted;
      }

      // Clean child level status, we won't need it now.
      delete allCompletedForLevel[childLevelKey];
    }

    // Keep tracking if this level is all completed.
    if (allCompletedForLevel[key] && !completed) {
      allCompletedForLevel[key] = false;
    }

    // Make sure to update indent level
    currentIndention = indention;
  }

  const percentageCompleted = order.size
    ? Math.ceil((numberOfCompleted / order.size) * 100)
    : 0;
  if (clientState.get('completion_percentage') !== percentageCompleted) {
    clientState = clientState.set('completion_percentage', percentageCompleted);
  }
  return clientState;
};
