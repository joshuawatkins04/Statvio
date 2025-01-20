const logger = require("../config/logger");

const handleDuplicateKeyError = (error) => {
  const duplicateField = Object.keys(error.keyPattern || {})[0];
  return `${duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1)} already in use.`;
};

const errorHandler = (err, req, res, next) => {
  logger.debug("[Debug - errorHandler] err:", { error: err});
  logger.debug("[Debug - errorHandler] req:", req ? "Valid req object" : "Invalid req object");
  logger.debug("[Debug - errorHandler] res:", res ? "Valid res object" : "Invalid res object");
  logger.debug("[Debug - errorHandler] next:", next ? "Valid next function" : "Invalid next function");

  if (!res || typeof res.status !== "function") {
    logger.error("[Global - errorHandler] Invalid Response Object Detected.");
    return;
  }

  logger.error("[Global - errorHandler] ERROR:", { error: err });
  
  const route = req?.method && req?.originalUrl ? `${req.method} ${req.originalUrl}` : "unknown route";
  const userIp = req?.ip || req?.headers?.["x-forwarded-for"] || req?.connection?.remoteAddress || "unknown IP";
  const userId = req?.user?.id || "unknown user ID";
  const userEmail = req?.user?.email || "unknown user email";

  logger.error(`[Route]: ${route}`);
  logger.error(`[User IP]: ${userIp}`);

  if (req?.user) {
    logger.error(`[User ID]: ${userId}`);
    logger.error(`[User Email]: ${userEmail}`);
  }

  // Authentication error
  if (err.message === "Invalid email or password.") {
    logger.warn("[Global - errorHandler] Authentication failed.");
    return res.status(401).json({ message: err.message });
  }

  // Duplicate Key Error (MongoDB error code 11000)
  if (err.code === 11000) {
    logger.warn("[Global - errorHandler] Duplicate Key Error:", { error: err });
    return res.status(400).json({ message: handleDuplicateKeyError(err) });
  }

  // Validation Error (Mongoose ValidationError)
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    logger.warn("[Global - errorHandler] Validation Error:", { messages });
    return res.status(400).json({ message: messages.join(", ") });
  }

  // Handle Auth Error
  if (err.name === "UnauthorizedError") {
    logger.warn("[Global - errorHandler] Unauthorized Access.");
    return res.status(401).json({ message: "Unauthorized access." });
  }

  // Order Already Captured Error
  if (typeof err.message === "string" && err.message.includes("Order already captured")) {
    logger.warn("[Global - errorHandler] Order Already Captured:", { message: err.message });
    return res.status(200).json({ message: "Order already captured" });
  }

  // Default to 500 Server Error
  logger.error("[Global - errorHandler] Unhandled Error:", { message: err.message, stack: err.stack  });
  res.status(500).json({ message: "An unexpected server error occurred." });
};

module.exports = errorHandler;
