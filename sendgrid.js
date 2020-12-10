const debug = require('debug')('app:sendgrid');
const config = require('config');
const sgMail = require('@sendgrid/mail');
const jwt = require('jsonwebtoken');

sgMail.setApiKey(config.get('sendgrid.apiKey'));

const sendEmail = async (to, subject, text, html, trackingEnabled = false) => {
  const msg = {
    from: config.get('sendgrid.from'),
    // redirect emails in development
    to: config.get('sendgrid.to') || to,
    subject: subject,
    text: text,
    html: html,
    trackingSettings: {
      clickTracking: { enable: trackingEnabled },
      openTracking: { enable: trackingEnabled },
      subscriptionTracking: { enable: trackingEnabled },
    },
  };
  const result = await sgMail.send(msg);
  debug(`${msg.subject} sent to ${msg.to}: ${result}`);
};

const sendEmailTemplate = async (to, templateId, data, trackingEnabled = false) => {
  const msg = {
    from: config.get('sendgrid.from'),
    to: config.get('sendgrid.to') || to,
    templateId: templateId,
    dynamicTemplateData: data,
    trackingSettings: {
      clickTracking: { enable: trackingEnabled },
      openTracking: { enable: trackingEnabled },
      subscriptionTracking: { enable: trackingEnabled },
    },
  };
  const result = await sgMail.send(msg);
  debug(`${msg.subject} sent to ${msg.to}: ${result}`);
};

const sendVerifyEmail = async (user) => {
  const payload = {
    user_id: user.user_id,
    email: user.email,
    type: 'verify_email',
  };
  const secret = config.get('sendgrid.secret');
  const token = jwt.sign(payload, secret, { expiresIn: '1h' });
  const msg = {
    from: config.get('sendgrid.from'),
    // to: config.get('sendgrid.to') || user.email,
    to: user.email,
    templateId: config.get('sendgrid.templates.verifyEmail'),
    dynamicTemplateData: { token: token, url: `http://localhost:3004/account/verify_email/${token}` },
    trackingSettings: {
      clickTracking: { enable: false },
      openTracking: { enable: false },
      subscriptionTracking: { enable: false },
    },
  };
  debug(msg);
  const result = await sgMail.send(msg);
  debug(`${msg.from} sent *to ${msg.to}: ${result}`);
};

const sendResetPassword = async (user) => {
  const payload = {
    user_id: user.user_id,
    email: user.email,
    type: 'reset_password',
  };
  const secret = config.get('sendgrid.secret');
  const token = jwt.sign(payload, secret, { expiresIn: '1h' });
  const msg = {
    from: config.get('sendgrid.from'),
    // to: config.get('sendgrid.to') || user.email,
    to: user.email,
    templateId: config.get('sendgrid.templates.resetPassword'),
    dynamicTemplateData: { token: token, url: `http://localhost:3004/account/reset_password/${token}` },
    trackingSettings: {
      clickTracking: { enable: false },
      openTracking: { enable: false },
      subscriptionTracking: { enable: false },
    },
  };
  const result = await sgMail.send(msg);
  debug(`${msg.subject} sent to ${msg.to}: ${result}`);
};

module.exports = { sendEmail, sendEmailTemplate, sendVerifyEmail, sendResetPassword };
