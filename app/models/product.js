/*
  product

    * About
      model of product, group

    * What this module can do?
*/
const config         = require('../helpers/config');

const db2            = require('../helpers/dbforAccount');
const moment         = require('moment');
const moment_tz      = require('moment-timezone');

module.exports = {
  /*
    addProductGroup
  */
  addProductGroup: function(req, res, next) {
    db2.productGroup.addProductGroup(req.body, function(err, results) {
      if(err) {
        return next(err);
      }
      else {
        req.results = results;
        next();
      }
    });
  },

  /*
    modifyProductGroup
  */
  modifyProductGroup: function(req, res, next) {
    db2.productGroup.modifyProductGroup(req.body, function(err, results) {
      if (err) {
        return next(err);
      }
      else {
        req.results = results;
        next();
      }
    });
  },

  /*
    deleteProductGroup
  */
  deleteProductGroup: function(req, res, next) {
    db2.productGroup.deleteProductGroup(req.body, function(err, results) {
      if (err) {
        return next(err);
      }
      else {
        req.results = results;
        next();
      }
    });
  },
  /*
    getProductGroupList
  */
  getProductGroupList: function(req, res, next) {
    db2.productGroup.getProductGroupList(function(err, results) {
      if (err) {
        console.log(err);
        return next(err);
      }
      else {
        req.results = {};
        req.results.results = results.groupList;
        req.results.err = results.err;
        next();
      }
    });
  },

  /*
    addProduct
  */
  addProduct: function(req, res, next) {
    db2.product.addProduct(req.body, function(err, results) {
      if (err) {
        console.log(err);
        return next(err);
      }
      else {
        req.results = results;
        next();
      }
    });
  },

  getAllList: function(req, res, next) {
    db2.productGroup.getProductGroupList(function(err, results) {
      if (err) {
        console.log(err);
        return next(err);
      }
      else {
        req.results = {};
        req.results.err = results.err;
        req.results.productGroupList = results.groupList;

        /* after get product group list, get product list*/
        db2.product.getProductList(function(err, results) {
          console.log('productList');
          console.log(results);
          if (err) {
            console.log(err);
            return next(err);
          }
          else {
            req.results.productList = results.productList;
            next();
          }
        })
      }
    });
  },

  getProductList: function(req, res, next) {
    db2.product.getProductList(function(err, results) {
      console.log('productList');
      console.log(results);
      if (err) {
        console.log(err);
        return next(err);
      }
      else {

        req.results = results;
        next();
      }
    });
  },

  modifyProduct: function(req, res, next) {
    db2.product.modifyProduct(req.body, function(err, results) {
      if (err) {
        console.log(err);
        return next(err);
      }
      else {
        req.results = results;
        next();
      }
    });
  },

  deleteProduct: function(req, res, next) {
    db2.product.deleteProduct(req.body, function(err, results) {
      if (err) {
        console.log(err);
        return next(err);
      }
      else {
        req.results = results;
        next();
      }
    })
  }
}
