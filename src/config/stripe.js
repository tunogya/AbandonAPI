const config = require('./index');

const stripe = require("stripe")(config.stripe.secret, {
  apiVersion: '2022-08-01',
});

module.exports = stripe;