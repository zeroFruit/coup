/*
  account

    * About
      model of account

    * What this module can do?
*/
const config    = require('../helpers/config');

const db        = require('../helpers/db');
const db2       = require('../helpers/dbforAccount');
const moment         = require('moment');
const moment_tz      = require('moment-timezone');

module.exports = {
  /*
    getAllList
  */
  getAllList: function(req, res, next) {
    db2.account.getAllList(req.body, function(err, results) {
      if (err) {
        return next();
      }
      else {
        req.results = results;
        next();
      }
    });
  },
  /*
    recordPayback
  */
  recordPayback: function(req, res, next) {
    db2.system.recordPayback(req.body, function(err, results) {
      if (err) {
        return next();
      }
      else {
        req.results = results;
        next();
      }
    });
  },
  /*
    recordUseMilage
  */
  recordUseMilage: function(req, res, next) {
    db2.system.useMilageRecord(req.body, function(err, results) {
      if (err) {
        console.log(err);
        return next(err);
      }
      else {
        req.results = results;
        next();
      }
    });
  },
  /*
    recordChargeMilage
  */
  recordChargeMilage: function(req, res, next) {
    db2.system.chargeMilageRecord(req.body, function(err, results) {
      if (err) {
        console.log(err);
        return next(err);
      }
      else {
        req.results = results;
        next();
      }
    });
  },
  /*
    recordPayment
  */
  recordPayment: function(req, res, next) {
    db2.system.recordPayment(req.body, function(err, results) {
      if (err) {
        return next(err);
      }
      else {
        next();
      }
    });
  },
  /*
    deleteUsageList
  */
  deleteUsageList: function(req, res, next) {
    db2.account.deleteUsageList(req.body, function(err, results) {
      if (err) {
        return next(err);
      }
      else {
        req.results = results;
        next();
      }
    });
  },
  /*
    editUsageList
  */
  editUsageList: function(req, res, next) {
    db2.account.updateUsageList(req.body, function(err, results) {
      if (err) {
        return next(err);
      }
      else {
        req.results = results;
        next();
      }
    });
  },
  /*
    getPersonalList
  */
  getPersonalList: function(req, res, next) {
    db2.account.getPersonalList(req.body, function(err, results) {
      if (err) {
        return next(err);
      }
      else {
        req.results = results;
        next();
      }
    });
  },
  /*
    addAccountList
  */
  addAccountList: function(req, res, next) {
    db2.account.addList(req.body, function(err, results) {
      if (err) {
        return next(err);
      }
      else {
        req.results = results;
        next();
      }
    });
  },

  /*
    viewList
  */
  viewList: function(req, res, next) {
    /*
      before query to db, validate the date format
    */
    var minValid = moment(req.body.mindate).isValid();
    var maxValid = moment(req.body.maxdate).isValid();
    if (minValid === false || maxValid === false) {
      req.err = "1";
      return next();
    }
    db.account.viewList(req.body, function(err, results) {
      if (err) {
        return next(err);
      }
      else {
        req.err = "0";
        req.viewList = results;
        next();
      }
    });
  },

  /*
    modifyList
  */
  modifyList: function(req, res, next) {
    db.account.updateList(req.body, function(err, results) {
      if (err) {
        return next(err);
      }
      else {
        req.err = results.err;
        next();
      }
    });
  },

  /*
    deleteList
  */
  deleteList: function(req, res, next) {
    db.account.deleteList(req.body, function(err, results) {
      if (err) {
        return next(err);
      }
      else {
        req.err = results.err;
        next();
      }
    })
  }
}
