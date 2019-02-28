import projectValidateStates from 'src/utils/project/projectValidateStates';

export default class ProjectCompleteHandler {
  constructor(stateManager) {
    this.stateManager = stateManager;
  }
  complete = id => {
    this._completeById(id, true);
  };
  incomplete = id => {
    this._completeById(id, false);
  };
  _completeById = (idToComplete, shouldComplete) => {
    let clientState = this.stateManager.getClientState();
    let localState = this.stateManager.getLocalState();

    const indexToComplete = clientState.getIn(['ordering', idToComplete]);
    const orgIndent = clientState.getIn(['indention', idToComplete]);

    let deltaIndex = indexToComplete;
    let deltaIndent = orgIndent;
    do {
      // Set all children and grandchildren
      let deltaId = clientState.getIn(['sortedOrder', deltaIndex]);
      clientState = clientState.setIn(
        ['completion', deltaId],
        !!shouldComplete
      );
      deltaIndex++;
      deltaId = clientState.getIn(['sortedOrder', deltaIndex]);
      deltaIndent = clientState.getIn(['indention', deltaId]);
    } while (
      deltaIndent > orgIndent &&
      deltaIndex < clientState.get('sortedOrder').size
    );

    [clientState, localState] = projectValidateStates(clientState, localState);

    this.stateManager._update({ clientState });
  };
}