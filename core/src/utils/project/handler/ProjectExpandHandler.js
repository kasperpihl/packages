import projectValidateStates from 'src/utils/project/projectValidateStates';

export default class ProjectExpandHandler {
  constructor(stateManager) {
    this.stateManager = stateManager;
  }
  setDepth = depth => {
    let clientState = this.stateManager.getClientState();
    let localState = this.stateManager.getLocalState();

    clientState.get('sortedOrder').forEach(taskId => {
      const indention = clientState.getIn(['indention', taskId]);
      const indentComp = localState.getIn(['indentComp', taskId]) || 0;
      const shouldBeExpanded = indention - indentComp < depth;
      if (localState.getIn(['expanded', taskId]) !== shouldBeExpanded) {
        localState = localState.setIn(['expanded', taskId], shouldBeExpanded);
      }
    });
    [clientState, localState] = projectValidateStates(clientState, localState);
    this.stateManager._update({ localState });
  };
  expand = (id, fully) => {
    this._expandById(id, fully, true);
  };
  collapse = (id, fully) => {
    this._expandById(id, fully, false);
  };
  _expandById = (id, fully, expand) => {
    let clientState = this.stateManager.getClientState();
    let localState = this.stateManager.getLocalState();

    if (!localState.getIn(['hasChildren', id])) return;
    localState = localState.setIn(['expanded', id], expand);
    if (fully) {
      let deltaIndex = clientState.getIn(['ordering', id]);
      const indention = clientState.getIn(['indention', id]);
      let nextTaskId;
      let nextTaskIndention;

      do {
        deltaIndex++;
        nextTaskId = clientState.getIn(['sortedOrder', deltaIndex]);
        nextTaskIndention = clientState.getIn(['indention', nextTaskId]);
        if (
          nextTaskIndention > indention &&
          localState.getIn(['hasChildren', nextTaskId])
        ) {
          localState = localState.setIn(['expanded', nextTaskId], expand);
        }
      } while (nextTaskId && nextTaskIndention > indention);
    }
    [clientState, localState] = projectValidateStates(clientState, localState);
    this.stateManager._update({ localState });
  };
}
