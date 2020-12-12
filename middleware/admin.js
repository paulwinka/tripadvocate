const debug = require('debug')('app:admin');
const auth = require('../middleware/auth');

module.exports = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error('You must be logged in.');
    }
    // if (req.user.role != 'admin' || req.user.role != 'moderator') {
    if (req.user.role != 'admin') {
      throw new Error('You do not have permission to view this page.');
    }
    next();
  } catch (err) {
    // user does not have appropriate permissions
    if (req.xhr) {
      res.status(403).json({ error: 'Now allowed to view this content.' });
    } else {
      res.render('error/basic', { title: 'Error', message: 'Admin only route.' });
    }
  }
};
