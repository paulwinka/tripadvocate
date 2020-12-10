// apis always puts out a json object and are meant to be modular and applied to
// more than one interface importing libraries
const db = require('../db');
const express = require('express');

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
    const schema = Joi.string().min(1).required().label('id');
    const id = await schema.validateAsync(req.params.id);
    const user = await db.getUserById(id);
    debug(user);
    debug(user._id)
    user.user_id = req.params.id.toString();
    const results = await db.deleteUser(user);
    res.json(results);
  } catch (err) {
    sendError(err, res);
  }
});

module.exports = router;
