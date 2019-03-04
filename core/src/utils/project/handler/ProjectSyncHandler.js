import { fromJS } from 'immutable';
import throttle from 'src/utils/throttle';
import debounce from 'src/utils/debounce';
import request from 'src/utils/request';
import randomString from 'src/utils/randomString';
import projectValidateStates from 'src/utils/project/projectValidateStates';

export default class ProjectSyncHandler {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.currentServerState = stateManager.getClientState();
    this.latestRev = this.currentServerState.get('rev');
    this.deletedIds = [];
    this.myUpdates = {};
    this.throttledSync = throttle(this.syncIfNeeded, 1000);
    this.bouncedThrottle = debounce(this.throttledSync, 50);
    stateManager.subscribe(this.bouncedThrottle);
  }
  mergeChange = async changes => {
    if (changes.rev <= this.latestRev) {
      return;
    }
    const localChanges = this.getLocalChanges() || {};
    const isDirty = !!Object.keys(localChanges).length;

    let clientState = this.stateManager.getClientState();
    let localState = this.stateManager.getLocalState();

    const { completion, indention, ordering, tasks_by_id, ...rest } = changes;

    if (completion) {
      clientState = clientState.mergeIn(
        ['completion'],
        completion,
        localChanges.completion
      );
    }

    if (indention) {
      clientState = clientState.mergeIn(
        ['indention'],
        indention,
        localChanges.indention
      );
    }

    if (ordering) {
      clientState = clientState.set('ordering', fromJS(ordering));

      let fullListOfIds = clientState.get('ordering');

      if (isDirty) {
        fullListOfIds = clientState
          .mergeIn(['ordering'], ordering)
          .get('ordering');
      }

      clientState = clientState.set(
        'sortedOrder',
        clientState
          .get('ordering')
          .sort((a, b) => {
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
          })
          .keySeq()
          .toList()
      );

      fullListOfIds.forEach((i, taskId) => {
        if (typeof ordering[taskId] !== 'number') {
          clientState = clientState.deleteIn(['ordering', taskId]);
          clientState = clientState.deleteIn(['completion', taskId]);
          clientState = clientState.deleteIn(['indention', taskId]);
          clientState = clientState.deleteIn(['tasks_by_id', taskId]);

          localState = localState.deleteIn(['expanded', taskId]);
          localState = localState.deleteIn(['hasChildren', taskId]);
        }
      });
    }

    if (tasks_by_id) {
      Object.entries(tasks_by_id).forEach(([taskId, task]) => {
        const localTask =
          (localChanges.tasks_by_id && localChanges.tasks_by_id[taskId]) || {};

        clientState = clientState.mergeIn(
          ['tasks_by_id', taskId],
          fromJS(task),
          fromJS(localTask)
        );
      });
    }

    clientState = clientState.mergeDeep(rest);

    [clientState, localState] = projectValidateStates(clientState, localState);
    [clientState, localState] = projectValidateStates(clientState, localState);

    this.stateManager._update({ clientState, localState });
    if (!Object.keys(localChanges).length) {
      this.currentServerState = clientState;
    }
    this.latestRev = changes.rev;
  };
  getLocalChanges = () => {
    const clientState = this.stateManager.getClientState();

    const serverKeys = ['ordering', 'indention', 'completion', 'tasks_by_id'];
    const server = {};

    if (clientState.get('title') !== this.currentServerState.get('title')) {
      server.title = clientState.get('title');
    }
    if (
      clientState.get('completion_percentage') !==
      this.currentServerState.get('completion_percentage')
    ) {
      server.completion_percentage = clientState.get('completion_percentage');
    }

    serverKeys.forEach(key => (server[key] = {}));

    clientState.get('sortedOrder').forEach(taskId => {
      // Client values
      const cOrder = clientState.getIn(['ordering', taskId]);
      const cIndent = clientState.getIn(['indention', taskId]);
      const cCompletion = clientState.getIn(['completion', taskId]);
      const cTask = clientState.getIn(['tasks_by_id', taskId]);

      // Server values
      const sOrder = this.currentServerState.getIn(['ordering', taskId]);
      const sIndent = this.currentServerState.getIn(['indention', taskId]);
      const sCompletion = this.currentServerState.getIn(['completion', taskId]);
      const sTask = this.currentServerState.getIn(['tasks_by_id', taskId]);

      if (sOrder !== cOrder) {
        server.ordering[taskId] = cOrder;
      }
      if (sIndent !== cIndent) {
        server.indention[taskId] = cIndent;
      }
      if ((!sCompletion && cCompletion) || (sCompletion && !cCompletion)) {
        server.completion[taskId] = cCompletion;
      }

      if (sTask !== cTask && cTask) {
        server.tasks_by_id[taskId] = cTask.toJS();
      }
    });

    this.deletedIds.forEach(id => {
      server.tasks_by_id[id] = null;
      server.indention[id] = null;
      server.ordering[id] = null;
      server.completion[id] = null;
    });

    serverKeys.forEach(
      key => !Object.keys(server[key]).length && delete server[key]
    );

    if (Object.keys(server).length) {
      return server;
    }
    return null;
  };
  syncIfNeeded = () => {
    if (this.isSyncing) {
      this.bouncedThrottle();
      return;
    }
    this.bouncedThrottle.clear();
    this.throttledSync.clear();
    const server = this.getLocalChanges();
    if (!server) {
      return;
    }
    const clientState = this.stateManager.getClientState();
    server.project_id = this.currentServerState.get('project_id');
    server.rev = this.latestRev;
    server.update_identifier = randomString(6);
    this.isSyncing = true;
    request('project.sync', server).then(res => {
      this.isSyncing = false;
      if (res.ok) {
        this.currentServerState = clientState;
        this.latestRev = res.rev;
      } else {
        this.bouncedThrottle();
      }
    });
  };
  delete = id => {
    this.deletedIds.push(id);
  };
}
