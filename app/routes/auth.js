var express       = require('express');
var Router        = express.Router();
var authenticate  = require('../models/auth');

module.exports = function(){
  /* GET home page. */
  Router.get('/', function(req, res) {
    res.render('index');
  });

  Router.post('/', function(req, res) {
    console.log(req.body);
    res.send('success');
  });

  return Router;
}
