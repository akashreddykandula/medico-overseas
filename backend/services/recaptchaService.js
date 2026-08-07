const axios = require('axios');

const verifyRecaptcha = async (token) => {
  if (!process.env.RECAPTCHA_SECRET_KEY) return true; // allow through in dev if not configured
  if (!token) return false;

  const { data } = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
    params: { secret: process.env.RECAPTCHA_SECRET_KEY, response: token },
  });

  return data.success && (data.score === undefined || data.score >= 0.5);
};

module.exports = { verifyRecaptcha };
