package server

import (
	"io"
	"net/http"

	"github.com/gin-gonic/gin"

	"statvio/backend/internal/apierror"
	"statvio/backend/internal/middleware"
	"statvio/backend/internal/response"
)

// createCheckoutSession handles POST /api/stripe/create-checkout-session.
func (s *Server) createCheckoutSession(c *gin.Context) {
	url, err := s.Billing.CreateCheckout(c.Request.Context(), middleware.UserID(c))
	if err != nil {
		response.Error(c, err)
		return
	}
	response.OK(c, gin.H{"url": url})
}

// verifyCheckout handles GET /api/stripe/verify?session_id=... It reports the
// status of a Checkout Session for the success page (fulfilment itself is done
// by the webhook).
func (s *Server) verifyCheckout(c *gin.Context) {
	status, err := s.Billing.VerifyCheckout(c.Query("session_id"))
	if err != nil {
		response.Error(c, err)
		return
	}
	response.OK(c, gin.H{
		"status":        status.Status,
		"paymentStatus": status.PaymentStatus,
	})
}

// stripeWebhook handles POST /api/stripe/webhook. It is the source of truth for
// subscription state. The raw body is required for signature verification, so
// this route must not sit behind JSON-binding middleware.
func (s *Server) stripeWebhook(c *gin.Context) {
	payload, err := io.ReadAll(c.Request.Body)
	if err != nil {
		response.Error(c, apierror.BadRequest("Could not read request body"))
		return
	}

	if err := s.Billing.HandleWebhook(c.Request.Context(), payload, c.GetHeader("Stripe-Signature")); err != nil {
		response.Error(c, err)
		return
	}
	response.OK(c, gin.H{"received": true})
}

// requireActiveSub gates a route behind an active subscription. Not currently
// applied to any route; available for paywalling features later.
func (s *Server) requireActiveSub() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !s.Billing.HasActiveSubscription(c.Request.Context(), middleware.UserID(c)) {
			c.AbortWithStatusJSON(http.StatusPaymentRequired, gin.H{"message": "Active subscription required."})
			return
		}
		c.Next()
	}
}
