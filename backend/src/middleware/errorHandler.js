const handleDuplicateKeyError = (error) => {
  const duplicateField = Object.keys(error.keyPattern || {})[0];
  return `${duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1)} already in use.`;
};

const errorHandler = (err, req, res) => {
  console.error("[Global - errorHandler] ERROR:", err);
  console.error(`[Route]: ${req.method} ${req.originalUrl}`);
  console.error(`[User IP]: ${req.ip}`);
  
  if (req.user) {
    console.error(`[User ID]: ${req.user.id}`);
    console.error(`[User Email]: ${req.user.email}`);
  }

  // Authentication error
  if (err.message === "Invalid email or password.") {
    console.warn("[Global - errorHandler] Authentication failed.");
    return res.status(401).json({ message: err.message });
  }

  // Duplicate Key Error (MongoDB error code 11000)
  if (err.code === 11000) {
    return res.status(400).json({ message: handleDuplicateKeyError(err) });
  }

  // Validation Error (Mongoose ValidationError)
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    console.warn("[Global - errorHandler] Validation Error:", messages);
    return res.status(400).json({ message: messages.join(", ") });
  }

  // Handle Auth Error
  if (err.name === "UnauthorizedError") {
    console.warn("[Global - errorHandler] Unauthorized Access.");
    return res.status(401).json({ message: "Unauthorized access." });
  }

  // Default to 500 Server Error
  console.error("[Global - errorHandler] Unhandled Error:", err.message);
  res.status(500).json({ message: "An unexpected server error occurred." });
};

module.exports = errorHandler;
