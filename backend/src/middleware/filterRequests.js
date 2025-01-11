const botFilter = (req, res, next) => {
  try {
    if (!req.method || !req.originalUrl) {
      console.warn("Blocked Malformed Request: Missing method or originalUrl");
      return res.status(400).json({ message: "Malformed request" });
    }

    const userAgent = req.headers?.["user-agent"] || "";
    const scannedBy = req.headers?.["x-scanned-by"] || "";

    if (scannedBy.includes("RecordedFuture") || userAgent.toLowerCase().includes("bot")) {
      console.warn(`Blocked Scanner/Bot Request: ${scannedBy || userAgent}`);
      return res.status(403).json({ message: "Forbidden: Bot traffic detected" });
    }

    next();
  } catch (error) {
    console.error("[BotFilter] Unexpected Error:", error);
    next(error);
  }
};

module.exports = botFilter;
