const serverless = require("serverless-http");
const express = require("express");
const { auth } = require('express-oauth2-jwt-bearer');
const app = express();

const jwtCheck = auth({
  audience: 'https://api.abandon.ai',
  issuerBaseURL: 'https://abandon.jp.auth0.com/',
  tokenSigningAlg: 'RS256'
});

app.use(jwtCheck);

app.get("/", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from root!",
  });
});

app.get("/path", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from path!",
  });
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
