const serverless = require("serverless-http");
const express = require("express");
const {auth} = require("express-oauth2-jwt-bearer");
const cors = require("cors");
const helmet = require('helmet');
const compression = require('compression');
const config = require('./config');
const userInfoClient = require('./config/userInfoClient');
const stripeClient = require('./config/stripeClient');
const {Redis} = require("@upstash/redis");

const redis = Redis.fromEnv();

const app = express();

const jwtCheck = auth({
  audience: config.auth0.audience,
  issuerBaseURL: config.auth0.issuerBaseURL,
  tokenSigningAlg: 'RS256'
});

app.use(jwtCheck);
app.use(cors());
app.use(helmet());
app.use(compression())

app.get("/", (req, res, next) => {
  return res.status(200).json({
    message: "Hello, This is Abandon API!",
  });
});

app.get('/status', (req, res) => {
  res.status(200).end();
});

app.head('/status', (req, res) => {
  res.status(200).end();
});

app.get('/balance', async (req, res) => {
  const auth = req.auth;
  const sub = auth.payload.sub;
  const token = auth.token;
  let customer;
  
  const cid = await redis.get(`subToCid:${sub}`);
  if (cid) {
    customer = await stripeClient.customers.retrieve(cid);
  } else {
    const {data} = await userInfoClient.getUserInfo(token)
    const email = data.email;
    const customers = await stripeClient.customers.list({
      email: email,
    });
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripeClient.customers.create({
        email: email,
        metadata: {
          id: sub,
        },
        balance: {
          amount: 0,
          currency: 'usd',
        }
      });
    }
    await redis.set(`subToCid:${sub}`, customer.id);
  }
  
  return res.status(200).json({
    object: "balance",
    available: [
      {
        amount: customer.balance * -1,
        currency: customer.currency === 'usd' ? 'aai' : customer.currency,
      },
    ],
    pending: [],
  });
})

app.get('/balance_transactions', (req, res) => {
  return res.status(200).json({
    message: "Hello from balance_transactions!",
  });
})

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(3000, () => {
    console.log(`Example app listening on port ${3000}`)
  })
}

module.exports.handler = serverless(app);
