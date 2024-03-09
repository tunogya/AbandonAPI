const serverless = require("serverless-http");
const express = require("express");
const {auth} = require("express-oauth2-jwt-bearer");
const cors = require("cors");
const helmet = require('helmet');
const compression = require('compression');
const config = require('./config');

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
    message: "Hello from root!",
  });
});

app.get('/status', (req, res) => {
  res.status(200).end();
});
app.head('/status', (req, res) => {
  res.status(200).end();
});

app.get('/balance', (req, res) => {
  const auth = req.auth;
  auth.header; // The decoded JWT header.
  auth.payload; // The decoded JWT payload.
  auth.token; // The raw JWT token.
  return res.status(200).json({
    message: "Hello from balance!",
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

module.exports.handler = serverless(app);
