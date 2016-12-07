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
  var sql = 'ALTER TABLE history DROP COLUMN dt';
  db.runSql(sql, cb);
};

exports.down = function(db, cb) {
  var sql = 'ALTER TABLE history ADD dt DATETIME NOT NULL';
  db.runSql(sql, cb);
};

exports._meta = {
  "version": 1
};
