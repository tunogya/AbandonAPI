const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  auth0: {
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  }
}
