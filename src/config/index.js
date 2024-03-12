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
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    urlScheme: process.env.STRIPE_URL_SCHEME,
    merchantId: process.env.STRIPE_MERCHANT_ID,
  },
}
