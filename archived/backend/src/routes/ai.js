const express = require("express");
const aiController = require("../controllers/ai");
const { authenticateToken } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/generate-response", authenticateToken, aiController.generateResponse);

module.exports = router;
