// importing express library
const express = require('express');
const debug = require('debug')('app:routes:review');
const db = require('../db');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// creating instance of router.
const router = express.Router();

//routes

// VIEW ALL REVIEWS
router.get('/', async (req, res, next) => {
  try {
    const auth = req.user;
    const active = {};
    active.reviews = true;

    res.render('review/review-list', {
      title: 'Home Page: reviews to see',
      user: auth,
      active,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/admin', auth, admin, async (req, res, next) => {
  try {
    const auth = req.user;
    const active = {};
    active.admin = true;

    res.render('review/review-list-admin', {
      title: 'Home Page: reviews to see',
      user: auth,
      active,
    });
  } catch (err) {
    next(err);
  }
});

// ADD REVIEW FORM
router.get('/add', auth, (req, res, next) => {
  res.render('review/review-add', { title: 'Add Review', auth: req.user });
});
// ADD REVIEW FORM WITH PLACE ID
router.get('/add/:place_id', auth, async (req, res, next) => {
  const place_id = req.params.place_id;
  const place = await db.findPlaceById(place_id);
  res.render('review/review-add', { title: 'Add Review', auth: req.user, place });
});

// EDIT REVIEW FORM
router.get('/edit/:id/admin', auth, admin, async (req, res, next) => {
  try {
    const active = {};
    active.admin = true;
    const auth = req.user;
    const id = req.params.id;
    debug(id);
    const review = await db.getReviewById(id);
    debug(review);
    if (review) {
      res.render('review/review-edit-admin', { review, user: auth, active, title: 'Edit Review - Admin' });
    } else {
      res.status(404).type('text/plain').send('no review found');
    }
  } catch (err) {
    debug(err.stack);
  }
});

// VIEW SINGLE REVIEW
// router.get('/:id', async (req, res, next) => {
//   const id = req.params.id;
//   const review = await db.getUserPlaceReviewInfoForSingleReviewView(id);
//   debug(`what is the review ${review.headline}`);
//   if (review) {
//     res.render('review/review-view', { title: 'Review view', review });
//   } else {
//     res.status(404).type('text/plain').send('no review found');
//   }
// });

router.get('/:id/auth', auth, async (req, res, next) => {
  const user = req.user;
  const id = req.params.id;
  const review = await db.getUserPlaceReviewInfoForSingleReviewView(id);
  debug(`what is the review ${review.headline}`);
  if (review) {
    res.render('review/review-view', { title: 'Review view', review, user: user });
  } else {
    res.status(404).type('text/plain').send('no review found');
  }
});

// allows it to be seen elsewhere in app
module.exports = router;
