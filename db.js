const debug = require('debug')('app:db');
const config = require('config');
const { data } = require('jquery');
const moment = require('moment');
const { MongoClient, ObjectID } = require('mongodb');
let _database = null;

const connect = async () => {
  if (!_database) {
    // const dbUrl = config.get('db.url');
    const dbUrl = config.get('db.url');
    const dbName = config.get('db.name');
    const poolSize = config.get('db.poolSize');
    const client = await MongoClient.connect(dbUrl, { useUnifiedTopology: true, poolSize: poolSize });
    _database = client.db(dbName);
    debug('***DATABASE CONNECTED***');
  }
  return _database;
};

const getAllUsers = async () => {
  const database = await connect();
  return database.collection('user').find({}).toArray();
};

const getReviewsForPlace = async (place_id) => {
  const collation = { locale: 'en_US', strength: 1 };
  const pipeline = [
    {
      $match: {
        place_id: new ObjectID(place_id),
      },
    },
    {
      $lookup: {
        from: 'user',
        localField: 'user_id',
        foreignField: '_id',
        as: 'reviewing_user',
      },
    },
  ];
  const database = await connect();
  return database.collection('review').aggregate(pipeline, { collation: collation }).toArray();
};

const getSingleReview = async (_id) => {
  const collation = { locale: 'en_US', strength: 1 };
  const pipeline = [
    {
      $match: {
        _id: new ObjectID(_id),
      },
    },
    {
      $lookup: {
        from: 'user',
        localField: 'user_id',
        foreignField: '_id',
        as: 'reviewing_user',
      },
    },
    {
      $lookup: {
        from: 'place',
        localField: 'place_id',
        foreignField: '_id',
        as: 'reviewed_place',
      },
    },
  ];
  const database = await connect();
  return database.collection('review').aggregate(pipeline, { collation: collation }).toArray();
};

const upsertReview = async (review) => {
  const database = await connect();
  return database.collection('review').updateOne(
    { place_id: new ObjectID(review.place_id), user_id: new ObjectID(review.user_id) },
    {
      $setOnInsert: {
        place_id: new ObjectID(review.place_id),
        user_id: new ObjectID(review.user_id),
      },
      $set: {
        title: review.title,
        score: review.score,
        description: review.description,
      },
    },
    { upsert: true }
  );
};

const updateReview = async (review) => {
  const database = await connect();
  return database.collection('review').updateOne(
    { _id: new ObjectID(review._id) },
    {
      $set: {
        title: review.title,
        score: review.score,
        description: review.description,
      },
    },
    { upsert: false }
  );
};

const upsertPlace = async (place) => {
  const update = {
    $set: {
      name: place.name,
      category: place.category,
      city: place.city,
      state: place.state,
      country: place.country,
      description: place.description,
    },
  };
  if (place.image) {
    update.$set.image = place.image;
  }
  const database = await connect();
  return database.collection('place').updateOne({ _id: new ObjectID(place._id) }, update, { upsert: true });
};

const getUserByUsername = async (username) => {
  const database = await connect();
  return database.collection('user').findOne({ username });
};

const getReviewById = async (_id) => {
  const database = await connect();
  return database.collection('review').findOne({ _id: new ObjectID(_id) });
};

const getUserByEmail = async (email) => {
  const database = await connect();
  return database.collection('user').findOne({ email: email });
};

const getUserById = async (id) => {
  const database = await connect();
  return database.collection('user').findOne({ _id: new ObjectID(id) });
};

const updateLastLogin = async (user_id) => {
  const database = await connect();
  return database
    .collection('user')
    .updateOne({ _id: new ObjectID(user_id) }, { $currentDate: { last_login_time: true } });
};

const getAllPlaces = async () => {
  const database = await connect();
  return database.collection('place').find({});
};
const insertPlace = async (place) => {
  const database = await connect();
  return database.collection('place').findOneAndUpdate(
    { _id: new ObjectID(place._id) },
    {
      $set: {
        name: place.name,
        category: place.category,
        city: place.city,
        state: place.state,
        country: place.country,
        image: { filename: place.image, mime: 'image/jpeg' },
      },
    },
    { upsert: true, returnOriginal: false }
  );
};

