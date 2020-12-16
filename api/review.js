const express = require('express');
const db = require('../db');
const debug = require('debug')('app:api:review');
const Joi = require('joi');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const path = require('path');

const router = express.Router();
router.use(express.urlencoded({ extended: false }));
router.use(express.json());
// router.use(auth);

// general error handler
const sendError = (err, res) => {
  debug(err);
  if (err.isJoi) {
    res.json({ error: err.details.map((x) => x.message + '.').join('\n') });
  } else {
    res.json({ error: err.message });
  }
};

// GET ALL
router.get('/', async (req, res, next) => {
  debug('get all reviews api');
  try {
    const q = req.query.q;
    debug(q);
    const collation = { locale: 'en_US', strength: 1 };

    const matchStage = {};
    if (q) {
      matchStage.$text = { $search: q };
    }
    const pipeline = [
      {
        $match: { matchStage },
      },
      {
        $lookup: {
          from: 'place',
          localField: 'place_id',
          foreignField: '_id',
          as: 'places',
        },
      },
      {
        $lookup: {
          from: 'user',
          localField: 'user_id',
          foreignField: '_id',
          as: 'users',
        },
      },
      // {
      //   $unwind: '$place',
      // },
    ];
    const connection = await db.connect();
    const cursor = connection.collection('review').aggregate(pipeline, { collation: collation });
    // debug(cursor.toArray());

    // write the JSON file
    res.type('application/json');
    res.write('[\n');
    for await (const doc of cursor) {
      res.write(JSON.stringify(doc));
      debug(JSON.stringify(doc));
      res.write(',\n');
    }
    res.end('null]');
  } catch (err) {
    sendError(err, res);
  }
});

router.get('/admin', async (req, res, next) => {
  debug('get all reviews api admin!!!');
  try {
    const collation = { locale: 'en_US', strength: 1 };
    const q = req.query.q;
    debug('*******************');
    debug(q);

    const matchStage = {};
    if (q) {
      matchStage.$text = { $search: q };
    }
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'place',
          localField: 'place_id',
          foreignField: '_id',
          as: 'places',
        },
      },
      {
        $lookup: {
          from: 'user',
          localField: 'user_id',
          foreignField: '_id',
          as: 'users',
        },
      },
    ];
    const connection = await db.connect();
    // const cursor = connection.collection('place').aggregate(pipeline, { collation: collation });

    const cursor = connection.collection('review').aggregate(pipeline, { collation: collation });
    debug('cursor?');
    // debug(cursor);
    debug('cursor?');

    // write the JSON file
    res.type('application/json');
    res.write('[\n');
    for await (const doc of cursor) {
      res.write(JSON.stringify(doc));
      debug(JSON.stringify(doc));
      res.write(',\n');
    }
    res.end('null]');
  } catch (err) {
    sendError(err, res);
  }
});

// GET SINGLE
router.get('/:id', async (req, res, next) => {
  try {
    const schema = Joi.number().min(1).required().label('id');
    const id = await schema.validateAsync(req.params.id);
    const findReviewsByReviewId = await db.findReviewsByReviewId(id);
    // debug(`review view stuff ${findReviewsByReviewId.review_id}`);
    res.json(findReviewsByReviewId);
  } catch (err) {
    next(err);
  }
});

