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
  db.createTable('pause_table', {
    id: {type: 'int', primaryKey: true, autoIncrement: true},
    ts: {type: 'datetime'},
    mask: {type: 'int', notNull: true}
  }, setTsDefaultValue);

  function setTsDefaultValue(err) {
    if(err) { cb(err); return; }
    var sql = 'ALTER TABLE pause_table MODIFY ts DATETIME DEFAULT CURRENT_TIMESTAMP';
    db.runSql(sql, cb);
  }
};

exports.down = function(db, cb) {
  db.dropTable('pause_table', cb);
};

exports._meta = {
  "version": 1
};