const updatePhoto = async (place) => {
  const database = await connect();
  return database.collection('place').findOneAndUpdate(
    { _id: new ObjectID(place._id) },
    {
      $set: {
        name: place.name,
        category: place.category,
        city: place.city,
        state: place.state,
        country: place.country,
        image: { filename: place.image, mime: 'image/jpeg' },
      },
    },
    { upsert: true, returnOriginal: false }
  );
};

const registerUser = async (user) => {
  user._id = new ObjectID();

  const database = await connect();
  return database.collection('user').updateOne(
    { _id: user._id },
    {
      $set: {
        username: user.username,
        email: user.email,
        is_email_verified: 0,
        role: user.role || 'member',
        password: user.password,
        password_hash: user.password_hash,
      },
      $currentDate: { registration_time: true, last_login_time: true },
    },
    { upsert: true }
  );
};

const updateEmailVerified = async (email, verified) => {
  const database = await connect();
  return database.collection('user').updateOne({ email: email }, { $set: { is_email_verified: 1 } });
};

// const registerUserWithInsert = async (user) => {
//   const database = await connect();
//   return database
//     .collection('user')
//     .insertOne({
//       username: user.username,
//       email: user.email,
//       password: user.password,
//       password_hash: user.password_hash,
//     })
//     .updateOne({ _id: ObjectID.getTimestamp() }, { $currentDate: { registration_time: true } });
// };

const updatePlace = async (place) => {
  const database = await connect();
  return database.collection('place').updateOne(
    { _id: new ObjectID(place._id) },
    {
      $set: {
        name: place.name,
        category: place.category,
        city: place.city,
        state: place.state,
        country: place.country,
      },
    },
    { upsert: false }
  );
};

const updateUser = async (user) => {
  const database = await connect();
  return database.collection('user').updateOne(
    { _id: new ObjectID(user._id) },
    {
      $set: {
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        role: user.role,
        city: user.city,
        state: user.state,
        country: user.country,
      },
    },
    { upsert: false }
  );
};

const deleteUser = async (user) => {
  const database = await connect();
  return database.collection('user').deleteOne({ _id: ObjectID(user._id) });
};

const deletePlace = async (place) => {
  const database = await connect();
  return database.collection('place').deleteOne({ _id: ObjectID(place._id) });
};

const findPlaceById = async (id) => {
  const database = await connect();
  return database.collection('place').findOne({ _id: new ObjectID(id) });
};

const updatePasswordHash = async (email, password_hash) => {
  const database = await connect();
  return database.collection('user').findOneAndUpdate(
    { email: email },
    {
      $set: {
        password_hash: password_hash,
      },
    },
    { upsert: false }
  );
};

const verifyReviewSubmitted = async (place_id, user_id) => {
  const database = await connect();
  return database.collection('review').findOne({ place_id: new ObjectID(place_id), user_id: new ObjectID(user_id) });
};
// const getUserProfileData = async;

module.exports = {
  connect,
  getAllUsers,
  getUserByUsername,
  getUserByEmail,
  getUserById,
  updateLastLogin,
  getAllPlaces,
  insertPlace,
  findPlaceById,
  updatePlace,
  updateUser,
  registerUser,
  deleteUser,
  updateEmailVerified,
  updatePhoto,
  updatePasswordHash,
  upsertPlace,
  deletePlace,
  upsertReview,
  getReviewById,
  updateReview,
  getReviewsForPlace,
  getSingleReview,
  verifyReviewSubmitted,
  // getUserProfileData,
};

// [{
//   "_id": {
//     "$oid": "5fbc39cbfc13ae535d00001e"
//   },
//   "name": "Eagle, golden",
//   "category": "activity",
//   "city": "Kirkwood",
//   "state": "Missouri",
//   "country": "USA",
//   "image": {
//     "path": "/images/places/magic_house.jpg",
//     "mimetype": "image/jpeg"
//   }
// }]
