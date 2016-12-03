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
  db.createTable('stockList', {
    id: {type: 'int', primaryKey: true, autoIncrement: true},
    content: "string",
    income: {type: 'int', defaultValue: 0},
    spending: {type: 'int', defaultValue: 0},
    ts: {type: 'datetime'},
    price: {type: 'int', notNull: true}
  }, cb);
};

exports.down = function(db, cb) {
  db.dropTable('stockList', cb);
};

exports._meta = {
  "version": 1
};
