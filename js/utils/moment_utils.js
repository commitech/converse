import moment from 'moment';

function formatTimeOfTheDay(duration) {
  return moment.utc(duration.asMilliseconds()).format('HH:mm:ss');
}

export { formatTimeOfTheDay };
