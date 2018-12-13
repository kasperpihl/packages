import projectIndentTaskAndChildren from 'src/utils/project/projectIndentTaskAndChildren';
import projectUpdateHasChildrenForTask from 'src/utils/project/projectUpdateHasChildrenForTask';
import projectForceParentExpandedForTask from 'src/utils/project/projectForceParentExpandedForTask';
import projectValidateCompletion from 'src/utils/project/projectValidateCompletion';

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
    localState = projectUpdateHasChildrenForTask(clientState, localState, id);
    localState = projectForceParentExpandedForTask(clientState, localState, id);
    clientState = projectValidateCompletion(clientState);
    this.stateManager._update({
      clientState,
      localState
    });
  };
}
