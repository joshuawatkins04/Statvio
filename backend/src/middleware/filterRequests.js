const botFilter = (req, res, next) => {
  const userAgent = req.headers["user-agent"] || "";
  const scannedBy = req.headers["x-scanned-by"] || "";

  if (scannedBy.includes("RecordedFuture") || userAgent.includes("bot")) {
    console.warn(`Blocked Scanner Request: ${scannedBy || userAgent}`);
    return res.status(403).send("Forbidden");
  }

  if (!req.method || !req.originalUrl) {
    console.warn("Blocked Malformed Request: Missing method or originalUrl");
    return res.status(400).send("Malformed request");
  }

  next();
};

module.exports = botFilter;
