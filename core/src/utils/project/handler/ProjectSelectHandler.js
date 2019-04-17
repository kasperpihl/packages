import projectValidateStates from 'src/utils/project/projectValidateStates';

export default class ProjectSelectHandler {
  constructor(stateManager) {
    this.stateManager = stateManager;
  }
  selectNext = currSelStart => {
    this._selectWithModifier(1, currSelStart);
  };
  selectPrev = currSelStart => {
    this._selectWithModifier(-1, currSelStart);
  };
  _selectWithModifier = (modifier, currSelStart) => {
    let localState = this.stateManager.getLocalState();
    let clientState = this.stateManager.getClientState();

    const selectedId = localState.get('selectedId');
    const visibleOrder = localState.get('visibleOrder');
    const visibleI = visibleOrder.findIndex(taskId => taskId === selectedId);
    const nextI = (visibleI + modifier) % visibleOrder.size;

    let selectionStart = clientState.getIn([
      'tasks_by_id',
      visibleOrder.get(nextI),
      'title'
    ]).length;
    if (currSelStart === 0) {
      selectionStart = 0;
    }

    localState = localState
      .set('selectedId', visibleOrder.get(nextI))
      .set('selectionStart', selectionStart);

    this.stateManager._update({ localState }, false);
  };
  select = id => {
    this._selectValue(id);
  };
  deselect = id => {
    const localState = this.stateManager.getLocalState();
    if (localState.get('selectedId') === id) {
      this._selectValue(null);
    }
  };
  _selectValue = value => {
    let localState = this.stateManager.getLocalState();
    let clientState = this.stateManager.getClientState();

    if (localState.get('selectedId') !== value) {
      localState = localState.set('selectedId', value);

      [clientState, localState] = projectValidateStates(
        clientState,
        localState
      );
      this.stateManager._update({ localState, clientState });
    }
  };
}
