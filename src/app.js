const serverless = require("serverless-http");
const express = require("express");
const {auth} = require("express-oauth2-jwt-bearer");
const cors = require("cors");
const helmet = require('helmet');
const compression = require('compression');
const config = require('./config');
const getCustomerByReq = require("./services/getCustomerByReq");
const stripe = require("./config/stripe");
const {getSuspenseDataBy1D} = require("./services/getSuspenseData");
const {Redis} = require("@upstash/redis");
const {deleteAuth0User} = require("./services/deleteAuth0User");
const mongodb = require("./config/mongodb");

const app = express();

const redis = Redis.fromEnv();

const jwtCheck = auth({
  audience: config.auth0.audience,
  issuerBaseURL: config.auth0.issuerBaseURL,
  tokenSigningAlg: 'RS256'
});

app.use(jwtCheck);
app.use(cors());
app.use(helmet());
app.use(compression());

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
  const customer = await getCustomerByReq(req);
  if (!customer?.id) {
    return res.status(404).json({
      error: "Not Found",
    })
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

app.get('/balance_transactions', async (req, res) => {
  const limit = req.query.limit || 100;
  const starting_after = req.query.starting_after || undefined;
  const ending_before = req.query.ending_before || undefined;
  
  const customer = await getCustomerByReq(req);
  if (!customer?.id) {
    return res.status(404).json({
      error: "Not Found",
    })
  }
  
  const balanceTransactions = await stripe.customers.listBalanceTransactions(customer.id,{
    limit: limit,
    starting_after: starting_after,
    ending_before: ending_before,
  });
  
  return res.status(200).json({
    object: balanceTransactions.object,
    has_more: balanceTransactions.has_more,
    data: balanceTransactions.data.map((item) => ({
      id: item.id,
      object: 'balance_transaction',
      amount: item.amount * -1,
      created: item.created,
      currency: item.currency === 'usd' ? 'aai' : item.currency,
      description: item.description,
      ending_balance: item?.ending_balance ? item.ending_balance * -1 : 0,
      metadata: item?.metadata || {},
    })),
  });
})

app.get('/suspense', async (req, res) => {
  let _6ago = new Date();
  _6ago.setDate(_6ago.getDate() - 6);
  
  const from = req.query.from ? new Date(req.query.from) : _6ago;
  const to = req.query.to ? new Date(req.query.to) : new Date();
  const resolution = req.query.resolution || "1D";
  
  const customer = await getCustomerByReq(req);
  
  if (!customer?.id) {
    return res.status(404).json({
      error: "Not Found",
    })
  }
  
  if (resolution === '1D') {
    const data = await getSuspenseDataBy1D(customer.id, from, to);
    return res.status(200).json(data)
  } else {
    return res.status(404).json([])
  }
})

app.post('/payment-sheet', async (req, res) => {
  const amount = req.body.amount;
  const currency = req.body.currency;
  const customer = await getCustomerByReq(req);
  if (!customer?.id) {
    return res.status(404).json({
      error: "Not Found",
    })
  }
  const ephemeralKey = await stripe.ephemeralKeys.create(
      {customer: customer.id},
      {apiVersion: '2023-10-16'}
  );
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: currency,
    customer: customer.id,
  });
  res.json({
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
    publishableKey: config.stripe.publishableKey,
  });
})

app.delete('/unregister', async (req, res) => {
  const customer = await getCustomerByReq(req);
  const auth = req.auth;
  const sub = auth.payload.sub;
  
  await deleteAuth0User(sub);
  if (customer.id) {
    await stripe.customers.del(customer.id);
  }
  await redis.del(`subToCid:${sub}`);
  return res.status(200).end();
})

app.post('/app/config', async (req, res) => {
  const auth = req.auth;
  const sub = auth.payload.sub;
  const config = req.body.config;
  
  await mongodb.db('core').collection('app_config').updateOne(
    {
      sub: sub,
    },
    {
      $set: {
        config: config,
      },
    },
    {
      upsert: true,
    }
  )
  
  return res.status(200).end();
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
