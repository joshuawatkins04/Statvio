const express = require("express");
const userController = require("../controllers/userController");
const { authenticateToken } = require("../middleware/authMiddleware");
const { authLimiter, verifyLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post("/signup", authLimiter, userController.registerUser);
router.post("/login", authLimiter, userController.loginUser);

router.get("/verify", authenticateToken, verifyLimiter, userController.verifyAuth);
router.get("/dashboard", authenticateToken, userController.getUserDashboard);
router.get("/user", authenticateToken, userController.getUser);

module.exports = router;
