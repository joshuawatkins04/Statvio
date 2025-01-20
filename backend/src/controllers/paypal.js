const paypalService = require("../services/paypal/paypalService");
const logger = require("../config/logger");

const FRONTEND_PAYPAL_CANCEL_URL = process.env.FRONTEND_PAYPAL_CANCEL_URL;

const createOrder = async (req, res, next) => {
  try {
    const url = await paypalService.createOrder();
    logger.info("[paypalController - createOrder] PayPal order created successfully.", { url });
    return res.redirect(url);
  } catch (error) {
    logger.error("[paypalController - createOrder] Error creating order.", {
      message: error.message,
      stack: error.stack,
    });
    return next(error);
  }
};

const capturePayment = async (req, res, next) => {
  try {
    const token = req.query.token;

    if (!token) {
      logger.warn("[paypalController - capturePayment] Validation error: Missing token in query.", {
        query: req.query,
      });
      return res.status(400).json({ error: "Missing token in query parameters" });
    }

    logger.info("[paypalController - capturePayment] Token received for payment capture.", { token });

    const captureResponse = await paypalService.capturePayment(token);
    logger.info("[paypalController - capturePayment] Payment captured successfully.", {
      captureResponse,
    });
    return res.json({
      message: "Payment captured successfully",
      data: captureResponse,
    });
  } catch (error) {
    logger.error("[paypalController - capturePayment] Failed to capture PayPal payment.", {
      error: error.message,
      stack: error.stack,
      token: req.query.token,
    });
    return next(error);
  }
};

const cancelOrder = (req, res, next) => {
  // return res.redirect("http://localhost:5173/cancel-order");
  logger.info("[paypalController - cancelOrder] Redirecting to cancel URL.", {
    url: FRONTEND_PAYPAL_CANCEL_URL,
  });
  return res.redirect(FRONTEND_PAYPAL_CANCEL_URL);
};

module.exports = {
  createOrder,
  capturePayment,
  cancelOrder,
};
