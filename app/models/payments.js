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
  payment id => name
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
    case "14":
      return "무료이용권"
    default:
      return "-";
  }
}

/*
  name => payment Id
*/
function name2Id(name) {
  switch(name) {
    case "선불권":
      return "0";
    case "종일권":
      return "1";
    case "반일권":
      return "2";
    case "완전자유이용권-월":
      return "3";
    case "자유이용권":
      return "4";
    case "반자유이용권-월":
      return "5";
    case "미니자유이용권-월":
      return "6";
    case "완전자유이용권-보름":
      return "7";
    case "자유이용권-보름":
      return "8";
    case "반자유이용권-보름":
      return "9";
    case "미니자유이용권-보름":
      return "10";
    case "야간선불제":
      return "11";
    case "야간자유이용권":
      return "12";
    case "관리형반":
      return "13";
    case "무료이용권":
      return "14";
    default:
      return "-1";
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
        if (results.err != undefined) {
          req.err = results.err;
          return next();
        }

        req.newMilages = results.newMilages;
        req.err = "0";
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
  },

  id2NameSingle: function(id, cb) {
    var name = id2name(id);
    cb(name);
  },

  paymentName2Id: function(req, payment, cb) {

  }
}
