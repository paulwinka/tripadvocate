// appears nothing needs to be added here. 

const debug = require('debug')('app:api:search');
const express = require('express');

const router = express.Router();

router.all('/', async (req, res, next) => {
  try {
    res.type('application/json');
    res.write('[\n');

    for (let i = 0; i < 100000; ++i) {
      res.write(`{ "num": ${i} },\n`);
    }

    res.end('null]');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
