const express = require("express");
const userController = require("../controllers/user");
const { authenticateToken } = require("../middleware/authMiddleware");
const { authLimiter, verifyLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post("/signup", authLimiter, userController.registerUser);
router.post("/login", authLimiter, userController.loginUser);
router.post("/logout", userController.logoutUser);

router.get("/verify", authenticateToken, verifyLimiter, userController.verifyAuth);
router.get("/dashboard", authenticateToken, userController.getUserDashboard);
router.get("/user", authenticateToken, userController.getUser);

router.put("/update-username", authenticateToken, userController.updateUsername);
router.put("/update-email", authenticateToken, userController.updateEmail);
router.put("/update-password", authenticateToken, userController.updatePassword);

module.exports = router;
