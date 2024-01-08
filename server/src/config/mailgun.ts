import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);
export const mailgunClient = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API as string,
  url: 'https://api.eu.mailgun.net', // NOTE: needed for EU region!
});
