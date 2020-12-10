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
  }
  return _database;
};

const getAllUsers = async () => {
  const database = await connect();
  return database.collection('user').find({}).toArray();
};

const upsertPlace = async (place) => {
  const database = await connect();
  return database.collection('place').findOneAndUpdate(
    { _id: new ObjectID(place._id) },
    // { _id: place._id },
    {
      $set: {
        name: place.name,
        category: place.category,
        city: place.city,
        state: place.state,
        country: place.country,
        description: place.description,
        image: { filename: place.image, mime: 'image/jpeg' },
      },
    },
    { upsert: true, returnOriginal: true }
  );
};

const getUserByUsername = async (username) => {
  const database = await connect();
  return database.collection('user').findOne({ username });
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
