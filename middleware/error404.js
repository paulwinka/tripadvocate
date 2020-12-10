const debug = require('debug')('app:error404');

module.exports = (req, res) => {
  debug(`${req.method} ${req.originalUrl} not found.`);
  if (req.xhr || !req.accepts('html')) {
    res.status(404).json({ error: 'Page Not Found' });
  } else {
    res.status(404).render('error/basic', {
      title: 'Page Not Found',
      message: 'We could not find the page you requested.',
    });
  }
};
