/*
  alarm

    * About
      This module signal to admin the clients who almost spend their times

    * What this module can do?

*/
const config    = require('../helpers/config');
const db        = require('../helpers/db');


module.exports = {
  /*
    timeAlert - alert those of who lack of time
  */
  reduceDay: function() {
    db.alarm.reduceLeftDay(function(err, result) {
      if(err)
        return err;

      /* result: {err: "0"} */
      return "";
    });
  }
}
