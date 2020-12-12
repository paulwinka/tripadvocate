const express = require('express');
const db = require('../db');
const debug = require('debug')('app:routes:place');
const path = require('path');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const member = require('../middleware/member');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads');
  },
  filename: function (req, file, cb) {
    // cb(null, file.fieldname + '-' + Date.now()) + path.extname(file.originalname);
    cb(null, Date.now() + '_' + file.originalname);
  },
});
// const upload = multer({ dest: 'public/uploads/' });
const upload = multer({ storage: storage });

// const database = await connect();

// creating instance of router.
const router = express.Router();
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

//define routes.

router.get('/', auth, async (req, res, next) => {
  try {
    const auth = req.user;
    const active = {};
    active.places = true;

    const categoryOptionList = {
      selected: '',
      options: [
        { value: '', text: 'All Categories' },
        { value: 'hotel', text: 'Hotels' },
        { value: 'restaurant', text: 'Restaurants' },
        { value: 'activity', text: 'Activities' },
      ],
    };

    const sortingOptionList = {
      selected: '',
      options: [
        { value: '', text: 'relevance' },
        { value: 'name', text: 'name' },
        { value: 'country', text: 'country' },
        { value: 'category', text: 'category' },
      ],
    };

    res.render('place/place-list', {
      title: 'Home Page: Places to see',
      active,
      categoryOptionList,
      sortingOptionList,
      user: auth,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/admin', auth, admin, async (req, res, next) => {
  try {
    // navbar showing highlights & current user;
    const auth = req.user;
    const active = {};
    active.places = true;

    // getting data
    // const q = req.query.q;
    const category = req.query.category;
    const sortBy = req.query.sortBy;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const pageNumber = parseInt(req.query.page) || 1;

    const categoryOptionList = {
      selected: category || '',
      options: [
        { value: '', text: 'All Categories' },
        { value: 'hotel', text: 'Hotels' },
        { value: 'restaurant', text: 'Restaurants' },
        { value: 'activity', text: 'Activities' },
      ],
    };

    const sortingOptionList = {
      selected: sortBy || '',
      options: [
        { value: '', text: 'relevance' },
        { value: 'name', text: 'name' },
        { value: 'country', text: 'country' },
        { value: 'category', text: 'category' },
      ],
    };
    const connection = await db.connect();
    const conditions = {};
    if (category) {
      conditions.category = category;
    }
    const matchStage = {};
    // if (q) {
    //   matchStage.$text = { $search: q };
    // }
    const cursor = connection.collection('place').find(conditions);

    //page stuff would go here;
    const places = await cursor.toArray();

    res.render('place/place-list-admin', {
      title: 'Home Page: Places to see',
      places,
      active,
      category,
      categoryOptionList,
      sortingOptionList,
      user: auth,
      // q,
      active: { places: true },
    });
  } catch (err) {
    next(err);
  }
});

// ROUTE: EDIT PLACE FORM (PUT)
router.get('/edit/:place_id', auth, admin, (req, res, next) => {
  const place_id = req.params.place_id;
  db.findPlaceById(place_id)
    .then((place) => {
      if (place) {
        res.render('place/place-edit', { title: 'Edit Place', place });
      } else {
        res.status(404).type('text/plain').send('place not found');
      }
    })
    .catch((err) => next(err));
});

// ROUTE: ADD PLACE FORM (POST)
router.get('/add', auth, admin, (req, res, next) => res.render('place/place-add', { title: 'Add Place' }));

// ROUTE: VIEW PLACE (GET): /place
router.get('/:place_id', auth, async (req, res, next) => {
  try {
    const auth = req.user;

    const place_id = req.params.place_id;
    // debug(`find place by id, place_id =  ${place_id}`);
    const place = await db.findPlaceById(place_id);
    const placeReviews = null;
    // const placeReviews = await db.getAllReviewsPlacesUsers(place_id);
    if (place) {
      const active = {};
      active.places = true;
      res.render('place/place-view', { title: place.title, place, placeReviews, active, user: auth });
    } else {
      res.status(404).type('text/plain').send('place not found');
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;

// const place_id = req.params.place_id;
// debug(`find place by id, place_id =  ${place_id}`);
// const place = await db.findPlaceById(place_id);
// if(place) {
//   res.render('place/place-view', { title: place.title, place });
// } else {
//   res.status(404).type('text/plain').send('place not found')

// router.post('/upload', upload.single('uploaded_file'), (req, res, next) => {
//   debug(req.file);
//   const file = req.file;
//   if (!file) {
//     const error = new Error('Please upload a file');
//     error.httpStatusCode = 400;
//     return next(error);
//   }
//   res.send(file);
// });
