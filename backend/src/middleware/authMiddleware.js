const jwt = require("jsonwebtoken");
const logger = require("../config/logger");

const authenticateToken = (req, res, next) => {
  let token = null;
  const authHeader = req.headers["authorization"];
  if (authHeader) {
    token = authHeader.split(" ")[1];
    logger.debug("[authenticateToken] Token extracted from Authorization header.");
  }
  if (!token && req.query.token) {
    token = req.query.token;
    logger.debug("[authenticateToken] Token fetched from query parameter.");
  }

  logger.debug(`[authenticateToken] Verifying token for route: ${req.method} ${req.originalUrl}`);
  logger.debug("[authenticateToken] Token received.", { token });

  if (!token) {
    logger.warn("[authenticateToken] No token found in the request.");
    return res.status(401).json({ message: "Unauthorized" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      logger.error("[authenticateToken] Token verification failed.", {
        error: error.message,
      });
      return res.status(403).json({ message: "Forbidden: Invalid or expired token" });
    }
    if (!decoded || !decoded.id) {
      logger.error("[authenticateToken] Token payload missing 'id'.", { decoded });
      return res.status(403).json({ message: "Forbidden: Invalid token payload" });
    }
    logger.info("[authenticateToken] Token verified successfully.", { userId: decoded.id });

    req.user = { id: decoded.id };
    next();
  });
};

module.exports = { authenticateToken };
