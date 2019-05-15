import React, { PureComponent } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import memoize from 'memoize-one';

import { ProjectContext } from './ProjectProvider';

export default WrappedComponent => {
  class WithProjectTask extends PureComponent {
    // static contextType = ProjectContext;
    componentDidMount() {
      const stateManager = this.stateManager; // this.context;
      this.unsubscribe = stateManager.subscribe(this.checkRerender);
    }
    componentWillUnmount() {
      this._unmounted = true;
      this.unsubscribe();
    }
    checkRerender = () => {
      if (this._unmounted) return;
      const oldProps = this.generatedProps;
      this.generateProps();
      if (oldProps !== this.generatedProps) {
        this.forceUpdate();
      }
    };
    generateProps = () => {
      const stateManager = this.stateManager; // this.context;
      const { taskId } = this.props;
      const clientState = stateManager.getClientState();
      const localState = stateManager.getLocalState();

      if (typeof clientState.getIn(['ordering', taskId]) !== 'number') {
        this.generatedProps = undefined;
        // Task is deleted, don't render!
        return;
      }

      const selectedId = localState.get('selectedId');
      const selectionStart = localState.get('selectionStart');
      this.memoizeGenerateProps(
        clientState.getIn(['tasks_by_id', taskId, 'title']),
        clientState.getIn(['tasks_by_id', taskId, 'assignees']),
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
        assignees,
        isSelected,
        selectionStart,
        indention,
        completion,
        hasChildren,
        expanded
      ) => {
        this.generatedProps = {
          title,
          assignees,
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
            // Make sure deleted tasks does not get rendered
            if (
              !this.generatedProps ||
              typeof this.generatedProps.title === 'undefined'
            )
              return null;
            return (
              <WrappedComponent
                {...this.props}
                task={this.generatedProps}
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
