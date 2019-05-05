import randomString from 'src/utils/randomString';
import { fromJS } from 'immutable';
import projectValidateStates from 'src/utils/project/projectValidateStates';
import projectDeleteTaskId from 'src/utils/project/projectDeleteTaskId';

export default class ProjectEditHandler {
  constructor(stateManager) {
    this.stateManager = stateManager;
  }
  doneEditing = () => {
    let clientState = this.stateManager.getClientState();
    let localState = this.stateManager.getLocalState();
    if (localState.get('editing')) {
      localState = localState.set('selectedId', null).set('editing', false);
    }
    [clientState, localState] = projectValidateStates(clientState, localState);
    this.stateManager._update({ localState, clientState });
  };
  attach = (taskId, attachment) => {
    let clientState = this.stateManager.getClientState();
    let localState = this.stateManager.getLocalState();

    const newId = randomString(5);
    const nextIndex = clientState.getIn(['ordering', taskId]) + 1;
    const targetIndention = clientState.getIn(['indention', taskId]) + 1;

    localState = localState.setIn(['expanded', taskId], true);

    clientState = clientState.setIn(
      ['tasks_by_id', newId],
      fromJS({
        task_id: newId,
        title: attachment.title,
        assignees: [],
        due_date: null,
        attachment
      })
    );

    clientState = clientState.setIn(['indention', newId], targetIndention);

    clientState = clientState.set(
      'sortedOrder',
      clientState.get('sortedOrder').insert(nextIndex, newId)
    );

    [clientState, localState] = projectValidateStates(clientState, localState);
    this.stateManager._update({ localState, clientState });
  };

  updateTitle = (id, title) => {
    let clientState = this.stateManager.getClientState();
    clientState = clientState.setIn(['tasks_by_id', id, 'title'], title);
    this.stateManager._update({ clientState }, `${id}-title`);
  };

  updateAssignees = (id, assignees) => {
    let clientState = this.stateManager.getClientState();
    clientState = clientState.setIn(
      ['tasks_by_id', id, 'assignees'],
      assignees
    );
    this.stateManager._update({ clientState });
  };

  deleteCompleted = () => {
    let clientState = this.stateManager.getClientState();
    let localState = this.stateManager.getLocalState();

    clientState.get('sortedOrder').forEach(taskId => {
      if (clientState.getIn(['completion', taskId])) {
        [clientState, localState] = projectDeleteTaskId(
          clientState,
          localState,
          taskId
        );
        this.stateManager.syncHandler.delete(taskId);
      }
    });

    localState = localState.set('selectedId', null);
    localState = localState.set('selectionStart', null);

    [clientState, localState] = projectValidateStates(clientState, localState);
    this.stateManager._update({ localState, clientState });
  };

  delete = id => {
    let clientState = this.stateManager.getClientState();
    let localState = this.stateManager.getLocalState();

    const visibleOrder = localState.get('visibleOrder');
    const visibleIndex = visibleOrder.findIndex(taskId => taskId === id);

    if (visibleIndex === 0) {
      return;
    }

    const currentTitle = clientState.getIn(['tasks_by_id', id, 'title']);
    const prevId = visibleOrder.get(visibleIndex - 1);

    [clientState, localState] = projectDeleteTaskId(
      clientState,
      localState,
      id
    );
    this.stateManager.syncHandler.delete(id);

    localState = localState.set('selectedId', prevId);
    localState = localState.set('selectionStart', null);

    if (currentTitle) {
      const prevTitle = clientState.getIn(['tasks_by_id', prevId, 'title']);
      localState = localState.set('selectionStart', prevTitle.length);
      clientState = clientState.setIn(
        ['tasks_by_id', prevId, 'title'],
        prevTitle + currentTitle
      );
    }

    [clientState, localState] = projectValidateStates(clientState, localState);
    this.stateManager._update({ localState, clientState });
  };

  enter = (id, selectionStart = null) => {
    let clientState = this.stateManager.getClientState();
    let localState = this.stateManager.getLocalState();

    let currTitle = clientState.getIn(['tasks_by_id', id, 'title']);
    if (typeof selectionStart !== 'number') {
      selectionStart = currTitle.length;
    }

    const indention = clientState.getIn(['indention', id]);

    if (!currTitle.length && indention > 0) {
      return this.stateManager.indentHandler.outdent(id);
    }

    let nextTitle = '';
    if (selectionStart < currTitle.length) {
      nextTitle = currTitle.slice(selectionStart);
      currTitle = currTitle.slice(0, selectionStart);
      clientState = clientState.setIn(['tasks_by_id', id, 'title'], currTitle);
    }

    const newId = randomString(5);
    clientState = clientState.setIn(
      ['tasks_by_id', newId],
      fromJS({
        task_id: newId,
        title: nextTitle,
        assignees: [],
        due_date: null
      })
    );

    localState = localState.setIn(['expanded', newId], false);
    localState = localState.setIn(['hasChildren', newId], false);
    localState = localState.set('selectedId', newId);
    localState = localState.set('selectionStart', 0);

    const currentIndention = clientState.getIn(['indention', id]);
    const currentHasChildren = localState.getIn(['hasChildren', id]);
    const currentIsExpanded = localState.getIn(['expanded', id]);

    let nextIndex = clientState.getIn(['ordering', id]) + 1;
    let nextIndention = currentIndention;
    if (currentHasChildren) {
      if (currentIsExpanded) {
        nextIndention++;
      } else {
        do {
          nextIndex++;
          nextIndention =
            clientState.getIn([
              'indention',
              clientState.getIn(['sortedOrder', nextIndex])
            ]) || 0;
        } while (
          nextIndention > currentIndention &&
          nextIndex < clientState.get('sortedOrder').size
        );
      }
    }

    clientState = clientState.setIn(['indention', newId], nextIndention);

    clientState = clientState.set(
      'sortedOrder',
      clientState.get('sortedOrder').insert(nextIndex, newId)
    );

    [clientState, localState] = projectValidateStates(clientState, localState);

    this.stateManager._update({ clientState, localState });
  };
}
