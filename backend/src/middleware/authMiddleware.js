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
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("[Debug] Token Verification Failed:", err.message);
      return res.status(403).json({ message: "Forbidden" });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };