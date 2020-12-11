// apis always puts out a json object and are meant to be modular and applied to
// more than one interface importing libraries
const db = require('../db');
const config = require('config');
const express = require('express');
const debug = require('debug')('app:api:place');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const uploadImg = require('../middleware/multer');
const path = require('path');
const Joi = require('joi');
const { JsonWebTokenError } = require('jsonwebtoken');

// creating router
const router = express.Router();
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

// GENERAL ERROR HANDLER
const sendError = (err, res) => {
  debug(err);
  if (err.isJoi) {
    res.json({ error: err.details.map((x) => x.message + '.').join('\n') });
  } else {
    res.json({ error: err.message });
  }
};

// GET ALL, THE BIG QUERY, GOES AT THE TOP.
router.get('/', auth, async (req, res, next) => {
  debug('get all');
  try {
    const q = req.query.q;
    const category = req.query.category;
    const sortBy = req.query.sortBy;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 100;
    const collation = { locale: 'en_US', strength: 1 };

    const matchStage = {};
    if (q) {
      matchStage.$text = { $search: q };
    }
    if (category) {
      matchStage.category = { $eq: category };
    }

    let sortStage = null;
    switch (sortBy) {
      case 'name':
        sortStage = { name: 1 };
        break;
      case 'country':
        sortStage = { country: 1 };
        break;
      case 'category':
        sortStage = { category: 1 };
        break;
      case 'relevance':
      default:
        sortStage = q ? { relevance: -1 } : { name: 1 };
        break;
    }
    const pipeline = [
      { $match: matchStage },

      {
        $project: {
          name: 1,
          category: 1,
          city: 1,
          state: 1,
          country: 1,
          image: 1,
          relevance: q ? { $meta: 'textScore' } : null,
        },
      },
      { $sort: sortStage },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
    ];

    const connection = await db.connect();
    const cursor = connection.collection('place').aggregate(pipeline, { collation: collation });
    debug(cursor);

    // write the JSON file
    res.type('application/json');
    res.write('[\n');
    for await (const doc of cursor) {
      res.write(JSON.stringify(doc));
      res.write(',\n');
    }
    res.end('null]');
  } catch (err) {
    debug(err.stack);
    // sendError(err, res);
  }
});
// POST THAT ADDS PLACE INCLUDING UPLOADING PHOTO.
router.post('/', auth, admin, uploadImg().single('uploaded_file'), async (req, res, next) => {
  debug(`insert place ${JSON.stringify(req.body)}`);
  try {
    const schema = Joi.object({
      _id: Joi.string().allow(''),
      name: Joi.string().required(),
      category: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().allow('').min(2),
      country: Joi.string().required(),
      description: Joi.string().allow('').min(10),
      image: Joi.object({ filename: Joi.string().required(), mimetype: Joi.string().required() }),
    });

    const place = await schema.validateAsync(req.body, { abortEarly: false });
    if (req.file) {
      place.image = { filename: req.file.filename, mime: req.file.mimetype };
    }
    debug(req.file);
    const result = await db.upsertPlace(place);
    res.json(result);
  } catch (err) {
    sendError(err, res);
  }
});

// GET - FOCUSED VIEW OF SINGLE PLACE.
router.get('/:id', async (req, res, next) => {
  debug(`find by id`);
  try {
    const schema = Joi.required().label('id');
    const id = await schema.validateAsync(req.params.id);
    const findPlaceById = await db.findPlaceById(id);
    res.json(findPlaceById);
  } catch (err) {
    sendError(err, res);
  }
});

// PUT
router.put('/:id', async (req, res, next) => {
  debug(`update place ${JSON.stringify(req.body)}`);
  try {
    const schema = Joi.object({
      _id: Joi.objectId().required(),
      name: Joi.string(),
      category: Joi.string().min(4),
      city: Joi.string(),
      state: Joi.string(),
      country: Joi.string(),
      // image: Joi.string(),
    });
    let place = req.body;
    place._id = req.params.id;
    place = await schema.validateAsync(place, { abortEarly: false });
    const results = await db.updatePlace(place);
    res.json(results);
  } catch (err) {
    sendError(err, res);
  }
});

// DELETE
router.delete('/:id', async (req, res, next) => {
  debug(`delete place ${JSON.stringify(req.body)}`);
  try {
    const schema = Joi.string().min(1).required().label('id');
    const id = await schema.validateAsync(req.params.id);
    const place = db.findPlaceById(id);
    place._id = req.params.id;
    const results = await db.deletePlace(place);
    res.json(results);
  } catch (err) {
    sendError(err, res);
  }
});

// UPLOAD SINGLE PHOTO

router.post('/upload', uploadImg().single('uploaded_file'), async (req, res, next) => {
  debug(req.file);
  const file = req.file;
  if (!file) {
    const error = new Error('Please upload a file');
    error.httpStatusCode = 400;
    return next(error);
  } else {
    const results = await db.updatePhoto(file.filename);
  }
  res.send(file);
});

module.exports = router;

//https://stackoverflow.com/questions/31496100/cannot-app-usemulter-requires-middleware-function-error

// POST
// router.post('/', async (req, res, next) => {
//   debug(`insert place ${JSON.stringify(req.body)}`);
//   try {
//     const schema = Joi.object({
//       name: Joi.string().required(),
//       category: Joi.string().min(4).required(),
//       city: Joi.string().required(),
//       state: Joi.string(),
//       country: Joi.string().required(),
//       image: Joi.string(),
//     });
//     // const place = req.body;
//     const place = await schema.validateAsync(req.body);
//     const result = await db.insertPlace(place);
//     res.json(result);
//   } catch (err) {
//     sendError(err, res);
//   }
// });
