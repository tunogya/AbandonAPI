const { UserInfoClient, ManagementClient} = require("auth0");
const config = require('./index');

const userInfoClient = new UserInfoClient({
  domain: config.auth0.domain,
})

const managementClient = new ManagementClient({
  domain: config.auth0.domain,
  clientId: config.auth0.clientId,
  clientSecret: config.auth0.clientSecret,
})

module.exports = {userInfoClient, managementClient}