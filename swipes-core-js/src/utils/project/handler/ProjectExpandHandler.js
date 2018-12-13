import projectGenerateVisibleOrder from 'src/utils/project/projectGenerateVisibleOrder';

export default class ProjectExpandHandler {
  constructor(stateManager) {
    this.stateManager = stateManager;
  }
  setDepth = depth => {
    const clientState = this.stateManager.getClientState();
    let localState = this.stateManager.getLocalState();

    clientState.get('sortedOrder').forEach(taskId => {
      const indention = clientState.getIn(['indention', taskId]);
      const shouldBeExpanded = indention < depth;
      if (localState.getIn(['expanded', taskId]) !== shouldBeExpanded) {
        localState = localState.setIn(['expanded', taskId], shouldBeExpanded);
      }
    });
    localState = projectGenerateVisibleOrder(clientState, localState);
    this.stateManager._update({
      localState
    });
  };
  expand = id => {
    this._expandById(id, true);
  };
  collapse = id => {
    this._expandById(id, false);
  };
  _expandById = (id, expand) => {
    const clientState = this.stateManager.getClientState();
    let localState = this.stateManager.getLocalState();

    if (!localState.getIn(['hasChildren', id])) return;
    localState = localState.setIn(['expanded', id], expand);
    localState = projectGenerateVisibleOrder(clientState, localState);
    this.stateManager._update({ localState });
  };
}
