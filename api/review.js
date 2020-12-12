const express = require('express');
const db = require('../db');
const debug = require('debug')('app:api:review');
const Joi = require('joi');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(express.urlencoded({ extended: false }));
router.use(express.json());
router.use(auth);

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
    const collation = { locale: 'en_US', strength: 1 };

    const matchStage = {};
    if (q) {
      matchStage.$text = { $search: q };
    }
    const pipeline = [
      {
        $match: matchStage,
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
      // debug(JSON.stringify(doc));
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

router.post('/:id', async (req, res, next) => {
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
    // review.user_id = req.user.user_id;
    review._id = req.params.id;
    debug(review);
    review = await schema.validateAsync(review, { abortEarly: false });
    const updateReview = await db.updateReview(review);
    res.json(updateReview);
  } catch (err) {
    sendError(err, res);
  }
});

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

// DELETE
router.delete('/:id', async (req, res, next) => {
  debug(`delete review ${JSON.stringify(req.body)}`);
  try {
    const schema = Joi.number().min(1).required().label('id');
    const id = await schema.validateAsync(req.params.id);
    const review = db.findReviewsByReviewId(id);
    review.review_id = req.params.id;
    const results = await db.deleteReview(review);
    res.json(results);
  } catch (err) {
    sendError(err, res);
  }
});

module.exports = router;
