const { UserInfoClient } = require("auth0");
const config = require('./index');

const userInfoClient = new UserInfoClient({
  domain: config.auth0.domain,
})

module.exports = userInfoClient