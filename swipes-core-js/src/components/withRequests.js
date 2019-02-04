import React, { PureComponent } from 'react';
import { fromJS } from 'immutable';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import hoistNonReactStatics from 'hoist-non-react-statics';
import apiRequest from '../utils/request';
import * as cacheActions from '../redux/cache/cacheActions';

export default (mapping = {}, options = {}) => WrappedComponent => {
  const getCachePath = (cache, props) => {
    if (cache) {
      let statePath = cache.path;

      if (typeof statePath === 'function') statePath = statePath(props);

      if (!Array.isArray(statePath)) statePath = [statePath];

      return statePath;
    }
  };
  const getCacheFromPath = path => state => state.cache.getIn(path);
  const generateSelector = path =>
    createSelector(
      [getCacheFromPath(path)],
      cache => cache
    );

  @connect(
    (state, props) => {
      const res = {
        isOnline: state.connection.get('status') === 'online',
        ready: true
      };

      for (let propName in mapping) {
        const cachePath = getCachePath(mapping[propName].cache, props);
        if (cachePath) {
          const selector = generateSelector(cachePath);
          res[propName] = selector(state, props);
          if (typeof res[propName] === 'undefined') {
            res.ready = false;
          }
        }
      }
      return res;
    },
    {
      cacheSave: cacheActions.save
    }
  )
  class withRequests extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {
        error: false,
        ready: props.ready
      };
      this.needFetch = props.isOnline;
    }
    componentDidMount() {
      this.runRequests();
    }
    componentWillReceiveProps(nextProps) {
      if (!this.props.isOnline && nextProps.isOnline !== this.props.isOnline) {
        this.needFetch = true;
      }
    }
    componentDidUpdate() {
      this.runRequests();
    }
    componentWillUnmount() {
      this._unmounted = true;
    }
    onRetry = () => {
      this.needFetch = true;
      this.runRequests();
    };
    runRequests() {
      if (!this.needFetch || this.isFetching) return;
      this.isFetching = true;
      this.needFetch = false;
      const { cacheSave } = this.props;
      let initCounter = 0;
      let resCounter = 0;
      for (let propName in mapping) {
        initCounter++;
        const { request, cache } = mapping[propName];
        let { body, url, resPath } = request;
        if (typeof body === 'function') {
          body = body(this.props);
        }

        apiRequest(url, body).then(res => {
          resCounter++;
          if (!res.ok) {
            !this._unmounted && this.setState({ error: true });
          } else {
            const cachePath = getCachePath(cache, this.props);
            if (cachePath) {
              cacheSave(cachePath, fromJS(res[resPath]));
            }
          }
          if (initCounter === resCounter) {
            this.isFetching = false;
            !this._unmounted && this.setState({ ready: true });
          }
        });
      }

      this.setState({ error: false });
    }
    render() {
      const { request, ...rest } = this.props;
      if (options.renderLoader && !this.state.ready) {
        return options.renderLoader();
      }

      return (
        <WrappedComponent
          {...rest}
          requestError={this.state.ready && this.state.error}
          requestRetry={this.onRetry}
          requestReady={this.state.ready}
        />
      );
    }
  }
  hoistNonReactStatics(withRequests, WrappedComponent);
  return withRequests;
};
