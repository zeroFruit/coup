/*
  payments

    * About
      this is model of payments

    * What this module can do?

*/
const config    = require('../helpers/config');

const db        = require('../helpers/db');
const utils     = require('../helpers/utils');

/*
  Define the attributes the payments with its type
*/
function id2name(id) {
  switch(id) {
    case "0":
      return "선불권";
    case "1":
      return "종일권";
    case "2":
      return "반일권";
    case "3":
      return "완전자유이용권-월";
    case "4":
      return "자유이용권-월";
    case "5":
      return "반자유이용권-월";
    case "6":
      return "미니자유이용권-월";
    case "7":
      return "완전자유이용권-보름";
    case "8":
      return "자유이용권-보름";
    case "9":
      return "반자유이용권-보름";
    case "10":
      return "미니자유이용권-보름";
    case "11":
      return "야간선불제";
    case "12":
      return "야간자유이용권";
    case "13":
      return "관리형반";
    default:
      return "-";
  }

}

module.exports = {
  /*
    getPaymentList
  */
  getPaymentList: function(req, res, next) {
    db.payments.getList(function(err, results) {
      if(err) {
        return next(err);
      }
      else {
        console.log(results);
        req.payments = results;
        next();
      }
    });
  },
  updatePaymentList: function(req, res, next) {
    db.payments.updateList(req.body, function(err, results) {
      if(err) {
        return next(err);
      }
      else {
        console.log(results);
        req.newMilages = results.newMilages;
        next();
      }
    });
  },
  paymentId2Name: function(req, idList, cb) {
    var namearr = [];
    for (var i = 0; i < idList.length; i++) {
      var pname = id2name(idList[i]);
      namearr.push(pname);
    }
    cb(namearr);
  }
}
