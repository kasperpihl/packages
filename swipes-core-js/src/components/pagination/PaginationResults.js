import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Provider, Consumer } from './PaginationContext';

@connect((state, props) => ({
  results: !!props.selector && props.selector(state, props),
}))
export default class PaginationResults extends PureComponent {
  constructor(props) { 
    super(props);
    this.state = {
      results: props.results,
    }
  } 
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
  componentWillReceiveProps(nextProps) {
    if(!nextProps.results || (this.props.results !== nextProps.results && !nextProps.pagination.loading)) {
      this.setState({ results: nextProps.results });
    }
    else if(this.props.pagination.loading && !nextProps.pagination.loading) {
      this.setState({ results: nextProps.results });
    }
  }
  render() {
    const pagination = Object.assign({}, this.props.pagination, {
      results: this.state.results,
    });
    return (
      <Provider value={pagination}>
        {this.renderChildren()}
      </Provider>
    );
  }
}