const paypalService = require("../services/paypal/paypalService");

const createOrder = async (req, res, next) => {
  try {
    const url = await paypalService.createOrder();
    return res.redirect(url);
  } catch (error) {
    console.error("Error creating order:", error);
    return next(error);
  }
};

const capturePayment = async (req, res, next) => {
  try {
    const token = req.query.token;
    if (!token) {
      console.error("Missing token in request query");
      return res.status(400).json({ error: "Missing token in query parameters" });
    }

    console.log("Token received for payment capture:", token);

    const captureResponse = await paypalService.capturePayment(token);
    return res.json({
      message: "Payment captured successfully",
      data: captureResponse,
    });
  } catch (error) {
    console.error("Error capturing order:", error);
    return next(error);
  }
};

const cancelOrder = (req, res, next) => {
  return res.redirect("http://localhost:5173/cancel-order");
};

module.exports = {
  createOrder,
  capturePayment,
  cancelOrder,
};