import { fromJS } from 'immutable';

export default (
  clientState,
  localState,
  options = {
    ordering: true,
    indention: true,
    completion: true,
    hasChildren: true
  }
) => {
  // Verify completion
  const order = clientState.get('sortedOrder');
  const allCompletedForLevel = {};
  let currentIndention = -1;
  let numberOfCompleted = 0;
  const checkCompletionForTask = taskId => {
    const indention = clientState.getIn(['indention', taskId]);
    let completed = !!clientState.getIn(['completion', taskId]);

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
        clientState = clientState.setIn(['completion', taskId], childCompleted);
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
    if (completed) {
      numberOfCompleted++;
    }
  };

  // Verify order
  const checkForOrderOfTask = (taskId, index) => {
    if (clientState.getIn(['ordering', taskId]) !== index) {
      clientState = clientState.setIn(['ordering', taskId], index);
    }
  };

  // Verify hasChildren
  let prevHasChildrenIndention = -1;
  const checkHasChildrenForTask = taskId => {
    const indention = clientState.getIn(['indention', taskId]);
    const hasChildren = localState.getIn(['hasChildren', taskId]);
    const newHasChildren = indention < prevHasChildrenIndention;
    if (newHasChildren !== hasChildren) {
      localState = localState.setIn(['hasChildren', taskId], newHasChildren);
    }
    prevHasChildrenIndention = indention;
  };

  let prevIndention = 0;
  const checkIndentionForTask = taskId => {
    let indention = clientState.getIn(['indention', taskId]);
    if (indention > prevIndention + 1) {
      indention = prevIndention + 1;
      clientState = clientState.setIn(['indention', taskId], indention);
    }
    prevIndention = indention;
  };

  let blockIndentionMoreThan = -1;
  let newVisibleOrder = fromJS([]);
  const generateVisibleOrder = taskId => {
    const indention = clientState.getIn(['indention', taskId]);
    if (blockIndentionMoreThan > -1 && indention > blockIndentionMoreThan) {
      return;
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
    newVisibleOrder = newVisibleOrder.push(taskId);
  };

  // Looping backwards.
  for (
    let index = clientState.get('sortedOrder').size - 1;
    index >= 0;
    index--
  ) {
    const taskId = order.get(index);
    checkCompletionForTask(taskId);
    checkForOrderOfTask(taskId, index);
    checkHasChildrenForTask(taskId);
  }

  for (let index = 0; index < clientState.get('sortedOrder').size; index++) {
    const taskId = order.get(index);
    checkIndentionForTask(taskId);
    generateVisibleOrder(taskId);
  }

  // Update visible order if needed
  if (localState.get('visibleOrder').size !== newVisibleOrder.size) {
    localState = localState.set('visibleOrder', newVisibleOrder);
  }

  // Update Completion percentage if needed
  const percentageCompleted = order.size
    ? Math.ceil((numberOfCompleted / order.size) * 100)
    : 0;
  if (clientState.get('completion_percentage') !== percentageCompleted) {
    clientState = clientState.set('completion_percentage', percentageCompleted);
  }

  return [clientState, localState];
};
