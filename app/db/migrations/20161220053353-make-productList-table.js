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
  db.createTable('productList', {
    id: {type:'bigint', primaryKey: true, autoIncrement: true},
    group: {type:'string'},
    name: {type: 'string', notNull: true},
    price: {type: 'int', notNull: true},
    memo: {type: 'string'}
  }, cb);
};

exports.down = function(db, cb) {
  db.dropTable('productList', cb);
};

exports._meta = {
  "version": 1
};
