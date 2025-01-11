const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const botFilter = require("./filterRequests");
const { globalLimiter } = require("./rateLimiter");

const configureMiddleware = (app) => {
  app.use(helmet());

  app.use(
    cors({
      origin: (origin, callback) => {
        const allowedOrigins = ["https://www.statvio.com", "https://statvio.com"];
        if (origin && (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app"))) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      }, // "http://localhost:5173"
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "withCredentials"],
      credentials: true,
    })
  );

  app.use(botFilter);

  app.options("*", (req, res) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, withCredentials");
    res.header("Access-Control-Allow-Credentials", "true");
    res.sendStatus(200);
  });

  app.set("trust proxy", true);

  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));

  app.use(globalLimiter);
};

module.exports = { configureMiddleware };
