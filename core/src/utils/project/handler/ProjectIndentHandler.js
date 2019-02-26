import projectIndentTaskAndChildren from 'src/utils/project/projectIndentTaskAndChildren';
import projectValidateStates from 'src/utils/project/projectValidateStates';

export default class ProjectIndentHandler {
  constructor(stateManager) {
    this.stateManager = stateManager;
  }
  indent = id => {
    this._indentWithModifier(id, 1);
  };
  outdent = id => {
    this._indentWithModifier(id, -1);
  };
  _indentWithModifier = (id, modifier) => {
    let clientState = this.stateManager.getClientState();
    let localState = this.stateManager.getLocalState();

    clientState = projectIndentTaskAndChildren(clientState, id, modifier);

    // Ensure parent gets expanded
    const visibleIndex = localState
      .get('visibleOrder')
      .findIndex(taskId => taskId === id);
    if (visibleIndex > 0) {
      const prevVisibleId = localState.getIn([
        'visibleOrder',
        visibleIndex - 1
      ]);
      if (
        clientState.getIn(['indention', id]) >
          clientState.getIn(['indention', prevVisibleId]) &&
        modifier > 0
      ) {
        localState = localState.setIn(['expanded', prevVisibleId], true);
      }
    }

    [clientState, localState] = projectValidateStates(clientState, localState);
    this.stateManager._update({
      clientState,
      localState
    });
  };
}
