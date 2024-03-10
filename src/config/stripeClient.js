const config = require('./index');

const stripeClient = require("stripe")(config.stripe.secret, {
  apiVersion: '2022-08-01',
});

module.exports = stripeClient;