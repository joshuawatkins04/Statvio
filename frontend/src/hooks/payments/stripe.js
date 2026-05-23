import axios from "axios";

// Stripe API client. Mirrors the other integration hooks: attaches the JWT from
// localStorage and sends credentials. Replaces the former PayPal calls.
const stripeApi = axios.create({
  baseURL: __STRIPE_BASE_URL__,
  withCredentials: true,
});

stripeApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("[stripeApi] No token found in localStorage.");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

stripeApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Stripe API error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// startCheckout creates a subscription Checkout Session and returns its hosted
// URL for the browser to redirect to.
export const startCheckout = async () => {
  const { data } = await stripeApi.post("/create-checkout-session");
  return data.url;
};

// verifyCheckoutSession reports the status of a completed Checkout Session.
// Fulfilment itself is handled server-side by the Stripe webhook.
export const verifyCheckoutSession = async (sessionId) => {
  const { data } = await stripeApi.get("/verify", { params: { session_id: sessionId } });
  return data;
};

export default stripeApi;
