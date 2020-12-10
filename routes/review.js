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
    const search = req.query.search;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const pageNumber = parseInt(req.query.page) || 1;

    let query = db.getAllReviews();

    if (search) {
      // query = query.whereRaw('MATCH (review.title, review.review_text) AGAINST (? IN NATURAL LANGUAGE MODE)', [search]);
      query = query.whereRaw('review.title LIKE ? OR review_text LIKE ?', ['%' + search + '%', '%' + search + '%']);
    } else {
      query = query.orderBy('review.title');
    }
    const pager = await pagerUtils.getPager(query, pageSize, pageNumber, req.originalUrl);
    const reviews = await query.limit(pageSize).offset(pageSize * (pageNumber - 1));

    if (!req.xhr) {
      res.render('review/review-list', {
        title: 'Home Page: reviews to see',
        reviews,
        search,
        pager,
      });
    } else {
      res.render('review/search-results', {
        reviews,
        pager,
        layout: null,
      });
    }
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
router.get('/edit/:id', auth, (req, res, next) => {
  const id = req.params.id;
  db.findReviewsByReviewId(id).then((review) => {
    if (review && review.user_id == req.user.user_id) {
      res.render('review/review-edit', { title: 'Edit Review', review, auth: req.user });
      debug(`${review.review_id}`);
      // debug(`${review.review_text}`);
    } else {
      // res.status(404).type('text/plain').send('no review found');
      next();
    }
  });
});

// VIEW SINGLE REVIEW
router.get('/:id', async (req, res, next) => {
  const id = req.params.id;
  const review = await db.getUserPlaceReviewInfoForSingleReviewView(id);
  debug(`what is the review ${review.headline}`);
  if (review) {
    res.render('review/review-view', { title: 'Review view', review });
  } else {
    res.status(404).type('text/plain').send('no review found');
  }
});

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
