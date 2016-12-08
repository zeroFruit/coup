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
  db.addColumn('members', 'break', {type: 'int', defaultValue: 0}, cb);
};

exports.down = function(db, cb) {
  db.removeColumn('members', 'break', cb);
};

exports._meta = {
  "version": 1
};
