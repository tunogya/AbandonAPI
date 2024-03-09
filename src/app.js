const serverless = require("serverless-http");
const express = require("express");
const {auth} = require("express-oauth2-jwt-bearer");
const cors = require("cors");
const helmet = require('helmet');
const compression = require('compression')

const app = express();

const jwtCheck = auth({
  audience: 'https://api.abandon.ai',
  issuerBaseURL: 'https://abandon.jp.auth0.com/',
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

app.get('/status', (req, res) => { res.status(200).end(); });
app.head('/status', (req, res) => { res.status(200).end(); });

app.get('/balance', (req, res) => {
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
