const config = require('config');
const jwt = require('jsonwebtoken');
const debug = require('debug')('app:auth');

module.exports = (req, res, next) => {
  try {
    let token = req.cookies.auth_token;
    if (!token) {
      if (req.get('Authorization')) {
        const authHeader = req.get('Authorization').split(' ');
        if (authHeader.length == 2 && authHeader[0] == 'Bearer') {
          token = authHeader[1];
        }
      }
    }
    if (!token) {
      throw Error('missing token');
    }
    const secret = config.get('auth.secret');
    const payload = jwt.verify(token, secret);
    req.user = payload;
    next();
  } catch (err) {
    // debug(err.stack);
    // res.redirect('/account/login');
    next();
  }
};
