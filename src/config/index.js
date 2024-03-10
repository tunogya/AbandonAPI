const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  auth0: {
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    domain: process.env.AUTH0_DOMAIN,
  },
  mongodb: {
    uri: process.env.MONGODB_URI
  },
  stripe: {
    secret: process.env.STRIPE_SECRET_KEY
  },
}
