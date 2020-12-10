//initialize environment variables.
require('dotenv').config();

//libraries ("require" )
const debug = require('debug')('app:server');
const express = require('express');
const config = require('config');
const jwt = require('jsonwebtoken');
const hbs = require('express-handlebars');
const multer = require('multer');
const path = require('path');
const ejs = require('ejs');
const moment = require('moment');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const mysql = require('mysql');
const db = require('./db');

//inject joi object id
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

// express, handlebars, and body parser (urlenconded) configuration
const app = express();

// set storage engine for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '.public/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now()) + path.extname(file.originalname);
  },
});

// Init upload

// const upload = multer({ storage: storage, }).single('myImage');
// const upload = multer({ storage: storage, }).single('photo');

const upload = multer({ dest: 'public/uploads/' });
module.exports = upload;

app.engine('handlebars', hbs());
app.engine(
  'handlebars',
  hbs({
    helpers: {
      formatPrice: (price) => (price ? '$' + price.toFixed(2) : ''),
      formatDate: (date) => (date ? moment(date).format('ll') : ''),
      formatDatetime: (date) => (date ? moment(date).format('lll') : ''),
      formatDateISO: (date) => (date ? moment(date).format('YYYY-MM-DDTHH:mm:ss') : ''),
      fromNow: (date) => (date ? moment(date).fromNow() : ''),
      not: (value) => !value,
      eq: (a, b) => a == b,
      or: (a, b) => a || b,
      and: (a, b) => a && b,
      tern: (condition, a, b) => (condition ? a : b),
    },
  })
);
app.set('view engine', 'handlebars');
app.use(morgan('tiny'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//routes location
// placeholder for home page
app.get('/', (req, res) => res.redirect('account/login'));
app.use('/place', require('./routes/place'));
app.use('/user', require('./routes/user'));
app.use('/review', require('./routes/review'));
app.use('/account', require('./routes/account'));
app.use('/home', require('./routes/home'));

// api stuff
app.use('/api/place', require('./api/place'));
app.use('/api/user', require('./api/user'));
app.use('/api/review', require('./api/review'));
app.use('/api/search', require('./api/search'));
app.use('/api/stream', require('./api/stream'));

// static files
app.use('/jquery', express.static('node_modules/jquery/dist'));
app.use('/jquery-ui', express.static('node_modules/jquery-ui-dist'));
app.use('/popper', express.static('node_modules/@popperjs/core/dist/umd'));
app.use('/bootstrap', express.static('node_modules/bootstrap/dist/js'));
app.use('/bootbox', express.static('node_modules/bootbox/dist/'));
app.use('/bootswatch', express.static('node_modules/bootswatch/dist'));
app.use('/', express.static('public'));

//404 & 500 error page
app.use(require('./middleware/error404'));
app.use(require('./middleware/error500'));
// app.use(multer({ dest: './public/images/uploads' }).any());
// app.use(multer({ dest: './uploads/' }).single('uploaded_file'));

// start app
const hostname = config.get('http.hostname');
const port = config.get('http.port');
app.listen(port, () => {
  debug(`Server listening at http://${hostname}:${port}/`);
});