// POST
router.post('/', async (req, res, next) => {
  // debug(`add review ${JSON.stringify(req.body)}`);
  try {
    const schema = Joi.object({
      user_id: Joi.number().required(),
      place_id: Joi.number().required(),
      title: Joi.string().required(),
      review_text: Joi.string().required(),
    });
    let review = req.body;
    review.user_id = req.user.user_id;
    review = await schema.validateAsync(review);
    const insertReview = await db.insertReview(review);
    res.json(insertReview);
  } catch (err) {
    sendError(err, res);
  }
});
//EDIT REVIEW USER
router.post('/:id', auth, async (req, res, next) => {
  // debug(`add review ${JSON.stringify(req.body)}`);
  try {
    const schema = Joi.object({
      _id: Joi.string().required(),
      place_id: Joi.string().required(),
      user_id: Joi.string().required(),
      title: Joi.string().required(),
      score: Joi.number().required(),
      description: Joi.string().required(),
    });
    let review = req.body;
    if (review.user_id == req.user._id) {
      review._id = req.params.id;
      debug('TEST');
      // debug(review);
      debug('TEST');
      review = await schema.validateAsync(review, { abortEarly: false });
      const updateReview = await db.updateReview(review);
      // debug(updateReview);
      res.json(updateReview);
    } else {
      res.render('error/basic', { title: 'Not your review!', message: 'you can only edit your own reviews' });
    }
    // review.user_id = req.user._id;
  } catch (err) {
    debug(err.stack);
    sendError(err, res);
  }
});
router.post('/:id/admin', auth, async (req, res, next) => {
  // debug(`add review ${JSON.stringify(req.body)}`);
  try {
    const schema = Joi.object({
      _id: Joi.string().required(),
      place_id: Joi.string().required(),
      user_id: Joi.string().required(),
      title: Joi.string().required(),
      score: Joi.number().required(),
      description: Joi.string().required(),
    });
    let review = req.body;
    // if (review.user_id == req.user._id) {
      review._id = req.params.id;
      debug('TEST');
      // debug(review);
      debug('TEST');
      review = await schema.validateAsync(review, { abortEarly: false });
      const updateReview = await db.updateReview(review);
      // debug(updateReview);
      res.json(updateReview);
    // } else {
    //   res.render('error/basic', { title: 'Not your review!', message: 'you can only edit your own reviews' });
    // }
    // review.user_id = req.user._id;
  } catch (err) {
    debug(err.stack);
    sendError(err, res);
  }
});
// ADD REVIEW
router.post('/:id/add', auth, async (req, res, next) => {
  // debug(`add review ${JSON.stringify(req.body)}`);
  const auth = req.user;
  try {
    const schema = Joi.object({
      place_id: Joi.string().required(),
      user_id: Joi.string().required(),
      title: Joi.string().required(),
      score: Joi.number().required(),
      description: Joi.string().required(),
    });
    let review = req.body;
    review.place_id = req.params.id;
    review.user_id = req.user._id;
    debug(review);
    const reviewMade = await db.verifyReviewSubmitted(review.place_id, review.user_id);
    debug('*****');
    debug(reviewMade);
    debug('*****');
    if (!reviewMade) {
      debug(review);
      debug('HELLO');
      review = await schema.validateAsync(review, { abortEarly: false });
      const updateReview = await db.upsertReview(review);
      debug(updateReview);
      res.json(updateReview);
    } else {
      res.json({ error: `You already made a review.`, reviewMade: reviewMade._id });
    }
  } catch (err) {
    sendError(err, res);
  }
});

// DELETE
router.delete('/:id', auth, async (req, res, next) => {
  debug(`delete review ${JSON.stringify(req.body)}`);
  try {
    const schema = Joi.string().min(1).required().label('id');
    const review_id = await schema.validateAsync(req.params.id, { abortEarly: false });
    const review = await db.getReviewById(review_id);

    debug(review);
    debug(`req.user._id is`);
    debug(req.user._id);
    debug(review.user_id);
    if (review.user_id == req.user._id) {
      const results = await db.deleteReview(review._id);
      res.json(results);
    } else {
      res.json({ error: `You can only delete your own reviews.` });
    }
    review.review_id = req.params.id;
  } catch (err) {
    sendError(err, res);
  }
});

// DELETE
router.delete('/:id/admin', async (req, res, next) => {
  try {
    const schema = Joi.string().min(1).required().label('id');
    const id = await schema.validateAsync(req.params.id);
    const results = await db.deleteReview(id);
    res.json(results);
  } catch (err) {
    sendError(err, res);
  }
});

module.exports = router;

// PUT
// router.put('/:id', async (req, res, next) => {
//   try {
//     const schema = Joi.object({
//       user_id: Joi.number().required(),
//       review_id: Joi.number().required(),
//       title: Joi.string().required(),
//       review_text: Joi.string().required(),
//     });
//     let review = req.body;
//     review.review_id = req.params.id;
//     review.user_id = req.user.user_id;
//     review = await schema.validateAsync(review, { abortEarly: false });
//     // if ((await db.findReviewsByReviewId(review.review_id)).user_id == req.user.user_id) { }
//     const updateReview = await db.updateReview(review);
//     res.json(updateReview);
//   } catch (err) {
//     sendError(err, res);
//   }
// });
