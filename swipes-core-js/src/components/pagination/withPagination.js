import React, { PureComponent } from 'react';

import hoistNonReactStatics from 'hoist-non-react-statics';
import { Consumer } from './PaginationContext';

export default WrappedComponent => {
  class withPagination extends PureComponent {
    render() {
      return (
        <Consumer>
          {pagination => (
            <WrappedComponent pagination={pagination} {...this.props} />
          )}
        </Consumer>
      );
    }
  }
  hoistNonReactStatics(withPagination, WrappedComponent);
  return withPagination;
}