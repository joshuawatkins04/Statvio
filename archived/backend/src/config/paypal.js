require("dotenv").config();

module.exports = {
  BASE_URL: process.env.BASE_URL,
  PAYPAL_API_URL: process.env.PAYPAL_API_URL,
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
};
