export default class ProjectQueryHandler {
  constructor(stateManager) {
    this.stateManager = stateManager;
  }
  getCompletedAndTotal(taskId) {
    const clientState = this.stateManager.getClientState();
    const localState = this.stateManager.getLocalState();

    let completed = 0;
    let total = 0;
    let dIndex = clientState.getIn(['ordering', taskId]);
    const targetIndention = clientState.getIn(['indention', taskId]);
    const sortedOrder = clientState.get('sortedOrder');
    while (dIndex < sortedOrder.size) {
      const tId = sortedOrder.get(dIndex);
      const indention = clientState.getIn(['indention', tId]);
      if (total > 0 && indention <= targetIndention) {
        return [completed, total];
      }
      const hasChildren = localState.getIn(['hasChildren', tId]);
      if (!hasChildren) {
        total++;
        const isCompleted = clientState.getIn(['completion', tId]);
        if (isCompleted) {
          completed++;
        }
      }

      dIndex++;
    }

    return [completed, total];
  }
}
