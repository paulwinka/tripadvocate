const { request } = require('express');
const express = require('express');
const db = require('../db');
const debug = require('debug')('app:routes:place');
const auth = require('../middleware/auth');

// creating instance of router.
const router = express.Router();
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

router.get('/', auth, async (req, res, next) => {
  const auth = req.user;
  const active = {};
  active.home = true;
  const places = db.get;
  res.render('home/start', { title: 'TripAdvocate: Home', user: auth, active });
});

module.exports = router;
