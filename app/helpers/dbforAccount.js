const moment         = require('moment');
const moment_tz      = require('moment-timezone');
const pbkdf2Password = require('pbkdf2-password');
const hasher         = pbkdf2Password();
const mysql          = require('mysql');
const conn           = mysql.createConnection({
  host      : 'localhost',
  user      : 'root',
  password  : '111111',
  database  : 'crm'
});
conn.connect();

function mapGroupWithId(idList, callback) {
  var len = idList.length;
  if (len == 0) {
    return callback(null);
  }
  else {
    /* make queryString*/
    var qs = "("+ idList[0] +", ";
    for (var i = 1; i < len-1; i++) {
      qs += idList[i-1] + ", ";
    }
    qs += idList[len-1] + ")";
  }

  var sql = 'SELECT name FROM productGroup IN '+qs;
  conn.query(sql, function(err, results) {
    if (err) {
      console.log(err);
      return callback(err);
    }
    else {
      console.log(results);
      callback(null, results);
    }
  });
}

module.exports = {
  productGroup: {
    addProductGroup: function(data, cb) {
      var groupName = data.group;

      var sql = 'INSERT INTO productGroup (name) VALUES (?)';
      conn.query(sql, groupName, function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error(err));
        }
        else {
          cb(null, {err: "0"});
        }
      });
    },

    getProductGroupList: function(cb) {
      var sql = 'SELECT * FROM productGroup';
      conn.query(sql, function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error(err));
        }
        else {
          cb(null, {err: "0", groupList: results});
        }
      });
    },

    modifyProductGroup: function(data, cb) {
      var oldname, newname, id;
      oldname = data.oldname;
      newname = data.newname;
      id = data.id;

      /* 1. update productlist with new group name */
      var sql = 'UPDATE productList SET product_group=? WHERE product_group=?';
      conn.query(sql, [newname, oldname], function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error(err));
        }
        else {
          /* 2. then update productGroup table with new group name */
          var sql = 'UPDATE productGroup SET name=? WHERE name=?';
          conn.query(sql, [newname, oldname], function(err, results) {
            if (err) {
              console.log(err);
              cb(new Error(err));
            }
            else {
              cb(null, {err:"0"});
            }
          });
        }
      });
    },

    deleteProductGroup: function(data, cb) {
      var name = data.name;
      console.log('group name');
      console.log(name);
      /* before delete product group, change that product to default group */
      var sql = 'UPDATE productList SET product_group="없음" WHERE product_group="'+name+'"';

      conn.query(sql, function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error(err));
        }
        else {
          console.log('group update result');
          console.log(results);
          var sql = 'DELETE FROM productGroup WHERE name=?';
          conn.query(sql, [name], function(err, results) {
            if (err) {
              console.log(err);
              cb(new Error(err));
            }
            else {
              cb(null, {err: "0"});
            }
          });
        }
      });
    }
  },

  product: {
    addProduct: function(data, cb) {
      var group, name, price, memo;
      group = data.group;
      name = data.name;
      price = parseInt(data.price);
      memo = data.memo;

      var sql = 'INSERT INTO productList (product_group, product_name, product_price, product_memo) VALUES ("'+group+'", "'+name+'", '+price+', "'+memo+'")';
      conn.query(sql, function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error(err));
        }
        else {
          cb(null, {err: "0"});
        }
      });
    },

    getProductList: function(cb) {
      var sql = 'SELECT * FROM productList';
      conn.query(sql, function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error(err));
        }
        else {
          cb(null, {err: "0", productList: results});
        }
      });
    },

    modifyProduct: function(data, cb) {
      var mid, name, price, memo, group
      mid   = data.mid;
      name  = data.name;
      price = data.price;
      memo  = data.memo;
      group = data.group;

      var sql = 'UPDATE productList SET product_name=?, product_price=?, product_memo=?, product_group=? WHERE id=?';
      conn.query(sql, [name, price, memo, group, parseInt(mid)], function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error(err));
        }
        else {
          cb(null, {err: "0"});
        }
      });
    },

    deleteProduct: function(data, cb) {
      var did = data.did;

      var sql = 'DELETE FROM productList WHERE id=?';
      conn.query(sql, [did], function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error(err));
        }
        else {
          cb(null, {err: "0"});
        }
      })
    }
  },

  account: {
    addList: function(data, cb) {
      var basket, usecoup, addcoup, option, paidDate, memo, membername, alias;
      basket      = data.basket;
      usecoup     = data.usecoup;
      addcoup     = data.addcoup;
      option      = data.option;
      paidDate    = data.paidDate;
      memo        = data.memo;
      membername  = data.membername;
      alias       = data.alias;
      /* make query sql */
      console.log(paidDate);
      var ist = '';
      Object.keys(basket).forEach(function(key,index) {
        var prod = basket[key];
        ist += "(";
        ist += '"'+membername + '", ';
        ist += '"'+alias + '", ';
        ist += '"'+prod.name + '", ';
        ist += prod.num + ", ";
        ist += prod.price + ", ";
        ist += prod.notpaid + ", ";
        ist += prod.discount + ", ";
        ist += '"'+option + '", ';
        ist += 'STR_TO_DATE("'+paidDate+'", "%Y-%m-%d"), ';
        ist += "'" + memo + "'";
        ist += "),";
      });
      ist = ist.substring(0, ist.length-1); /* delete last , */


      var sql = 'INSERT INTO account (membername, alias, content, product_num, price, notPaid, service, sales_option, payDay, memo) VALUES '+ ist;
      conn.query(sql, function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error(err));
        }
        else {
          if (usecoup != 0 || addcoup != 0) {
            var ist = '("'+membername+'", ';
            ist += '"'+alias+'", ';
            ist += '"코업머니 사용 및 적립", ';
            ist += '"코업머니", ';
            ist += 'STR_TO_DATE("'+paidDate+'", "%Y-%m-%d"), ';
            ist += addcoup +', ';
            ist += usecoup +', ';
            ist += '"'+memo+'") ';

            var sql = 'INSERT INTO account (membername, alias, content, sales_option, payDay, addCoup, useCoup, memo) VALUES '+ist;
            conn.query(sql, function(err, results) {
              if (err) {
                console.log(err);
                cb(new Error(err));
              }
              else {
                cb(null, {err: "0"});
              }
            })
          }
          else {
            cb(null, {err: "0"});
          }
        }
      });
    },

    getPersonalList: function(data, cb) {
      var name      = data.membername;
      var alias     = data.alias;
      var startDate = data.startDate; startDate += " 00:00:00";
      var endDate   = data.endDate;   endDate += " 23:59:59";

      var sql = 'SELECT * FROM account WHERE (ts BETWEEN STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s") AND STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s")) AND alias=?';
      conn.query(sql, [startDate, endDate, alias], function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error(err));
        }
        else {
          cb(null, {results: results, err: "0"});
        }
      });
    },

    updateUsageList: function(data, cb) {
      var num, discount, notpaid, price, option ,addcoup, usecoup, id;
      num       = data.num;
      discount  = data.discount;
      notpaid   = data.notpaid;
      price     = data.price;
      option    = data.option;
      addcoup   = data.addcoup;
      usecoup   = data.usecoup;
      id        = data.id;

      var sql = 'UPDATE account SET product_num=?, service=?, notPaid=?, price=?, sales_option=?, addCoup=?, useCoup=? WHERE id=?';
      conn.query(sql, [num, discount, notpaid, price, option, addcoup, usecoup, id], function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error(err));
        }
        else {
          cb(null, {err: "0"});
        }
      });
    },

    deleteUsageList: function(data, cb) {
      var id = data.id;
      var sql = 'DELETE FROM account WHERE id=?';
      conn.query(sql, [id], function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error(err));
        }
        else {
          cb(null, {err: "0"});
        }
      });
    }
  },

  system: {
    useMilageRecord: function(data, cb) {
      var alias   = data.membername;
      var milage  = data.milage;
      var content = data.content;
      var memo    = data.memo;
      var membername = "use-milage:"+alias;

      var sql = 'INSERT INTO account (content, membername, alias, sales_option, useCoup, memo) VALUES (?, ?, ?, ?, ?, ?)';
      conn.query(sql, [content, membername, alias, "코업머니", milage, memo], function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error(err));
        }
        else {
          cb(null, {err: "0"});
        }
      });
    },
    chargeMilageRecord: function(data, cb) {
      var alias, milage, content, discount, price, option, memo;
      alias     = data.membername;
      milage    = data.milage;
      content   = data.content;
      discount  = data.discount;
      price     = data.price;
      option    = data.option;
      memo      = data.memo;
      var membername = "charge-milage:"+alias;

      var sql = 'INSERT INTO account (content, price, service, membername, alias, sales_option, addCoup, memo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
      conn.query(sql, [content, price, discount, membername, alias, option, milage, memo], function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error(err));
        }
        else {
          cb(null, {err: "0"});
        }
      });
    }
  }

}
