const express = require("express");
const aiController = require("../controllers/ai");
const router = express.Router();

router.post("/generate-response", aiController.generateResponse);

module.exports = router;