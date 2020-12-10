const debug = require('debug')('app:admin');
const auth = require('../middleware/auth');

module.exports = async (req, res, next) => {
  try {
    if (!req.user) {
      debug(`req.user.role is ${req.user.role}.`);
      throw new Error('You must be logged in.');
    }
    // if (req.user.role != 'admin' || req.user.role != 'moderator') {
    if (req.user.role != 'moderator' && req.user.role != 'admin') {
      debug(`req.user.role is ${req.user.role}.`);
      throw new Error('You do not have permission to view this page.');
    }

    debug(`req.user.role is ${req.user.role}.`);
    next();
  } catch (err) {
    // user does not have appropriate permissions
    if (req.xhr) {
      res.status(403).json({ error: 'Now allowed to view this content.' });
      debug(`req.xhr is true`);
    } else {
      debug(`Admin only route.`);
      res.render('error/basic', { title: 'Error', message: 'Admin only route.' });
    }
  }
};
