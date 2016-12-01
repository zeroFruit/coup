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
  db.addColumn('pause_table', 'alias', {type:"string", notNull: true}, cb);
};

exports.down = function(db, cb) {
  db.removeColumn('pause_table', 'alias', cb);
};

exports._meta = {
  "version": 1
};
