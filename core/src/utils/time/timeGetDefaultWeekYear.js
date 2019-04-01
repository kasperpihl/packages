import moment from 'moment';

export default () => {
  const now = moment();
  let year = now.year();
  // Ensure working when week 1 starts in december.
  if (now.month() === 12 && now.week() < 4) {
    year = year + 1;
  }

  return `${year}-${now.week()}`;
};
