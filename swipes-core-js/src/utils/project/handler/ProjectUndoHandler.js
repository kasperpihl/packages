import { fromJS } from 'immutable';

export default class ProjectKeyHandler {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.redoStack = fromJS([]);
    this.undoStack = fromJS([]);
  }
  revertToState = state => {
    state.selectedIndex = -1;
    delete state.selectedId;
    delete state.selectionStart;
    this.stateManager._updateState(state);
  };
  pushToUndoStack(undoString) {
    if (undoString === false) return;
    if (typeof undoString === 'string') {
      if (undoString === this.currentUndoString) return;
      this.currentUndoString = undoString;
    } else {
      this.currentUndoString = undefined;
    }
    this.undoStack = this.undoStack.push(this.state).takeLast(10);
  }
  undo = () => {
    const lastState = this.undoStack.last();
    if (lastState) {
      this.redoStack = this.redoStack.push(this.state);
      this.undoStack = this.undoStack.butLast();
      this.revertToState(lastState);
    }
  };
  redo = () => {
    const lastState = this.redoStack.last();
    if (lastState) {
      this.undoStack = this.undoStack.push(this.state);
      this.redoStack = this.redoStack.butLast();
      this.revertToState(lastState);
    }
  };
  // stateManager will set this, once an update happens.
  setState = state => {
    this.state = state;
  };
}
