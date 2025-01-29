const express = require("express");
const paypalController = require("../controllers/paypal");
const { authenticateToken } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/pay", authenticateToken, paypalController.createOrder);
router.get("/complete-order", authenticateToken, paypalController.capturePayment);
router.get("/cancel-order", authenticateToken, paypalController.cancelOrder);

module.exports = router;
