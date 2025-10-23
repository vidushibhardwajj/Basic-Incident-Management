// sendSMS.js - simple Twilio SMS helper

require('dotenv').config();
const twilio = require('twilio');

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const DEFAULT_FROM = process.env.TWILIO_PHONE_NUMBER;

let client = null;
if (ACCOUNT_SID && AUTH_TOKEN) {
  client = twilio(ACCOUNT_SID, AUTH_TOKEN);
} else {
  // Do not throw at require time — allow app to run if Twilio is not configured.
  console.warn('Twilio not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to enable SMS sending.');
}

/**
 * Send an SMS using Twilio.
 * @param {Object} opts
 * @param {string} opts.to - destination E.164 phone number (e.g. "+15551234567")
 * @param {string} opts.body - message text
 * @param {string} [opts.from] - optional from number (overrides TWILIO_PHONE_NUMBER)
 * @returns {Promise<Object>} Twilio message resource or { skipped: true } when Twilio not configured
 */
async function sendSMS({ to, body, from } = {}) {
  if (!client) {
    console.warn('Skipping SMS send: Twilio client not configured.');
    return Promise.resolve({ skipped: true });
  }

  if (!to || typeof to !== 'string') {
    throw new TypeError('Invalid "to" phone number');
  }
  if (!body || typeof body !== 'string') {
    throw new TypeError('Invalid "body" for SMS');
  }

  const fromNumber = from || DEFAULT_FROM;
  if (!fromNumber) {
    throw new Error('No "from" phone number configured; set TWILIO_PHONE_NUMBER or pass from option');
  }

  try {
    const msg = await client.messages.create({
      to,
      from: fromNumber,
      body
    });
    return msg;
  } catch (err) {
    err.message = `Failed to send SMS: ${err.message}`;
    throw err;
  }
}

module.exports = { sendSMS };