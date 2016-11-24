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
function AttrPayments(id, price) {
  var attr = {};
  if (id === '0') {
    var hours = ( price / 800 );
    attr.type         = "prepay";
    attr.timePerDay   = hour;
    attr.id           = id;
  }
  else if (id === '1' || id === '2') {
    attr.type   = 'daily';
    attr.price  = price;
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
  }
}
