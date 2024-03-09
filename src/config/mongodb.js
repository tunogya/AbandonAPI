const {MongoClient, ServerApiVersion} = require("mongodb");
const config = require('./index');

const client = new MongoClient(config.mongodb.uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    }
);

module.exports = client