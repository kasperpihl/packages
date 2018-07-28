import React, { PureComponent } from 'react';
import { fromJS } from 'immutable';
import { connect } from 'react-redux';
import getDeep from '../../utils/getDeep';
import randomString from '../../utils/randomString';
import createCacheSelector from '../../utils/createCacheSelector';
import * as ca from '../../actions';
import PaginationResults from './PaginationResults';
const DEFAULT_LIMIT = 1;

export default @connect(state => ({
  isOnline: state.connection.get('status') === 'online',
}), {
  apiRequest: ca.api.request,
  cacheSave: ca.cache.save,
  cacheGetSelector: ca.cache.getSelector,
})
class PaginationProvider extends PureComponent {
  constructor(props) {
    super(props);
    const { options } = props;
    this.state = {
      loadMore: this.loadMore,
      loading: false,
      error: false,
      hasMore: false,
    };
  }
  componentDidMount() {
    this.fetchResults();
  }
  componentWillReceiveProps(nextProps) {
    console.log(this.props.isOnline, nextProps.isOnline);
    if(!this.props.isOnline && nextProps.isOnline !== this.props.isOnline) {
      this.forceRefresh = true;
    }
  }
  loadMore = () => {
    this.fetchResults();
  }
  componentDidUpdate(prevProps) {
    const { selector, request} = this.props;
    if(this.forceRefresh || request.body !== prevProps.request.body) {
      if(!this.forceRefresh) {
        this.selector = null;
      } else {
        this.forceSkip = true;
      }
      this.forceRefresh = false;
      this.fetchId = null;
      this.setState({
        hasMore: false,
        loading: false,
      }, this.fetchResults);
    }
  }
  componentWillUnmount() {
    this._unmounted = true;
  }
  mergeResults(newResults) {
    const { results } = this.state;
    if(results) {
      return results.concat(newResults);
    }
    return newResults;
  }
  fetchResults = () => {
    const { isOnline, apiRequest, request, cache, cacheSave, cacheGetSelector } = this.props;
    const { loading } = this.state;

    if(loading || !isOnline) return;
    const fetchId = randomString(8);
    this.fetchId = fetchId;
    const limit = this.props.limit || DEFAULT_LIMIT;
    this.setState({ loading: true, error: false });
    apiRequest(request.url, {
      skip: (this.selector && !this.forceSkip) ? cacheGetSelector(this.selector, this.props).size : 0,
      limit,
      ...request.body,
    }).then((res) => {
      if(this.fetchId !== fetchId || this._unmounted) return;
      if(res && res.ok) {
        this.forceSkip = undefined;
        const newResults = getDeep(res, request.resPath || 'results');
        newResults.forEach((r) => {
          let path = cache.path;
          if(!Array.isArray(path)) path = [path]; 
          cacheSave([...path, r.id], fromJS(r))
        });
        if(newResults.length) {
          let orderKey = cache.orderBy;
          if(orderKey.startsWith('-')) orderKey = orderKey.slice(1);
          this.selector = createCacheSelector(cache, newResults[newResults.length - 1][orderKey])
        }
        this.setState({
          hasMore: newResults.length === limit,
          loading: false,
        });
      } else this.setState({ loading: false, error: true });
    })
  }
  render() {
    return (
      <PaginationResults pagination={this.state} selector={this.selector} {...this.props}/>
    );
  }
}