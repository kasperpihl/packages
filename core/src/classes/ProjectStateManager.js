import ProjectCompleteHandler from 'src/utils/project/handler/ProjectCompleteHandler';
import ProjectEditHandler from 'src/utils/project/handler/ProjectEditHandler';
import ProjectExpandHandler from 'src/utils/project/handler/ProjectExpandHandler';
import ProjectIndentHandler from 'src/utils/project/handler/ProjectIndentHandler';
import ProjectSelectHandler from 'src/utils/project/handler/ProjectSelectHandler';
import ProjectSyncHandler from 'src/utils/project/handler/ProjectSyncHandler';
import ProjectUndoHandler from 'src/utils/project/handler/ProjectUndoHandler';

import { fromJS } from 'immutable';
import randomString from 'src/utils/randomString';
import projectValidateStates from 'src/utils/project/projectValidateStates';

/*
The responsibility of State Manager is to handle 
the full state for a ProjectOverview, it achieves this with help from
*/
export default class ProjectStateManager {
  constructor(serverState) {
    let clientState = serverState.set(
      'sortedOrder',
      serverState
        .get('ordering')
        .sort((a, b) => {
          if (a < b) return -1;
          if (a > b) return 1;
          return 0;
        })
        .keySeq()
        .toList()
    );
    let localState = fromJS({
      hasChildren: {},
      selectedId: null,
      sliderValue: 0,
      expanded: {},
      visibleOrder: []
    });

    this._clientState = clientState;
    this._localState = localState;

    this._subscriptions = {};
    this._destroyHandlers = [];

    this.completeHandler = new ProjectCompleteHandler(this);
    this.editHandler = new ProjectEditHandler(this);
    this.expandHandler = new ProjectExpandHandler(this);
    this.indentHandler = new ProjectIndentHandler(this);
    this.selectHandler = new ProjectSelectHandler(this);
    this.syncHandler = new ProjectSyncHandler(this);
    this.undoHandler = new ProjectUndoHandler(this);

    [clientState, localState] = projectValidateStates(clientState, localState);
    if (clientState !== this._clientState || localState !== this._localState) {
      this._update({ localState, clientState });
    }
  }
  unsubscribe = subId => {
    delete this._subscriptions[subId];
  };
  subscribe = callback => {
    const subId = randomString(6);
    this._subscriptions[subId] = callback;
    return this.unsubscribe.bind(null, subId);
  };
  getClientState = () => this._clientState;
  getLocalState = () => this._localState;
  // Used by all the handlers when they want to update the state.
  _update = ({ localState, clientState }, options = {}) => {
    if (localState || clientState) {
      this._localState = localState || this._localState;
      this._clientState = clientState || this._clientState;
      Object.values(this._subscriptions).forEach(callback =>
        callback(this, options)
      );
    }
  };
}
