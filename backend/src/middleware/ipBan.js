const logger = require("../config/logger");

const bannedIps = new Map();
const BAN_DURATION = 24 * 60 * 60 * 1000;

function getBannedIpCount() {
  return bannedIps.size;
}

function ipBanMiddleware(req, res, next) {
  const ip = req.ip;
  const path = req.path;

  const banExpiration = bannedIps.get(ip);
  if (banExpiration > Date.now()) {
    logger.warn("Blocked request from banned IP", { ip, path });
    return res.status(403).json({ error: "Forbidden" });
  } else {
    bannedIps.delete(ip);
  }

  if (!path.startsWith("/api")) {
    bannedIps.set(ip, Date.now() + BAN_DURATION);
    logger.warn("Banning IP for suspicious path", { ip, path: req.originalUrl });
    logger.info(`Number of banned IPs: ${getBannedIpCount()}`);
    return res.status(403).json({ error: "Forbidden" });
  }

  next();
}

module.exports = ipBanMiddleware;