const axios = require("axios");
const config = require("../../config/paypal");
const logger = require("../../config/logger");

let accessToken = null;
let accessTokenExpiry = null;

const paypalAxios = axios.create({
  baseURL: config.PAYPAL_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

async function generateAccessToken() {
  const currentTime = Date.now();

  if (accessToken && accessTokenExpiry && currentTime < accessTokenExpiry) {
    logger.info("[PayPal] Using cached access token.");
    return accessToken;
  }

  try {
    logger.info("[PayPal] Generating new access token...");
    const response = await paypalAxios.post("/v1/oauth2/token", "grant_type=client_credentials", {
      auth: {
        username: config.PAYPAL_CLIENT_ID,
        password: config.PAYPAL_CLIENT_SECRET,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    accessToken = response.data.access_token;
    accessTokenExpiry = currentTime + (response.data.expires_in - 60) * 1000;
    logger.info("[PayPal] New access token generated successfully.");
    return accessToken;
  } catch (error) {
    logger.error("[PayPal] Failed to generate access token.", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw new Error("Failed to generate PayPal access token");
  }
}

async function getAuthHeader() {
  const token = await generateAccessToken();
  return { Authorization: `Bearer ${token}` };
}

async function checkOrderStatus(orderId) {
  try {
    logger.info("[PayPal] Checking order status...", { orderId });
    const headers = await getAuthHeader();
    const response = await paypalAxios.get(`/v2/checkout/orders/${orderId}`, {
      headers,
    });
    logger.info("[PayPal] Order status retrieved successfully.", { orderId, status: response.data.status });
    return response.data.status;
  } catch (error) {
    logger.error("[PayPal] Failed to check order status.", {
      orderId,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw new Error("Failed to check order status");
  }
}

async function createOrder() {
  try {
    logger.info("[PayPal] Creating new order...");
    const headers = await getAuthHeader();
    const orderData = {
      intent: "CAPTURE",
      purchase_units: [
        {
          items: [
            {
              name: "Test Payment",
              description: "Test payment for Statly",
              quantity: "1",
              unit_amount: {
                currency_code: "AUD",
                value: "1.00",
              },
            },
          ],
          amount: {
            currency_code: "AUD",
            value: "1.00",
            breakdown: {
              item_total: {
                currency_code: "AUD",
                value: "1.00",
              },
            },
          },
        },
      ],
      application_context: {
        return_url: `${config.BASE_URL}/complete-order`,
        cancel_url: `${config.BASE_URL}/cancel-order`,
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        brand_name: "Statvio",
      },
    };

    const response = await paypalAxios.post("/v2/checkout/orders", orderData, {
      headers,
    });
    const approveLink = response.data.links.find((link) => link.rel === "approve");
    if (!approveLink) {
      logger.error("[PayPal] No approval link found in PayPal response.");
      throw new Error("No approval link found in Paypal response.");
    }
    logger.info("[PayPal] Order created successfully.", {
      orderId: response.data.id,
      approveLink: approveLink.href,
    });
    return approveLink.href;
  } catch (error) {
    logger.error("[PayPal] Failed to create order.", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw new Error("Failed to create PayPal order");
  }
}

async function capturePayment(orderId) {
  try {
    logger.info("[PayPal] Capturing payment for order...", { orderId });
    const orderStatus = await checkOrderStatus(orderId);

    if (orderStatus === "COMPLETED") {
      logger.warn("[PayPal] Order already captured.", { orderId });
      throw new Error("Order already captured");
    }

    const headers = await getAuthHeader();
    const response = await paypalAxios.post(`/v2/checkout/orders/${orderId}/capture`, {}, { headers });

    logger.info("[PayPal] Payment captured successfully.", { orderId, response: response.data });
    return response.data;
  } catch (error) {
    logger.error("[PayPal] Failed to capture payment.", {
      orderId,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw new Error("Failed to capture payment");
  }
}

module.exports = {
  createOrder,
  capturePayment,
};
