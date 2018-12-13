import { fromJS } from 'immutable';
import projectGenerateVisibleOrder from 'src/utils/project/projectGenerateVisibleOrder';

export default clientState => {
  let localState = fromJS({
    hasChildren: {},
    selectedId: null,
    sliderValue: 0,
    expanded: {}
  });

  clientState.get('sortedOrder').forEach((taskId, i) => {
    const indention = clientState.getIn(['indention', taskId]);

    const nextIndention =
      clientState.getIn([
        'indention',
        clientState.getIn(['sortedOrder', i + 1])
      ]) || -1;

    localState = localState.setIn(
      ['hasChildren', taskId],
      indention < nextIndention
    );
    localState = localState.setIn(['expanded', taskId], false);
  });

  localState = projectGenerateVisibleOrder(clientState, localState);
  return localState;
};
