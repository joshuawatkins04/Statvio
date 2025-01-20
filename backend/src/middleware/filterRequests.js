const logger = require("../config/logger");

const botFilter = (req, res, next) => {
  try {
    if (!req.method || !req.originalUrl) {
      logger.warn("[botFilter] Blocked malformed request: missing method or originalUrl.", {
        method: req.method,
        url: req.originalUrl,
      });
      return res.status(400).json({ message: "Malformed request" });
    }

    const userAgent = req.headers?.["user-agent"] || "";
    const scannedBy = req.headers?.["x-scanned-by"] || "";

    const allowedBots = ["Googlebot", "Bingbot", "DuckDuckBot", "BaiduSpider", "YandexBot"];

    const isBlockedScanner =
      scannedBy.includes("RecordedFuture") ||
      (!allowedBots.some((bot) => userAgent.includes(bot)) && userAgent.toLowerCase().includes("bot"));

    if (isBlockedScanner) {
      logger.warn("[botFilter] Blocked scanner or bot request.", {
        userAgent,
        scannedBy,
      });
      return res.status(403).json({ message: "Forbidden: Bot traffic detected" });
    }

    next();
  } catch (error) {
    logger.error("[botFilter] Unexpected error occurred while processing request.", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

module.exports = botFilter;
