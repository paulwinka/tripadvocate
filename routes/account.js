const { request } = require('express');
const express = require('express');
const config = require('config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const db = require('../db');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const sendgrid = require('../sendgrid');
const debug = require('debug')('app:routes:account');
const { MongoClient, ObjectID } = require('mongodb');
const { last } = require('lodash');
let _database = null;

// creating instance of router.
const router = express.Router();
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

router.get('/login', (req, res) => {
  const active = {};
  const login = 'login';
  active[login] = true;
  res.render('account/login', { title: 'Login', active });
});

router.get('/register', (req, res) => {
  const active = {};
  const register = 'register';
  active[register] = true;
  res.render('account/register', { title: 'Register Account', active });
});
router.get('/verify_email/', auth, async (req, res, next) => {
  try {
    await sendgrid.sendVerifyEmail(req.user);
    debug(`req.user is ${req.user.user_id}`);
    res.render('account/verify_email', {
      title: 'Verify Email',
      verified: false,
      auth: req.user,
    });
  } catch (err) {
    next(err);
  }
});
router.get('/verify_email/:token', async (req, res, next) => {
  try {
    const token = req.params.token;
    const secret = config.get('sendgrid.secret');
    const payload = jwt.verify(token, secret);
    debug('verify email', payload);
    if (payload.type != 'verify_email') {
      throw new Error('invalid token type');
    }
    const verified = await db.updateEmailVerified(payload.email, true);
    debug(verified);
    res.render('account/verify_email', {
      title: 'Email Verified',
      verified: true,
      tokenPayload: payload,
      auth: req.user,
    });
  } catch (err) {
    next(err);
  }
});
router.get('/reset_password/', (req, res) => {
  return res.render('account/reset_password', { title: 'Reset Password' });
});
router.post('/login', async (req, res, next) => {
  try {
    const username = req.body.username;
    debug(`username ${username}`);
    const password = req.body.password;
    debug(`login ${username}" "${password}"`);

    let user = null;
    let error = null;
    if (!username) {
      error = 'username is required';
    } else if (!password) {
      error = 'password is required';
    } else {
      user = await db.getUserByUsername(username);
      debug(user);
      if (!user) {
        user = await db.getUserByEmail(username);
      }
      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        error = 'credentials invalid';
      } else {
        error = null;
      }
    }
    if (error) {
      res.render('account/login', {
        title: 'Login',
        username: username,
        error: error,
      });
    } else {
      const payload = {
        _id: user._id,
        role: user.role,
        username: user.username,
        email: user.email,
      };
      const secret = config.get('auth.secret');
      const token = jwt.sign(payload, secret, { expiresIn: '1h' });
      res.cookie('auth_token', token, { maxAge: 60 * 60 * 1000 });
      debug(user);
      await db.updateLastLogin(user._id);
      res.redirect('/account/me');
    }
  } catch (err) {
    next(err);
  }
});

