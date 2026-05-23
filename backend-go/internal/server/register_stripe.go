package server

import "github.com/gin-gonic/gin"

// registerStripeRoutes mounts the /api/stripe routes, replacing the former
// /api/paypal routes.
func (s *Server) registerStripeRoutes(api *gin.RouterGroup) {
	st := api.Group("/stripe")

	st.POST("/create-checkout-session", s.authRequired(), s.createCheckoutSession)
	st.GET("/verify", s.authRequired(), s.verifyCheckout)

	// Public, signature-verified. Excluded from the global rate limiter (see
	// globalLimiter) so Stripe's retries are never throttled.
	st.POST("/webhook", s.stripeWebhook)
}
