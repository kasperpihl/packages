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
  expand = id => {
    this._expandById(id, true);
  };
  collapse = id => {
    this._expandById(id, false);
  };
  _expandById = (id, expand) => {
    let clientState = this.stateManager.getClientState();
    let localState = this.stateManager.getLocalState();

    if (!localState.getIn(['hasChildren', id])) return;
    localState = localState.setIn(['expanded', id], expand);
    [clientState, localState] = projectValidateStates(clientState, localState);
    this.stateManager._update({ localState });
  };
}
