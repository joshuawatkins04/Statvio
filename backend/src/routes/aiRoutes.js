const express = require("express");
const aiController = require("../controllers/aiController");
const router = express.Router();

router.post("/generate-response", aiController.generateResponse);

module.exports = router;