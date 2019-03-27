import { fromJS } from 'immutable';
import projectEnsureVisible from 'src/utils/project/projectEnsureVisible';
import projectValidateStates from 'src/utils/project/projectValidateStates';

export default class ProjectFilterHandler {
  constructor(stateManager) {
    this.stateManager = stateManager;
  }
  setFilteredCompleted = bool => {
    let clientState = this.stateManager.getClientState();
    let localState = this.stateManager.getLocalState();

    localState = localState
      .set('filteredCompleted', bool)
      .set('indentComp', null);

    [clientState, localState] = projectValidateStates(clientState, localState);
    this.stateManager._update({ localState, clientState });
  };
  setFilteredAssignee = assigneeId => {
    let clientState = this.stateManager.getClientState();
    let localState = this.stateManager.getLocalState();

    localState = localState
      .set('filteredAssignee', assigneeId)
      .set('indentComp', null);

    [clientState, localState] = projectValidateStates(clientState, localState);
    this.stateManager._update({ localState, clientState });
  };
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
    } else {
      localState = localState.set(
        'expanded',
        localState.get('expanded').map(() => false)
      );
    }

    [clientState, localState] = projectValidateStates(clientState, localState);
    this.stateManager._update({ localState, clientState });
  };
}
