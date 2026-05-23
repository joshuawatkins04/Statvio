const express = require("express");
const awsController = require("../controllers/aws");
const { upload } = require("../services/aws/aws");
const { authenticateToken } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/upload", authenticateToken, upload.single("profileImage"), awsController.upload);

module.exports = router;