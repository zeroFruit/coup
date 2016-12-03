'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db, cb) {
  db.insert('payments', ['type', 'timePerDay', 'price', 'name', 'paymentId', 'leftDay'], ['free', 0, 0, '무료이용권', '14', 0], cb);
};

exports.down = function(db, cb) {
  var sql = 'DELETE payments WHERE id="14"';
  db.runSql(sql, cb);
};

exports._meta = {
  "version": 1
};
