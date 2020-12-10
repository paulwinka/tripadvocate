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
  const places = db.get
  res.render('home/start', { title: 'TripAdvocate: Home', auth: req.user });
});

module.exports = router;
