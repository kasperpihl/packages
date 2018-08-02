import React, { PureComponent } from 'react';
import { fromJS } from 'immutable';
import { connect } from 'react-redux';
import shallowEqual from '../../utils/shallowEqual';
import getDeep from '../../utils/getDeep';
import randomString from '../../utils/randomString';
import createCacheSelector from '../../utils/createCacheSelector';
import * as ca from '../../actions';
import PaginationResults from './PaginationResults';
const DEFAULT_LIMIT = 20;

export default @connect(state => ({
  isOnline: state.connection.get('status') === 'online',
}), {
  apiRequest: ca.api.request,
  cacheSaveBatch: ca.cache.saveBatch,
  cacheGetSelector: ca.cache.getSelector,
})
class PaginationProvider extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      loadMore: this.loadMore,
      loading: false,
      error: false,
      hasMore: false,
    };
    this.forceSkip = true;
    this.hasLoaded = false;
    this.selector = createCacheSelector(props.cache)
  }
  componentDidMount() {
    this.fetchResults();
  }
  componentWillReceiveProps(nextProps) {
    if(!this.props.isOnline && nextProps.isOnline) {
      this.forceRefresh = true;
    }
  }
  loadMore = () => {
    this.fetchResults();
  }
  componentDidUpdate(prevProps) {
    const { selector, request} = this.props;
    if(this.forceRefresh || request.url !== prevProps.request.url || !shallowEqual(request.body, prevProps.request.body)) {
      this.forceSkip = true;
      this.selector = createCacheSelector(this.props.cache);
      this.hasLoaded = false;
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
  fetchResults = (initial) => {
    const { isOnline, apiRequest, request, cache, cacheSaveBatch, cacheGetSelector } = this.props;
    const { loading } = this.state;

    if(loading || !isOnline) return;
    const fetchId = randomString(8);
    this.fetchId = fetchId;
    const limit = this.props.limit || DEFAULT_LIMIT;
    this.setState({ loading: true, error: false });
    const currentCache = cacheGetSelector(this.selector, this.props);
    apiRequest(request.url, {
      skip: (!this.forceSkip && currentCache) ? currentCache.size : 0,
      limit,
      ...request.body,
    }).then((res) => {
      if(this.fetchId !== fetchId || this._unmounted) return;
      if(res && res.ok) {
        if(!this.hasLoaded && typeof this.props.onInitialLoad === 'function') {
          this.props.onInitialLoad();
          this.hasLoaded = true;
        }
        this.forceSkip = undefined;
        const newResults = getDeep(res, request.resPath || 'results');
        let path = cache.path;
        if(!Array.isArray(path)) path = [path]; 
        cacheSaveBatch(path, newResults);
        if(newResults.length) {
          let orderKey = cache.orderBy;
          if(orderKey.startsWith('-')) orderKey = orderKey.slice(1);
          this.selector = createCacheSelector(cache, newResults[newResults.length - 1][orderKey])
        }
        this.setState({
          hasMore: typeof res.has_more !== 'undefined' ? res.has_more : newResults.length === limit,
          loading: false,
        });
      } else this.setState({ loading: false, error: true });
    })
  }
  render() {
    return (
      <PaginationResults pagination={this.state} hasLoaded={this.hasLoaded} selector={this.selector} {...this.props}/>
    );
  }
}