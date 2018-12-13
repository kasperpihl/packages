import React, { PureComponent } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import memoize from 'memoize-one';

import ProjectContext from './ProjectContext';

export default WrappedComponent => {
  class WithProjectTask extends PureComponent {
    // static contextType = ProjectContext;
    componentDidMount() {
      const stateManager = this.stateManager; // this.context;
      this.unsubscribe = stateManager.subscribe(this.checkRerender);
    }
    componentWillUnmount() {
      this.unsubscribe();
    }
    checkRerender = () => {
      const oldProps = this.generatedProps;
      this.generateProps();
      if (oldProps !== this.generatedProps) {
        this.forceUpdate();
      }
    };
    generateProps = () => {
      const stateManager = this.stateManager; // this.context;
      console.log('with', stateManager, this);
      const { taskId } = this.props;
      const clientState = stateManager.getClientState();
      const localState = stateManager.getLocalState();

      const selectedId = localState.get('selectedId');
      const selectionStart = localState.get('selectionStart');
      this.memoizeGenerateProps(
        clientState.getIn(['tasks_by_id', taskId, 'title']),
        taskId === selectedId,
        taskId === selectedId && selectionStart,
        clientState.getIn(['indention', taskId]),
        clientState.getIn(['completion', taskId]),
        localState.getIn(['hasChildren', taskId]),
        localState.getIn(['expanded', taskId])
      );
    };
    memoizeGenerateProps = memoize(
      (
        title,
        isSelected,
        selectionStart,
        indention,
        completion,
        hasChildren,
        expanded
      ) => {
        this.generatedProps = {
          title,
          isSelected,
          selectionStart,
          indention,
          completion,
          hasChildren,
          expanded
        };
      }
    );
    render() {
      // const stateManager = this.context;
      return (
        <ProjectContext.Consumer>
          {stateManager => {
            if (!stateManager || !stateManager.getClientState) {
              return null;
            }
            this.stateManager = stateManager;
            if (!this.generatedProps) {
              this.generateProps();
            }
            return (
              <WrappedComponent
                {...this.props}
                {...this.generatedProps}
                stateManager={stateManager}
              />
            );
          }}
        </ProjectContext.Consumer>
      );
    }
  }
  hoistNonReactStatics(WithProjectTask, WrappedComponent);
  return WithProjectTask;
};
