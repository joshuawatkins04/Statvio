// Package stripe implements Stripe Checkout (subscription mode) and webhook
// verification, replacing the removed PayPal integration.
package stripe

import (
	stripe "github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/checkout/session"
	"github.com/stripe/stripe-go/v81/customer"
	"github.com/stripe/stripe-go/v81/webhook"

	"statvio/backend/internal/config"
)

// Service wraps the Stripe API for the operations this app needs.
type Service struct {
	priceID       string
	successURL    string
	cancelURL     string
	webhookSecret string
}

// New configures the Stripe SDK with the secret key and returns a service.
func New(cfg config.StripeConfig) *Service {
	stripe.Key = cfg.SecretKey
	return &Service{
		priceID:       cfg.PriceID,
		successURL:    cfg.SuccessURL,
		cancelURL:     cfg.CancelURL,
		webhookSecret: cfg.WebhookSecret,
	}
}

// EnsureCustomer returns the existing Stripe customer id if present, otherwise
// creates a new customer for the given email.
func (s *Service) EnsureCustomer(email, existingID string) (string, error) {
	if existingID != "" {
		return existingID, nil
	}
	cust, err := customer.New(&stripe.CustomerParams{
		Email: stripe.String(email),
	})
	if err != nil {
		return "", err
	}
	return cust.ID, nil
}

// CreateCheckoutSession starts a subscription-mode Checkout Session for the
// configured price and returns the hosted Checkout URL. The user id is recorded
// as client_reference_id so the webhook can attribute the completed session.
func (s *Service) CreateCheckoutSession(userID, customerID string) (string, error) {
	params := &stripe.CheckoutSessionParams{
		Mode:              stripe.String(string(stripe.CheckoutSessionModeSubscription)),
		Customer:          stripe.String(customerID),
		ClientReferenceID: stripe.String(userID),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(s.priceID),
				Quantity: stripe.Int64(1),
			},
		},
		SuccessURL: stripe.String(s.successURL),
		CancelURL:  stripe.String(s.cancelURL),
	}
	sess, err := session.New(params)
	if err != nil {
		return "", err
	}
	return sess.URL, nil
}

// GetSession retrieves a Checkout Session by id (used by the verify endpoint).
func (s *Service) GetSession(id string) (*stripe.CheckoutSession, error) {
	return session.Get(id, nil)
}

// ConstructEvent verifies a webhook payload's signature and returns the event.
func (s *Service) ConstructEvent(payload []byte, sigHeader string) (stripe.Event, error) {
	return webhook.ConstructEvent(payload, sigHeader, s.webhookSecret)
}
