import React, { PureComponent } from 'react';
import { fromJS } from 'immutable';
import { connect } from 'react-redux';
import hoistNonReactStatics from 'hoist-non-react-statics';
import * as ca from '../actions';

export default options => WrappedComponent => {
  const getCachePath = (cache, props) => {
    if(cache) {
      let statePath = cache.path;
      
      if(typeof statePath === 'function')
        statePath = statePath(props);
      
      if(!Array.isArray(statePath)) 
        statePath = [statePath];
      
      return statePath;
    }
  }
  @connect((state, props) => {
    const res = {
      isOnline: state.connection.get('status') === 'online',
    };
    for(let propName in options) {
      const cachePath = getCachePath(options[propName].cache, props);
      if(cachePath) {
        res[propName] = state.cache.getIn(cachePath);
      }
    }
    return res;
  }, {
    cacheSave: ca.cache.save,
    apiRequest: ca.api.request,
  })
  class withRequests extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {
        error: false,
        ready: false,
      };
      this.needFetch = props.isOnline;
    } 
    componentDidMount() {
      this.runRequests();
    }
    componentWillReceiveProps(nextProps) {
      if(!this.props.isOnline && nextProps.isOnline !== this.props.isOnline) {
        this.needFetch = true;
      }
    }
    componentDidUpdate() {
      this.runRequests();
    }
    componentWillUnmount() {
      this._unmounted = true;
    }
    runRequests() {
      if(!this.needFetch || this.isFetching) return;
      this.isFetching = true;
      this.needFetch = false;
      const { apiRequest, cacheSave } = this.props;
      let initCounter = 0;
      let resCounter = 0;
      for(let propName in options) {
        initCounter++;
        const { request, cache } = options[propName];
        let { body, url, resPath } = request;
        if(typeof body === 'function') {
          body = body(this.props);
        }

        apiRequest(url, body).then((res) => {
          resCounter++;
          if(initCounter === resCounter) {
            this.isFetching = false;
            this.setState({ ready: true });
          }
          if(!res.ok) {
            !this._unmounted && this.setState({ error: true, ready: false });
          } else {
            const cachePath = getCachePath(cache, this.props);
            if(cachePath) {
              cacheSave(cachePath, fromJS(res[resPath]));
            }
          }
        })
      }

      this.setState({ error: false });
    }
    render() {
      const { renderError, renderLoader } = this.props;
      if(this.state.error) {
        return renderError ? renderError(this.props) : null;
      }

      if(!this.state.ready) {
        return renderLoader ? renderLoader(this.props) : null;
      }
      
      const {
        request,
        ...rest
      } = this.props;

      return (
        <WrappedComponent
          {...rest}
        />
      )
    }
  }
  hoistNonReactStatics(withRequests, WrappedComponent);
  return withRequests;
}