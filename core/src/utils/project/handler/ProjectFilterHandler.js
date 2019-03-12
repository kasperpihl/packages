import { fromJS } from 'immutable';
import projectEnsureVisible from 'src/utils/project/projectEnsureVisible';
import projectValidateStates from 'src/utils/project/projectValidateStates';

export default class ProjectFilterHandler {
  constructor(stateManager) {
    this.stateManager = stateManager;
  }
  setFilteredTaskIds = (filteredTaskIds, ensureVisible) => {
    let clientState = this.stateManager.getClientState();
    let localState = this.stateManager.getLocalState();

    localState = localState
      .set('filteredTaskIds', filteredTaskIds && fromJS(filteredTaskIds))
      .set('indentComp', null);

    if (ensureVisible) {
      [clientState, localState] = projectEnsureVisible(
        clientState,
        localState,
        ensureVisible
      );
    }

    [clientState, localState] = projectValidateStates(clientState, localState);
    this.stateManager._update({ localState, clientState });
  };
}
