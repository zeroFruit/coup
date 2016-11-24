/*
  renderingPage

    * About
      This module is needed when rendering page
      It gives parameters to pages such as number of members or other information

*/
var db    = require('../helpers/db');

module.exports = {
  getNumOfMem : function(req, res, next) {
    db.member.getNum(function(err, results) {
      if(err) {
        return next(err);
      }
      req.source = req.source || {};
      req.source.numOfMem = results['COUNT(*)'];
      next();
    });
  },
  getNumOfAttendMem : function(req, res, next) {
    db.member.getActiveNum(function(err, results) {
      if(err) {
        return next(err);
      }
      req.source = req.source || {};
      req.source.numOfActiveMem = results['COUNT(*)'];
      console.log(results['COUNT(*)']);
      next();
    });
  }
}
