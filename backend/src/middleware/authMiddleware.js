const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  let token = null;
  const authHeader = req.headers["authorization"];
  if (authHeader) {
    token = authHeader.split(" ")[1];
  }
  if (!token && req.query.token) {
    token = req.query.token;
    console.warn("[Debug] Token fetched from query parameter.");
  }

  console.log("[Debug] Token Received:", token);

  if (!token) {
    console.warn("[Debug] No Token Found");
    return res.status(401).json({ message: "Unauthorized" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      console.error("[Debug] Token Verification Failed:", error.message);
      return res.status(403).json({ message: "Forbidden: Invalid or expired token" });
    }
    if (!decoded || !decoded.id) {
      console.error("[Debug] Token payload missing 'id':", decoded);
      return res.status(403).json({ message: "Forbidden: Invalid token payload" });
    }
    console.log("[Debug] Decoded Token Payload:", decoded);

    req.user = { id: decoded.id };
    next();
  });
};

module.exports = { authenticateToken };
