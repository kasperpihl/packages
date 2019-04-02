import moment from 'moment';

export default function parseWeekLabel(value) {
  const [year, week] = value.split('-');
  const date = moment();
  const dWeek = moment();
  date.year(year);
  date.week(week);

  let weekLabel = `${year} Week ${week}`;
  if (date.isSame(dWeek, 'week')) {
    weekLabel = 'This week';
  }
  dWeek.subtract(1, 'weeks');
  if (date.isSame(dWeek, 'week')) {
    weekLabel = 'Last week';
  }
  dWeek.add(2, 'weeks');
  if (date.isSame(dWeek, 'week')) {
    weekLabel = 'Next week';
  }
  return weekLabel;
}
