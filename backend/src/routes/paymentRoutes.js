const express = require("express");
const { captureOrder, createOrder } = require("../controllers/paymentController");

const router = express.Router();

router.post("/api/orders", createOrder(cart));
router.post("/api/orders/:orderId/capture", captureOrder);

module.exports = router;