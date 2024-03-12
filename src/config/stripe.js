const config = require('./index');

const stripe = require("stripe")(config.stripe.secretKey, {
  apiVersion: '2023-10-16',
});

module.exports = stripe;