router.post('/register', async (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const password_confirm = req.body.password_confirm;
  const emailRegExp = /^([A-Za-z0-9_.+succ-])+\@[A-Za-z0-9_+-]+[\.]{1}[A-Za-z0-9]+$/;
  debug(`username = ${username}, email = ${email}, password = ${password}, passwordConfirm = ${password_confirm}`);
  const renderData = {
    title: 'Register Account',
    username,
    email,
    password,
    password_confirm,
    // usernameError,
    isPost: true,
    passwordsMatch: false,
    isValid: true,
  };
  try {
    if (!username) {
      renderData.isValid = false;
      renderData.usernameErrorBlank = 'username is required';
    }
    if (await db.getUserByUsername(username)) {
      renderData.isValid = false;
      renderData.usernameErrorNotUnique = 'username is already taken, try another.';
    }
    if (!email) {
      renderData.isValid = false;
      renderData.emailErrorBlank = 'email is required';
    } else if (await db.getUserByEmail(email)) {
      renderData.isValid = false;
      renderData.emailTakenError = 'choose another email address';
    } else if (!emailRegExp.test(email)) {
      renderData.isValid = false;
      renderData.emailFormatError = 'email is invalid format.';
    } else {
    }
    debug(`emailFormatError is ${renderData.emailFormatError}`);
    debug(`username ${username}`);
    debug(`username = ${username}, email = ${email}, password = ${password}, passwordConfirm = ${password_confirm}`);
    if (!password) {
      renderData.isValid = false;
      renderData.passwordError = 'Password missing.';
    } else if (password.length < 8) {
      renderData.isValid = false;
      renderData.passwordError = 'password not long enough';
    } else if (password != password_confirm) {
      renderData.isValid = false;
      renderData.password_confirmError = 'Passwords must match.';
    } else {
    }
    debug(`data.usernameError = ${renderData.usernameError}`);
    debug(`data.isValid = ${renderData.isValid}`);
    if (!renderData.isValid) {
      res.render('account/register', renderData);
    } else {
      const saltRounds = 10;
      // user.registration_time = moment();
      let user = {};
      user.username = username;
      user.email = email;
      user.password = password;
      user.role = 'member';
      // user.registration_time = moment().format('YYYY-MM-DDTHH:mm:ss');
      // user.last_login_time = user.registration_time;
      user.password_hash = await bcrypt.hash(user.password, saltRounds);
      debug(`user.password_hash is ${user.password_hash}`);
      // const result = await db.registerUser(user);
      // ACTUAL DATABASE ENTRY
      await db.registerUser(user);

      const payload = {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      };
      const secret = config.get('auth.secret');
      const token = jwt.sign(payload, secret, { expiresIn: '1h' });
      res.cookie('auth_token', token, { maxAge: 5 * 24 * 60 * 60 * 1000 });
      await sendgrid.sendVerifyEmail(user);
      const registeredUser = await db.getUserById(payload._id);

      renderData.title = 'Success, verify email';
      renderData.registration_time = new Date();
      renderData.user = payload;
      res.render('account/registration-success', renderData);

      // await res.render('account/registration-success', {
      //   title: 'Success, verify email',
      //   verified: false,
      //   result,
      //   auth: req.user,
      //   user: user,
      // });
    }
  } catch (err) {
    renderData.catchError = err.toString();
    debug(err.stack);
    // debug(`data.error: ${data.error}`);
    // debug(`data is ${data}`);
    res.status(500).render('account/register', renderData);
  }
});
router.get('/reset_password/', (req, res) => {
  return res.render('account/reset_password', { title: 'Reset Password' });
});
router.post('/reset_password/', async (req, res, next) => {
  try {
    const email = req.body.email;
    if (!email) {
      return res.status(400).render('account/reset_password', {
        title: 'Reset Password',
        error: 'Email is required!',
      });
    }

    debug(`reset password "${email}"`);
    const user = await db.getUserByEmail(email);
    if (user) {
      await sendgrid.sendResetPassword(user);
    }

    res.render('account/reset_password', {
      title: 'Reset Password',
      emailSent: true,
    });
  } catch (err) {
    next(err);
  }
});
router.get('/reset_password/:token', async (req, res, next) => {
  try {
    const token = req.params.token;
    const secret = config.get('sendgrid.secret');
    const payload = jwt.verify(token, secret);
    debug('reset password', payload);
    if (payload.type != 'reset_password') {
      throw new Error('invalid token type');
    }
    res.render('account/reset_password', {
      title: 'Reset Password',
      emailReceived: true,
      tokenPayload: payload,
    });
  } catch (err) {
    next(err);
  }
});
router.post('/reset_password/:token', async (req, res, next) => {
  try {
    const token = req.params.token;
    const secret = config.get('sendgrid.secret');
    const payload = jwt.verify(token, secret);
    debug('reset password', payload);
    if (payload.type != 'reset_password') {
      throw new Error('invalid token type');
    }

    const newPassword = req.body.new_password;
    const confirmPassword = req.body.confirm_password;
    if (!newPassword || !confirmPassword || newPassword != confirmPassword) {
      return res.status(400).render('account/reset_password', {
        title: 'Reset Password',
        emailReceived: true,
        tokenPayload: payload,
        error: 'Passwords must match!',
      });
    }

    // const password_hash = await bcrypt.hash(newPassword, config.get('auth.saltRounds'));
    const password_hash = await bcrypt.hash(newPassword, 10);
    debug('future games');
    debug(password_hash);
    debug(payload.email);
    debug('future games');
    await db.updatePasswordHash(payload.email, password_hash);

    res.render('account/reset_password', {
      title: 'Reset Password',
      passwordChanged: true,
      tokenPayload: payload,
    });
  } catch (err) {
    next(err);
  }
});
router.get('/me', auth, async (req, res) => {
  const user = req.user;
  // const profileItems = await db.getUserProfileData(user.user_id);
  const profileItems = null;
  const active = {};
  const profile = 'profile';
  active[profile] = true;
  res.render('account/profile', { title: 'Profile!', user: user, profileItems, active });
});

router.get('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.redirect('/account/login');
});
module.exports = router;
