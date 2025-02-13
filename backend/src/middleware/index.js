const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const botFilter = require("./filterRequests");
const { globalLimiter } = require("./rateLimiter");
const ipBanMiddleware = require("./ipBan");
const logger = require("../config/logger");

const fs = require("fs");
const path = require("path");

const configureMiddleware = (app) => {
  app.use(helmet());

  // app.use(ipBanMiddleware);

  const allowedOrigins = [
    // "http://localhost:5173",
    "https://www.statvio.com",
    "https://statvio.com",
    "https://statvio-9z2djbr1t-joshuas-projects-8e2156bf.vercel.app",
  ];

  app.use((req, res, next) => {
    cors({
      origin: (origin, callback) => {
        if (!origin && process.env.NODE_ENV === "development") {
          logger.info("[CORS] No origin detected. Allowing request in development mode.", {
            method: req.method,
            path: req.originalUrl,
            userAgent: req.headers["user-agent"] || "Unknown",
            ip: req.ip,
          });
          return callback(null, true);
        }
        if (!origin) {
          if (req.originalUrl.startsWith("/api")) {
            logger.info("[CORS] No origin detected, but allowing internal API request.", {
              method: req.method,
              path: req.originalUrl,
              userAgent: req.headers["user-agent"] || "Unknown",
              ip: req.ip,
            });
            return callback(null, true);
          }
          logger.warn("[CORS] No origin detected. Blocking request in production.", {
            method: req.method,
            path: req.originalUrl,
            userAgent: req.headers["user-agent"] || "Unknown",
            ip: req.ip,
          });
          return res.status(403).json({ message: "Not allowed by CORS" });
        }

        if (allowedOrigins.includes(origin)) {
          logger.debug("[CORS] Origin allowed.", { origin });
          return callback(null, true);
        } else {
          logger.warn("[CORS] Origin blocked by CORS.", { origin });
          return res.status(403).json({ message: "Not allowed by CORS" });
        }
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "withCredentials"],
      credentials: true,
    })(req, res, next);
  });

  /*app.use((req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - start;
      const logEntry = `${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${
        res.statusCode
      } - ${duration}ms\n`;

      fs.appendFileSync(path.join(__dirname, "../logs/api_logs.txt"), logEntry);
    });

    next();
  });*/

  // app.use(botFilter);

  app.options("*", (req, res) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, withCredentials");
    res.header("Access-Control-Allow-Credentials", "true");
    logger.info("[OPTIONS] Preflight request handled.");
    res.sendStatus(200);
  });

  app.set("trust proxy", true);

  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));

  app.use(globalLimiter);

  logger.info("[Middleware] Middleware configuration completed.");
};

module.exports = { configureMiddleware };
