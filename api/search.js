const debug = require('debug')('app:api:search');
const express = require('express');
const Joi = require('joi');
const db = require('../db');

const router = express.Router();
router.use(express.urlencoded({ extended: false }));
router.use(express.json());


module.exports = router;

