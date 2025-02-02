const logger = require("../config/logger");

const BAN_DURATION = 24 * 60 * 60 * 1000;
const SUSPICIOUS_WINDOW = 5 * 60 * 1000;
const SUSPICIOUS_THRESHOLD = 3;
let totalBanCount = 0;

const bannedIps = new Map();
const suspiciousRequests = new Map();

const allowedPaths = ["/", "/api", "/favicon.ico", "/robots.txt", "/manifest.json", "/static", "/assets"];

function isPathAllowed(path) {
  return allowedPaths.some((allowed) => path.startsWith(allowed));
}

function getBannedIpCount() {
  return bannedIps.size;
}

function ipBanMiddleware(req, res, next) {
  const ip = req.ip;
  const path = req.path;
  const now = Date.now();

  if (bannedIps.has(ip)) {
    const banExpiration = bannedIps.get(ip);
    if (now < banExpiration) {
      logger.warn("Blocked request from banned IP", { ip, path, banExpiration });
      return res.status(403).json({ error: "Forbidden" });
    } else {
      bannedIps.delete(ip);
    }
  }

  if (!isPathAllowed(path)) {
    let timestamps = suspiciousRequests.get(ip) || [];
    timestamps = timestamps.filter((ts) => now - ts < SUSPICIOUS_WINDOW);
    timestamps.push(now);
    suspiciousRequests.set(ip, timestamps);

    logger.info("Suspicious request detected", { ip, path, count: timestamps.length });

    if (timestamps.length >= SUSPICIOUS_THRESHOLD) {
      bannedIps.set(ip, now + BAN_DURATION);
      suspiciousRequests.delete(ip);
      logger.warn("Banning IP for repeated suspicious requests", { ip, path, timestamps });
      totalBanCount++;
      logger.info(`Total ban count: ${totalBanCount}. Current number of banned IPs: ${getBannedIpCount()}`);
      return res.status(403).json({ error: "Forbidden" });
    }
  } else {
    if (suspiciousRequests.has(ip)) {
      const recentTimestamps = suspiciousRequests.get(ip).filter((ts) => now - ts < SUSPICIOUS_WINDOW);
      if (recentTimestamps.length === 0) {
        suspiciousRequests.delete(ip);
      } else {
        suspiciousRequests.set(ip, recentTimestamps);
      }
    }
  }

  next();
}

module.exports = ipBanMiddleware;
