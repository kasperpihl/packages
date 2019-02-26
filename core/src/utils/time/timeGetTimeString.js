import moment from 'moment';

export default ts => {
  ts = moment(ts);
  const now = moment();
  const time = ts.format('LT');
  if (ts.isSame(now, 'day')) {
    return time;
  }
  if (ts.diff(now, 'days') === -1) {
    return `Yesterday ${time}`;
  }
  if (ts.diff(now, 'days') > -7) {
    return `${ts.format('ddd')} ${time}`;
  }
  if (!ts.isSame(now, 'year')) {
    return `${ts.format("MMM D 'YY")} ${time}`;
  }
  return `${ts.format('MMM D')} ${time}`;
};
