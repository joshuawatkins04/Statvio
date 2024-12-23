const paypalService = require("../services/paypal/paypalService");

exports.createOrder = async (req, res) => {
  try {
    const url = await paypalService.createOrder();
    res.redirect(url);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

exports.capturePayment = async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) {
      console.error("Missing token in request query");
      return res
        .status(400)
        .json({ error: "Missing token in query parameters" });
    }

    console.log("Token received for payment capture:", token);

    const captureResponse = await paypalService.capturePayment(token);
    res.json({
      message: "Payment captured successfully",
      data: captureResponse,
    });
  } catch (error) {
    console.error("Error capturing payment:", error.message);

    if (error.message.includes("Order already captured")) {
      return res.status(200).json({ message: "Order already captured" });
    }

    res
      .status(500)
      .json({ error: "Failed to capture payment", details: error.message });
  }
};

exports.cancelOrder = (req, res) => {
  res.redirect("/");
};
