const paypalService = require("../services/paypal/paypalService");

const createOrder = async (res, next) => {
  try {
    const url = await paypalService.createOrder();
    res.redirect(url);
  } catch (error) {
    console.error("Error creating order:", error);
    next(error);
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
    res.json({
      message: "Payment captured successfully",
      data: captureResponse,
    });
  } catch (error) {
    console.error("Error capturing order:", error);
    next(error);
  }
};

const cancelOrder = (res) => {
  res.redirect("/");
};

module.exports = {
  createOrder,
  capturePayment,
  cancelOrder,
};