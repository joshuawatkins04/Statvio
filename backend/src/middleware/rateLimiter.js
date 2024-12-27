const rateLimit = require("express-rate-limit");

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  skip: (req) => {
    const excludedPaths = ["/login", "/signup", "/verify"];
    return excludedPaths.includes(req.path) || req.method === "OPTIONS";
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, try again later.",
});

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  skip: (req) => req.method === "OPTIONS",
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, try again later.",
});

const verifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 5 minutes
  max: 10,
  skip: (req) => req.method === "OPTIONS",
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many verification requests, please try again.",
});

module.exports = { globalLimiter, authLimiter, verifyLimiter };