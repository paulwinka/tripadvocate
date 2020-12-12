const debug = require('debug')('app:admin');
const auth = require('../middleware/auth');

module.exports = async (req, res, next) => {
  try {
    if (!req.user) {
      debug(`req.user.role is ${req.user.role}.`);
      throw new Error('You must be logged in.');
    }
    next();
  } catch (err) {
    // user does not have appropriate permissions
    if (req.xhr) {
      res.status(403).json({ error: 'Now allowed to view this content.' });
    } else {
      // res.render('error/basic', { title: 'Error', message: 'Member only route.' });
      res.redirect('/account/login');
    }
  }
};
