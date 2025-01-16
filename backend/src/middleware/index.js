const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const botFilter = require("./filterRequests");
const { globalLimiter } = require("./rateLimiter");

const configureMiddleware = (app) => {
  app.use(helmet());

  const allowedOrigins = ["http://localhost:5173", "https://www.statvio.com", "https://statvio.com"];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          console.log("No origin detected. Allowing request.");
          return callback(null, true);
        }

        if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
          console.log(`Origin ${origin} allowed.`);
          return callback(null, true);
        } else {
          console.log(`Origin ${origin} blocked by CORS.`);
          return callback(new Error("Not allowed by CORS"));
        }
      },
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
