import moment from 'moment';

export default (ts) => {
  ts = moment(ts);
  const now = moment();
  if(ts.isSame(now, 'day')) {
    return ts.format('LT')
  }
  if(ts.diff(now, 'days') > -7) {
    return ts.format('ddd');
  }
  if(!ts.isSame(now, 'year')) {
    return ts.format('MMM D \'YY');
  }
  return ts.format('MMM D');
}