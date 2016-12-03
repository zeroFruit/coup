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
  var sql = 'ALTER TABLE studyroom ADD tsStart DATETIME NOT NULL; ALTER TABLE studyroom ADD tsEnd DATETIME NOT NULL';
  db.runSql(sql, cb);
};

exports.down = function(db, cb) {
  var sql = 'ALTER TABLE studyroom DROP tsStart; ALTER TABLE studyroom DROP tsEnd';
  db.runSql(sql, cb);
};

exports._meta = {
  "version": 1
};
