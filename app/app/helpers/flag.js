const shouldAccumlateBreak = (ts, pause, enterance) => {
  if (ts !== null && pause === '0' && enterance === '0') {
    return true;
  } else {
    return false;
  }
}

const nightPolicy = (night, paymentid, accumlateBreak) => night === 1 && paymentid !== '14' && accumlateBreak === false;

const prepayUserCase = (paymentid) => {
  console.log(paymentid);
  return paymentid === "0";
}
const freeUserCase = (paymentid) => paymentid === '14';
const UserWhichHasTimeLimitExceptPrepayCase = (paymentid) => paymentid === "2" || paymentid === "4" || paymentid === "5" || paymentid === "6" || paymentid === "8" || paymentid === "9" || paymentid === "10" || paymentid === "11"
const UserWhichHasTimeLimitCase = (paymentid) => paymentid === '0' || paymentid === '2' || paymentid === '4' || paymentid === '5' || paymentid === '6' || paymentid === '8' || paymentid === '9' || paymentid === '10' || paymentid === '11';
const UserWhichHasNoTimeLimitCase = (paymentid) => paymentid === '1' || paymentid === '3' || paymentid === '7' || paymentid === '12' || paymentid === '13';

module.exports = {
  shouldAccumlateBreak,
  nightPolicy,
  prepayUserCase,
  freeUserCase,
  UserWhichHasTimeLimitExceptPrepayCase,
  UserWhichHasTimeLimitCase,
  UserWhichHasNoTimeLimitCase
}
