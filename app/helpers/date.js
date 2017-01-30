import moment       from 'moment';
import moment_tz    from 'moment-timezone';

const isNight = () => {
  let curHour;

  curHour = moment().tz('Asia/Tokyo').hours();
  if (curHour >=0 && curHour <= 5) {
    return 1;
  } else {
    return 0;
  }
}
const isNightWithParam = (ts) => {
  let curHour = moment(ts).hours();

  if (curHour >=0 && curHour <= 5) {
    return 1;
  } else {
    return 0;
  }
}

const getEndDateTimeString = () => moment().tz('Asia/Tokyo').format('YYYY-MM-DD').toString() + " 05:00:00";
const getCurrentDateTimeString = () => moment().tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss').toString();
const getCurrentDateTimeStringWithZero = () => moment().tz('Asia/Tokyo').format('YYYY-MM-DD').toString() + " 00:00:00";
const getNextDayDateTimeString = () => moment().tz('Asia/Tokyo').add(1, 'days').format('YYYY-MM-DD').toString() + " 00:00:00";
const getMinuteWithStringDateTime = (datetimeString1, datetimeString2) => {
  let Date1 = new Date(Date.parse(datetimeString1.replace('-','/','g')));
  let Date2 = new Date(Date.parse(datetimeString2.replace('-','/','g')));

  return Math.floor((Date1 - Date2)/60000);
}
const getAfterMinutesDateTimeString = (minutes) => moment().tz('Asia/Tokyo').add(minutes, 'minutes').format('YYYY-MM-DD  HH:mm:ss').toString();

module.exports = {
  isNight,
  isNightWithParam,
  getEndDateTimeString,
  getCurrentDateTimeString,
  getCurrentDateTimeStringWithZero,
  getNextDayDateTimeString,
  getMinuteWithStringDateTime,
  getAfterMinutesDateTimeString
}
