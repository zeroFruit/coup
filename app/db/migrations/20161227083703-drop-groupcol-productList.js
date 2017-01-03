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
  var sql = 'ALTER TABLE productList DROP `group`';
  db.runSql(sql, createCol);

  function createCol() {
    var sql = 'ALTER TABLE productList ADD product_group VARCHAR(255)';
    db.runSql(sql, cb);
  }
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
