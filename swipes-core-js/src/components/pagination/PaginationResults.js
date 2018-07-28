import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Provider, Consumer } from './PaginationContext';

@connect((state, props) => ({
  results: !!props.selector && props.selector(state, props),
}))
export default class PaginationResults extends PureComponent {
  renderChildren() {
    const { children } = this.props;
    if(typeof children !== 'function') {
      return children;
    }

    return (
      <Consumer>
        {pagination => children(pagination)}
      </Consumer>
    )
  }
  render() {
    const pagination = Object.assign({}, this.props.pagination, {
      results: this.props.results,
    });
    return (
      <Provider value={pagination}>
        {this.renderChildren()}
      </Provider>
    );
  }
}