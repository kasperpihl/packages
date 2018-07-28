import React, { PureComponent } from 'react';
import { bindAll } from '../classes/utils';
import timeAgo from '../utils/time/timeAgo';

const MAX = 5000;
const MIN = 3000;
// K_TODO: make a better timeout based on when the next change has happened

class TimeAgo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      ts: timeAgo(props.date, !!props.simple),
    };
    bindAll(this, ['updateTimestamp']);
  }
  componentDidMount() {
    this.interval = setInterval(this.updateTimestamp, Math.random() * (MAX - MIN) + MIN);
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  componentWillReceiveProps(nextProps) {
    if(nextProps.date !== this.props.date){
      this.updateTimestamp(nextProps.date, nextProps.simple);
    }
  }
  updateTimestamp(date, simple) {
    if(typeof simple === 'undefined') {
      simple = this.props.simple;
    }
    date = date || this.props.date;
    const ts = timeAgo(date, !!simple);
    if(ts !== this.state.ts) {
      this.setState({ ts });
    }
  }
  render() {
    const {
      date,
      simple,
      Node = 'span',
      prefix,
      postfix,
      ...rest,
    } = this.props;
    const { ts } = this.state;

    return (
      <Node {...rest}>{prefix || ''}{ts}{postfix || ''}</Node>
    );
  }
}

export default TimeAgo
