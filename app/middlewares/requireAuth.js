/*
  requireAuth

    * About

      This middlewares is executed after 'jwtauth'.
      If successfully authenticated there's req.user exist. If not, null
      So verify here.
*/
const respond = require('../helpers/respond');

module.exports = function(req, res, next) {
  if(!req.user)
    respond.user_not_found(res, req);
  else
    next();
}
