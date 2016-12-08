'use strict';

var dbm;
var type;
var seed;
var async = require('async');
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
  async.series([
    function(callback) {
      db.addColumn('members', 'pts', {type: 'datetime'}, callback);
    },
    function(callback) {
      db.addColumn('members', 'rts', {type: 'datetime'}, cb);
    }
  ])
};

exports.down = function(db, cb) {
  async.series([
    function(callback) {
      add.removeColumn('members', 'pts', callback);
    },
    function(callback) {
      add.removeColumn('members', 'rts', cb);
    }
  ])
};

exports._meta = {
  "version": 1
};
