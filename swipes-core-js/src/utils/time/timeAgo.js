import moment from 'moment';

export default function(date, simple) {
  let agoString = moment(date).fromNow();

  if (simple) {
    agoString = agoString.replace('a few seconds ago', 'Just now');
    agoString = agoString.replace('a minute', '1min')
      .replace(' minutes', 'min')
      .replace('an hour', '1h')
      .replace(' hours', 'h')
      .replace('a day', '1d')
      .replace(' days', 'd')
      .replace('a month', '1month')
      .replace(' months', 'months')
      .replace('a year', '1y')
      .replace(' years', 'y');
  }
  return agoString;
}