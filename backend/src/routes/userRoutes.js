const express = require("express");
const userController = require("../controllers/userController");
const authenticateToken = require("../middleware/middleware").authenticateToken;

const router = express.Router();

router.post("/signup", userController.registerUser);
router.post("/login", userController.loginUser);

router.get("/dashboard", authenticateToken, userController.getUserDashboard);

module.exports = router;
