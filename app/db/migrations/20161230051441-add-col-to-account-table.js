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
  addMemberCol();
  function addMemberCol() {
    db.addColumn('account', 'membername', {type: 'string', notNull: true}, addAliasCol);
  }
  function addAliasCol() {
    db.addColumn('account', 'alias', {type: 'string', notNull: true}, addNotPaidCol);
  }
  function addNotPaidCol() {
    db.addColumn('account', 'notPaid', {type: 'int', defaultValue: 0}, addOptionCol);
  }
  function addOptionCol() {
    db.addColumn('account', 'option', {type: 'int', defaultValue: 0}, addAddCoupCol);
  }
  function addAddCoupCol() {
    db.addColumn('account', 'addCoup', {type: 'int', defaultValue: 0}, addUseCoupCol);
  }
  function addUseCoupCol() {
    db.addColumn('account', 'useCoup', {type: 'int', defaultValue: 0}, addFinalCashCol);
  }
  function addFinalCashCol() {
    db.addColumn('account', 'finalCash', {type: 'int', defaultValue: 0}, addPayDayCol);
  }
  function addPayDayCol() {
    db.addColumn('account', 'payDay', {type: 'datetime'}, addProductGroupCol);
  }
  function addProductGroupCol() {
    db.addColumn('account', 'productGroup', {type: 'string'}, cb);
  }
};

exports.down = function(db, cb) {
  rmMemberCol();
  function rmMemberCol() {
    db.removeColumn('account', 'membername', rmAliasCol);
  }
  function rmAliasCol() {
    db.removeColumn('account', 'alias', rmNotPaidCol);
  }
  function rmNotPaidCol() {
    db.removeColumn('account', 'notPaid', rmOptionCol);
  }
  function rmOptionCol() {
    db.removeColumn('account', 'option', rmAddCoupCol);
  }
  function rmAddCoupCol() {
    db.removeColumn('account', 'addCoup', rmUseCoupCol);
  }
  function rmUseCoupCol() {
    db.removeColumn('account', 'useCoup', rmFinalCashCol);
  }
  function rmFinalCashCol() {
    db.removeColumn('account', 'finalCash', rmPayDayCol);
  }
  function rmPayDayCol() {
    db.removeColumn('account', 'payDay', rmProductGroupCol);
  }
  function rmProductGroupCol() {
    db.removeColumn('account', 'productGroup', cb);
  }
};

exports._meta = {
  "version": 1
};
