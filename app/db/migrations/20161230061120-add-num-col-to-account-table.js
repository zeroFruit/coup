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
  addNumCol();
  function addNumCol() {
    db.addColumn('account', 'product_num', {type: 'int', defaultValue: 1}, removeProductGroup);
  }
  function removeProductGroup() {
    db.removeColumn('account', 'productGroup', removeFinalCash);
  }
  function removeFinalCash() {
    db.removeColumn('account', 'finalCash', cb);
  }
};

exports.down = function(db, cb) {
  removeNumCol();
  function removeNumCol() {
    db.removeColumn('account', 'product_num', addProductGroup);
  }
  function addProductGroup() {
    db.removeColumn('account', 'productGroup', {type: 'string'}, addFinalCash);
  }
  function addFinalCash() {
    db.removeColumn('account', 'finalCash', {type: 'int', defaultValue: 0}, cb);
  }
};

exports._meta = {
  "version": 1
};
