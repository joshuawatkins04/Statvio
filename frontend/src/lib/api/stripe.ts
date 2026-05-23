import { createApiClient } from "./client"

// Stripe billing client. Backed by VITE_STRIPE_BASE_URL.
const stripeApi = createApiClient(import.meta.env.VITE_STRIPE_BASE_URL, true)

// startCheckout creates a subscription Checkout Session and returns its hosted
// URL for the browser to redirect to.
export async function startCheckout(): Promise<string> {
  const { data } = await stripeApi.post("/create-checkout-session")
  return data.url
}

// verifyCheckoutSession reports the status of a completed Checkout Session.
// Fulfilment itself is handled server-side by the Stripe webhook.
export async function verifyCheckoutSession(sessionId: string) {
  const { data } = await stripeApi.get("/verify", {
    params: { session_id: sessionId },
  })
  return data
}

export default stripeApi
