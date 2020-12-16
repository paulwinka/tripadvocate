// importing express library
const express = require('express');
const db = require('../db');
// const pagerUtils = require('../pager-utils');
const debug = require('debug')('app:routes:user');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// getting connection config
const config = require('config');
const databaseConfig = config.get('db');

// creating instance of router.
const router = express.Router();
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

//connect to the database
// router.get('/', async (req, res, next) => {
//   try {
//     const auth = req.user;
//     const active = {};
//     active.reviews = true;

//     res.render('user/review-list', {
//       title: 'Home Page: reviews to see',
//       user: auth,
//       active,
//     });
//   } catch (err) {
//     next(err);
//   }
// });
// actual routes
// VIEW ALL USERS
router.get('/admin', auth, admin, async (req, res, next) => {
  try {
    const user = req.user;
    const active = {};
    active.admin = true;

    // const search = req.query.search;
    // const pageSize = parseInt(req.query.pageSize) || 10;
    // const pageNumber = parseInt(req.query.page) || 1;

    // const connection = await db.connect();
    // const cursor = connection.collection('user').find();
    // const users = await cursor.toArray();
    res.render('user/user-admin', {
      title: 'Users - Admin',
      // users,
      user: user,
      active,
      // search,
    });
  } catch (err) {
    next(err);
  }
});

// VIEW USER ADMIN
router.get('/:id', auth, admin, async (req, res, next) => {
  const id = req.params.id;
  const active = {};
  active.admin = true;
  const user = req.user;
  try {
    const userToView = await db.getUserById(id);
    debug(userToView);
    // const reviews = await db.getReviewsForUser(id);
    if (user) {
      res.render('user/user-view', { title: 'View User', userToView, user: user, active });
    } else {
      res.status(404).type('text/plain').send('user not found');
    }
  } catch (err) {
    next(err);
  }
});

// ADD USER
router.get('/add', (req, res, next) => {
  res.render('user/user-add', { title: 'Add User' });
});
// EDIT USER (using modal, shouldn't be needed)
// router.get('/edit/:id', (req, res, next) => {
//   const id = req.params.id;
//   db.getUserByUserId(id).then((user) => {
//     if (user) {
//       res.render('user/user-edit', { title: 'Edit User', user });
//     } else {
//       res.status(404).type('text/plain').send('user not found');
//     }
//   });
// });

// allows it to be seen elsewhere in app
module.exports = router;
