import moment from 'moment';

export default function planGetTitle(plan) {
  let title = plan.title;
  if (!title) {
    const startWeek = moment(plan.start_date).week();
    const endWeek = moment(plan.end_date).week();
    const endYear = moment(plan.end_date).year();

    title = 'Week ';
    title += startWeek;
    if (endWeek !== startWeek) {
      title += '-';
      title += endWeek;
    }
    if (endYear < moment().year()) {
      title += ` (${endYear})`;
    }
  }
  return title;
}
