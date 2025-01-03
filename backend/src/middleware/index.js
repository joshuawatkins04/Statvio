const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const { globalLimiter } = require("./rateLimiter");

const configureMiddleware = (app) => {
  app.use(helmet());

  app.use(
    cors({
      origin: ["http://localhost:5173", "http://3.107.192.136", "https://statvio.com"],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));

  app.use(globalLimiter);
  app.options("*", (res) => {
    res.sendStatus(200);
  });
};

module.exports = { configureMiddleware };
