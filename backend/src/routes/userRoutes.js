const express = require("express");
const { registerUser, loginUser, getUserDashboard } = require("../controllers/userController");
const authenticateToken = require("../middleware/middleware").authenticateToken;

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);

router.get("/dashboard", authenticateToken, getUserDashboard);

module.exports = router;
