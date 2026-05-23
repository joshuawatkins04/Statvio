const rateLimit = require("express-rate-limit");
const logger = require("../config/logger");

const rateLimitMessage = (req, res) => {
  logger.warn("[RateLimiter] Too many requests detected.", {
    ip: req.ip,
    path: req.path,
  });
  res.status(429).json({ message: "Too many requests, please try again later." });
};

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  skip: (req) => {
    const excludedPaths = ["/login", "/signup", "/verify"];
    return excludedPaths.includes(req.path) || req.method === "OPTIONS";
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitMessage,
});

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  skip: (req) => req.method === "OPTIONS",
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitMessage,
});

const verifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 5 minutes
  max: 10,
  skip: (req) => req.method === "OPTIONS",
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitMessage,
});

module.exports = { globalLimiter, authLimiter, verifyLimiter };
