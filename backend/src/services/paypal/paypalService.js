const axios = require("axios");
const config = require("../../config/paypal");

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
    return accessToken;
  }

  try {
    const response = await paypalAxios.post(
      "/v1/oauth2/token",
      "grant_type=client_credentials",
      {
        auth: {
          username: config.PAYPAL_CLIENT_ID,
          password: config.PAYPAL_CLIENT_SECRET,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    accessToken = response.data.access_token;
    accessTokenExpiry = currentTime + (response.data.expires_in - 60) * 1000;
    return accessToken;
  } catch (error) {
    console.error(
      "Failed to generate PayPal access token:",
      error.response?.data || error.message
    );
    throw new Error("Failed to generate PayPal access token");
  }
}

async function getAuthHeader() {
  const token = await generateAccessToken();
  return { Authorization: `Bearer ${token}` };
}

async function checkOrderStatus(orderId) {
  try {
    const headers = await getAuthHeader();
    const response = await paypalAxios.get(`/v2/checkout/orders/${orderId}`, {
      headers,
    });
    console.log("Order Status:", response.data.status);
    return response.data.status;
  } catch (error) {
    console.error(
      "Failed to check order status:",
      error.response?.data || error.message
    );
    throw new Error("Failed to check order status");
  }
}

async function createOrder() {
  try {
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
        brand_name: "Statly",
      },
    };

    const response = await paypalAxios.post("/v2/checkout/orders", orderData, {
      headers,
    });
    const approveLink = response.data.links.find(
      (link) => link.rel === "approve"
    );
    if (!approveLink) {
      throw new Error("No approval link found in Paypal response.");
    }
    return approveLink.href;
  } catch (error) {
    console.error(
      "Failed to create PayPal order:",
      error.response?.data || error.message
    );
    throw new Error("Failed to create PayPal order");
  }
}

async function capturePayment(orderId) {
  try {
    const orderStatus = await checkOrderStatus(orderId);

    if (orderStatus === "COMPLETED") {
      throw new Error("Order already captured");
    }

    const headers = await getAuthHeader();
    const response = await paypalAxios.post(
      `/v2/checkout/orders/${orderId}/capture`,
      {},
      { headers }
    );

    console.log("Payment capture response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Failed to capture payment:",
      error.response?.data || error.message
    );
    throw new Error("Failed to capture payment");
  }
}

module.exports = {
  createOrder,
  capturePayment,
};
