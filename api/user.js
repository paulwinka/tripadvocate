// apis always puts out a json object and are meant to be modular and applied to
// more than one interface importing libraries
const db = require('../db');
const express = require('express');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const debug = require('debug')('app:api:user');
const Joi = require('joi');

//creating router
const router = express.Router();
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

// general error handler
const sendError = (err, res) => {
  debug(err);
  if (err.isJoi) {
    res.json({ error: err.details.map((x) => x.message + '.').join('\n') });
  } else {
    res.json({ error: err.message });
  }
};

router.get('/', auth, async (req, res, next) => {
  // debug('get all');
  try {
    const q = req.query.q;
    debug('searching, starting with q')
    debug(q);
    // const category = req.query.category;
    // const sortBy = req.query.sortBy;
    // const page = parseInt(req.query.page) || 1;
    // const pageSize = parseInt(req.query.pageSize) || 100;
    const collation = { locale: 'en_US', strength: 1 };

    const matchStage = {};
    if (q) {
      matchStage.$text = { $search: q };
    }
    // if (category) {
    //   matchStage.category = { $eq: category };
    // }

    // let sortStage = null;
    // switch (sortBy) {
    //   case 'name':
    //     sortStage = { name: 1 };
    //     break;
    //   case 'country':
    //     sortStage = { country: 1 };
    //     break;
    //   case 'category':
    //     sortStage = { category: 1 };
    //     break;
    //   case 'relevance':
    //   default:
    //     sortStage = q ? { relevance: -1 } : { name: 1 };
    //     break;
    // }
    const pipeline = [
      { $match: matchStage },
      

      //   {
      //     $project: {
      //       name: 1,
      //       category: 1,
      //       city: 1,
      //       state: 1,
      //       country: 1,
      //       image: 1,
      //       relevance: q ? { $meta: 'textScore' } : null,
      //     },
      //   },
      //   { $sort: sortStage },
      //   { $skip: (page - 1) * pageSize },
      //   { $limit: pageSize },
    ];

    const connection = await db.connect();
    const cursor = connection.collection('user').aggregate(pipeline, { collation: collation });
    // debug(cursor);
    // debug('cursor?');
    // debug('cursor?');

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
    debug(err.stack);
    // sendError(err, res);
  }
});

// something I found to help with mongo json responses.
const sendJsonResponse = (res, status, content) => {
  res.status(status);
  res.json(content);
};
// GET ALL
router.get('/', async (req, res, next) => {
  debug('get all');
  try {
    const users = await db.getAllUsers();
    res.json(users);
  } catch (err) {
    sendError(err, res);
  }
});

// GET SINGLE
router.get('/:id', async (req, res, next) => {
  try {
    const schema = Joi.number().min(1).required().label('id');
    const id = await schema.validateAsync(req.params.id);
    const user = await db.getUserByUserId(id);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// POST
router.post('/', async (req, res, next) => {
  debug(`insert user ${JSON.stringify(req.body)}`);
  try {
    const schema = Joi.object({
      first_name: Joi.string().required(),
      last_name: Joi.string().min(4).required(),
      email: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      country: Joi.string(),
    });
    const user = await schema.validateAsync(req.body);
    const result = await db.insertUser(user);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// PUT
router.put('/:_id', async (req, res, next) => {
  debug(`update user ${JSON.stringify(req.body)}`);
  try {
    const schema = Joi.object({
      _id: Joi.string(),
      first_name: Joi.string().required(),
      last_name: Joi.string().min(4).required(),
      username: Joi.string(),
      role: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      country: Joi.string(),
    });
    let user = req.body;
    user._id = req.params._id;
    user = await schema.validateAsync(user, { abortEarly: false });
    const updateUser = await db.updateUser(user);
    // const entireUser = await db.getUserById(user._id)
    sendJsonResponse(res, 200, { user, message: 'updated!' });
  } catch (err) {
    sendError(err, res);
  }
});

// DELETE
router.delete('/:id', async (req, res, next) => {
  try {
    debug('delete called');
    const schema = Joi.string().min(1).required().label('id');
    const id = await schema.validateAsync(req.params.id);
    const user = await db.getUserById(id);
    // debug(user);
    // debug(user._id);
    user.user_id = req.params.id.toString();
    const results = await db.deleteUser(user);
    debug(results);
    res.json(results);
  } catch (err) {
    sendError(err, res);
  }
});

module.exports = router;
