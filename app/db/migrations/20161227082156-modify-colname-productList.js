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
  var sql = 'ALTER TABLE productList CHANGE group product_group VARCHAR(255)';
  db.runSql(sql, changeColName1);

  function changeColName1() {
    var sql = 'ALTER TABLE productList CHANGE name product_name VARCHAR(255) NOT NULL';
    db.runSql(sql, changeColName2);
  }
  function changeColName2() {
    var sql = 'ALTER TABLE productList CHANGE price product_price INT(11) NOT NULL';
    db.runSql(sql, changeColName3);
  }
  function changeColName3() {
    var sql = 'ALTER TABLE productList CHANGE memo product_memo VARCHAR(255)';
    db.runSql(sql, cb);
  }
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
