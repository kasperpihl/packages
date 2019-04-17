import { fromJS } from 'immutable';
const defaultMap = fromJS({});
const defaultList = fromJS([]);

export default function projectValidateStates(
  clientState,
  localState,
  options = {
    ordering: true,
    indention: true,
    completion: true,
    hasChildren: true
  }
) {
  // Verify completion
  const order = clientState.get('sortedOrder');
  const allCompletedForLevel = {};
  let currentIndention = -1;
  let numberOfCompleted = 0;
  let numberOfLeafs = 0;
  const checkCompletionForTask = taskId => {
    const indention = clientState.getIn(['indention', taskId]);
    const hasChildren = localState.getIn(['hasChildren', taskId]);
    let completed = !!clientState.getIn(['completion', taskId]);

    const key = '' + indention; // Make sure key is a string

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

    // set the allCompleted for this level, if it does not exist.
    if (typeof allCompletedForLevel[key] === 'undefined') {
      allCompletedForLevel[key] = !!completed;
    }

    // Keep tracking if this level is all completed.
    if (allCompletedForLevel[key] && !completed) {
      allCompletedForLevel[key] = false;
    }

    // Make sure to update indent level
    currentIndention = indention;
  };

  // Count leafs and completed
  const countLeafsAndCompleted = taskId => {
    const hasChildren = localState.getIn(['hasChildren', taskId]);
    if (!hasChildren) {
      numberOfLeafs++;
      const completed = clientState.getIn(['completion', taskId]);
      if (completed) {
        numberOfCompleted++;
      }
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

  const selectedId = localState.get('selectedId');
  let foundSelectedId = false;

  let newVisibleOrder = fromJS([]);
  const filteredTaskIds = localState.get('filteredTaskIds');
  const filteredAssignee = localState.get('filteredAssignee');
  const filteredCompleted = localState.get('filteredCompleted');
  let indentComp = localState.get('indentComp') || defaultMap;

  let visibleRootIndention = -1;
  let filteredIndention = -1;

  let blockIndentionMoreThan = -1;
  let maxIndention = 0;

  const hasAnyFilter = filteredAssignee || filteredCompleted;

  const generateVisibleOrder = taskId => {
    const indention = clientState.getIn(['indention', taskId]);
    if (!localState.get('editing') && (!selectedId || !foundSelectedId)) {
      // filteredTaskIds
      if (filteredTaskIds) {
        if (filteredIndention > -1 && indention <= filteredIndention) {
          filteredIndention = -1;
        }
        if (filteredTaskIds.indexOf(taskId) > -1) {
          filteredIndention = indention;
          visibleRootIndention = -1;
          blockIndentionMoreThan = -1;
        }
        if (filteredIndention === -1) return;
      }

      // Support filters!
      if (hasAnyFilter) {
        if (visibleRootIndention > -1 && indention <= visibleRootIndention) {
          visibleRootIndention = -1;
        }
        if (visibleRootIndention === -1) {
          let matchedAllFilters = true;
          const assignees =
            clientState.getIn(['tasks_by_id', taskId, 'assignees']) ||
            defaultList;

          if (filteredAssignee && assignees.indexOf(filteredAssignee) === -1) {
            matchedAllFilters = false;
          } else if (
            filteredCompleted &&
            clientState.getIn(['completion', taskId])
          ) {
            matchedAllFilters = false;
          }
          if (matchedAllFilters) {
            visibleRootIndention = indention;
            blockIndentionMoreThan = -1;
          }
        }
        if (visibleRootIndention === -1) {
          return;
        }
      }

      // Make sure to hide all completed, despite being children
      if (filteredCompleted && clientState.getIn(['completion', taskId])) {
        return;
      }

      let comp = 0;
      if (visibleRootIndention > -1) {
        comp = visibleRootIndention;
      } else if (filteredIndention > -1) {
        comp = filteredIndention;
      }
      if (comp !== indentComp.get(taskId)) {
        indentComp = indentComp.set(taskId, comp);
      }

      maxIndention = Math.max(maxIndention, indention - comp);
    }

    // Hide collapsed items
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
    if (selectedId && selectedId === taskId) {
      foundSelectedId = true;
    }
    checkCompletionForTask(taskId);
    checkForOrderOfTask(taskId, index);
    checkHasChildrenForTask(taskId);
    countLeafsAndCompleted(taskId);
  }

  for (let index = 0; index < clientState.get('sortedOrder').size; index++) {
    const taskId = order.get(index);
    checkIndentionForTask(taskId);
    generateVisibleOrder(taskId);
  }
  if (selectedId && !foundSelectedId) {
    localState = localState.set('selectedId', null).set('selectionState', null);
  }
  if (
    localState.get('selectedId') &&
    !localState.get('editing') &&
    (hasAnyFilter || filteredTaskIds)
  ) {
    localState = localState.set('editing', true);
  }

  // Update max indention if needed
  if (localState.get('maxIndention') !== maxIndention) {
    localState = localState.set('maxIndention', maxIndention);
  }

  // Update visible order if needed
  if (localState.get('visibleOrder').size !== newVisibleOrder.size) {
    localState = localState.set('visibleOrder', newVisibleOrder);
  }
  if (localState.get('indentComp') !== indentComp) {
    localState = localState.set('indentComp', indentComp);
  }

  if (localState.get('numberOfLeafs') !== numberOfLeafs) {
    localState = localState.set('numberOfLeafs', numberOfLeafs);
  }
  if (localState.get('numberOfCompleted') !== numberOfCompleted) {
    localState = localState.set('numberOfCompleted', numberOfCompleted);
  }

  // Update Completion percentage if needed
  const percentageCompleted = numberOfLeafs
    ? Math.ceil((numberOfCompleted / numberOfLeafs) * 100)
    : 0;
  if (clientState.get('completion_percentage') !== percentageCompleted) {
    clientState = clientState.set('completion_percentage', percentageCompleted);
  }

  return [clientState, localState];
}
