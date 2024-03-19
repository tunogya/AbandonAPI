const { managementClient } = require("../config/auth0Client")

const deleteAuth0User = async (id) => {
  await managementClient.users.delete({
    id: id
  })
}

module.exports = {deleteAuth0User}