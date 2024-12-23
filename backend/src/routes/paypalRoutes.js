const express = require("express");
const paypalController = require("../controllers/paypalController");
const router = express.Router();

router.get("/pay", paypalController.createOrder);
router.get("/complete-order", paypalController.capturePayment);
router.get("/cancel-order", paypalController.cancelOrder);

module.exports = router;