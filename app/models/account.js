/*
  account

    * About
      model of account

    * What this module can do?
*/
const config    = require('../helpers/config');

const db        = require('../helpers/db');
const moment         = require('moment');
const moment_tz      = require('moment-timezone');

module.exports = {
  /*
    addList
  */
  addList: function(req, res, next) {
    db.account.addList(req.body, function(err, results) {
      if (err) {
        return next(err);
      }
      else {
        console.log('this is addList-- account');
        currentTsStr = moment().tz('Asia/Tokyo').format('YYYY-MM-DD').toString();
        req.err = results;
        req.body.ts = currentTsStr;
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
