export default class ProjectSelectHandler {
  constructor(stateManager) {
    this.stateManager = stateManager;
  }
  selectNext = (selectionStart = null) => {
    this._selectWithModifier(1, selectionStart);
  };
  selectPrev = (selectionStart = null) => {
    this._selectWithModifier(-1, selectionStart);
  };
  _selectWithModifier = (modifier, selectionStart) => {
    let localState = this.stateManager.getLocalState();

    const selectedId = localState.get('selectedId');
    const visibleOrder = localState.get('visibleOrder');
    const visibleI = visibleOrder.findIndex(taskId => taskId === selectedId);
    const nextI = (visibleI + modifier) % visibleOrder.size;

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
    // const clientState = this.stateManager.getClientState();
    // console.log(
    //   value
    //     ? `selecting ${clientState.getIn(['tasks_by_id', value, 'title'])}`
    //     : 'deselecting',
    //   localState.get('selectedId')
    // );
    if (localState.get('selectedId') !== value) {
      localState = localState.set('selectedId', value);
      this.stateManager._update({ localState }, false);
    }
  };
}
