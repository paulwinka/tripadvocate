// lodash
const _ = require('lodash');
const moment = require('moment');

// get connection config
const config = require('config');
const databaseConfig = config.get('db');
const debug = require('debug')('app:db');

//connect to the database
const knex = require('knex')({
  client: 'mysql',
  connection: databaseConfig,
});

const registerUser = (user) => {
  return knex('user').insert({
    username: user.username,
    email: user.email,
    password: user.password,
    password_hash: user.password_hash,
    registration_time: user.registration_time,
    last_login_time: user.last_login_time,
  });
};
const updatePasswordHash = (user_id, password_hash) => {
  return knex('user').update('password_hash', password_hash).where('user_id', user_id);
};
// all the queries.
const getAllPlaces = () => {
  return knex('place').select('*', 'place.title as place_title');
};
const getAllReviewsPlacesUsers = (place_id) => {
  return knex('place')
    .where('place.place_id', place_id)
    .leftJoin('review', 'place.place_id', 'review.place_id')
    .innerJoin('user', 'review.user_id', 'user.user_id')
    .select(
      'place.*',
      'place.title as place_title',
      'place.city as place_city',
      'place.state as place_state',
      'place.country as place_country',
      'user.username as username',
      'review.review_text as review_text',
      'review.title as review_title',
      'user.first_name as first_name',
      'user.last_name as last_name'
    );
};
const getAllPlaces = () => {
  return (
    knex('place')
      .leftJoin('review', 'place.place_id', 'review.place_id')
      .leftJoin('user', 'review.user_id', 'user.user_id')
      .groupBy('place.place_id')
      // .count('review.review_text as review_count')
      .select(
        'place.*',
        // 'place.title as place_title',
        // 'place.city as place_city',
        // 'place.state as place_state',
        // 'place.country as place_country',
        // knex.raw('distinct user.username as username')
        knex.raw('count(review.review_id) as review_count'),
        // 'review.review_text as review_text',
        // 'review.title as review_title',
        'user.first_name as first_name',
        'user.last_name as last_name',
        'user.username as username'
      )
  );
};
const getUserProfileData = (user_id) => {
  return knex('user')
    .where('user.user_id', user_id)
    .innerJoin('review', 'user.user_id', 'review.user_id')
    .innerJoin('place', 'review.place_id', 'place.place_id')
    .select(
      'user.first_name as first_name',
      'user.last_name as last_name',
      'user.username as username',
      'user.email as email',
      'user.city as user_city',
      'user.state as user_state',
      'user.country as user_country',
      'user.last_login_time as last_login',
      'review.review_id as review_id',
      'review.title as review_title',
      'review.review_text as review_text',
      'place.title as place_title',
      'place.category as place_category',
      'place.city as place_city',
      'place.state as place_state',
      'place.country as place_country'
    );
};
const getReviewIds = () => {
  return knex('review').select('review_id as review_id');
};
const getThingsToDo = () => {
  return knex('place').select('*').where({ category: 'things to do' });
};
const findPlaceById = (place_id) => {
  return knex('place')
    .select('*')
    .where('place_id', place_id)
    .then((results) => _.first(results));
};
const findPlacesByCategory = (category) => {
  return knex('place').select('*').where('category', category);
};
const findPlacesByTitle = (title) => {
  return knex('place')
    .select('*')
    .where('title', title)
    .then((results) => (results && results.length > 0 ? results : null));
};
const insertPlace = (place) => {
  return knex('place').insert({
    title: place.title,
    category: place.category,
    city: place.city,
    state: place.state,
    country: place.country,
    image: place.image,
  });
};
const insertUser = (user) => {
  return knex('user').insert({
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    city: user.city,
    state: user.state,
    country: user.country,
  });
};
const insertReview = (review) => {
  const hotItem = knex('review').insert({
    user_id: review.user_id,
    place_id: review.place_id,
    title: review.title,
    review_text: review.review_text,
  });
  debug(`${hotItem.length}`);
  return hotItem;
};
const getUserByUserId = (user_id) => {
  return knex('user').select('*').where('user_id', user_id).first();
};
const getUserByUsername = (username) => {
  return knex('user').select('*').where('username', username).first();
};
const getUserByEmail = (email) => {
  return knex('user').select().where('email', email).first();
};
// const getAllReviews = () => {
//   return knex('review').select('*');
// };
const getAllUsers = () => {
  return knex('user').select('*');
};
const updateUser = (user) => {
  return knex('user').where('user_id', user.user_id).update({
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    city: user.city,
    state: user.state,
    country: user.country,
  });
};
const updatePlace = (place) => {
  return knex('place').where('place_id', place.place_id).update({
    title: place.title,
    category: place.category,
    city: place.city,
    state: place.state,
    country: place.country,
    image: place.image,
  });
};
const deletePlace = (place) => {
  return knex('place').where('place_id', place.place_id).delete();
};
const deleteUser = (user) => {
  return knex('user').where('user_id', user.user_id).delete();
};
const deleteReview = (review) => {
  return knex('review').where('review_id', review.review_id).delete();
};
const findReviewsByReviewId = (id) => {
  return knex('review').where('review_id', id).first();
};
const updateReview = (review) => {
  return knex('review').where('review_id', review.review_id).where('user_id', review.user_id).update({
    title: review.title,
    review_text: review.review_text,
  });
};
const findReviewsBySingleUser = (user_id) => {
  return knex('review').where('user_id', review.user_id);
};
const getReviewsForUser = (user_id) => {
  return knex('review')
    .innerJoin('place', 'review.place_id', 'place.place_id')
    .where('review.user_id', user_id)
    .select('place.title as place_title', 'review.title as review_title', 'review.review_text as review_text');
};
const getUserPlaceReviewInfoForSingleReviewView = (review_id) => {
  return knex('user')
    .innerJoin('review', 'user.user_id', 'review.user_id')
    .innerJoin('place', 'review.place_id', 'place.place_id')
    .where('review.review_id', review_id)
    .select(
      'place.title as place_name',
      'place.category as category',
      'place.city as place_city',
      'place.state as place_state',
      'place.country as place_country',
      'review.title as headline',
      'review.review_text as review_text',
      'review.review_id as review_id',
      'user.first_name as first_name',
      'user.last_name',
      'user.city as user_city',
      'user.state as user_state',
      'user.country as user_country',
      'user.email as email'
    )
    .first();
};
const getAllReviews = (review_id) => {
  return knex('user')
    .innerJoin('review', 'user.user_id', 'review.user_id')
    .innerJoin('place', 'review.place_id', 'place.place_id')
    .select(
      'review.review_id as review_id',
      'place.title as place_name',
      'place.city as place_city',
      'place.state as place_state',
      'place.country as place_country',
      'place.category as category',
      'review.title as headline',
      'user.email as user_email'
    );
};
const updateEmailVerified = (user_id, verified) => {
  return knex('user').update('is_email_verified', verified).where('user_id', user_id);
};
const updateLastLogin = (user_id, last_login_time) => {
  return knex('user')
    .update('last_login_time', moment(last_login_time).format('YYYY-MM-DDTHH:mm:ss'))
    .where('user_id', user_id);
};

module.exports = {
  knex,
  updatePasswordHash,
  insertPlace,
  insertReview,
  insertUser,
  updateEmailVerified,
  deletePlace,
  deleteReview,
  deleteUser,
  findPlaceById,
  findPlacesByCategory,
  findPlacesByTitle,
  findReviewsByReviewId,
  findReviewsBySingleUser,
  updatePlace,
  updateReview,
  updateLastLogin,
  updateUser,
  getUserByUserId,
  getUserByUsername,
  getUserByEmail,
  getAllPlaces,
  getAllReviews,
  getAllUsers,
  getReviewsForUser,
  getThingsToDo,
  getUserPlaceReviewInfoForSingleReviewView,
  getReviewIds,
  getAllReviewsPlacesUsers,
  getUserProfileData,
  getAllPlaces,
  registerUser,
};
