const express = require("express");
const userController = require("../controllers/user");
const { authenticateToken } = require("../middleware/authMiddleware");
const { authLimiter, verifyLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post("/signup", authLimiter, userController.registerUser);
router.post("/login", authLimiter, userController.loginUser);
router.post("/logout", authenticateToken, userController.logoutUser);

router.get("/verify", authenticateToken, verifyLimiter, userController.verifyAuth);
router.get("/dashboard", authenticateToken, userController.getUserDashboard);
router.get("/user", authenticateToken, userController.getUser);
router.get("/api-info", authenticateToken, userController.getApiInfo);

router.put("/update-username", authenticateToken, userController.updateUsername);
router.put("/update-email", authenticateToken, userController.updateEmail);
router.put("/update-password", authenticateToken, userController.updatePassword);
router.put("/update-tutorial-status", authenticateToken, userController.updateTutorialStatus);

module.exports = router;
