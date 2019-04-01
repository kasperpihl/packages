import moment from 'moment';

export default () => {
  const now = moment();
  let year = now.year();
  let week = now.week();

  now.add(1, 'week');
  if (now.week() < week) {
    year = year + 1;
  }

  return `${year}-${now.week()}`;
};
