import moment from 'moment';

export default function(date) {
  let result;
  const now = moment();
  const parsedDate = moment(date);
  const dayDiff = Math.abs(parsedDate.diff(now, 'days'));

  if (dayDiff >= 6 || dayDiff <= -6) {
    if (parsedDate.year() !== now.year()) {
      result = parsedDate.format("MMM Do 'YY");
    } else {
      result = parsedDate.format('MMM Do');
    }
  } else {
    result = getDayWithoutTime(parsedDate);
  }

  return result;
}

function getDayWithoutTime(day) {
  let fullStr = day.calendar();
  const timeIndex = fullStr.indexOf(' at ');

  if (timeIndex !== -1) {
    fullStr = fullStr.slice(0, timeIndex);
  }

  return fullStr;
}