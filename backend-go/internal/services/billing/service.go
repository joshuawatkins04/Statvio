// Package billing owns the Stripe subscription business logic: starting a
// Checkout Session, reporting a session's status, and applying the webhook
// events that are the source of truth for a user's subscription state. It
// composes the low-level Stripe client with the user repository.
package billing

import (
	"context"
	"encoding/json"
	"log/slog"
	"time"

	stripesdk "github.com/stripe/stripe-go/v81"
	"go.mongodb.org/mongo-driver/bson"

	"statvio/backend/internal/apierror"
	"statvio/backend/internal/repository"
	"statvio/backend/internal/services/stripe"
)

// Service orchestrates checkout and subscription state for users.
type Service struct {
	users   *repository.UserRepository
	stripe  *stripe.Service
	priceID string
	log     *slog.Logger
}

// New builds the billing service. priceID is recorded on the subscription when
// a checkout completes.
func New(users *repository.UserRepository, sp *stripe.Service, priceID string, log *slog.Logger) *Service {
	return &Service{users: users, stripe: sp, priceID: priceID, log: log}
}

// CreateCheckout ensures the user has a Stripe customer and starts a
// subscription Checkout Session, returning its hosted URL.
func (s *Service) CreateCheckout(ctx context.Context, userID string) (string, error) {
	user, err := s.users.FindByID(ctx, userID)
	if err != nil {
		return "", err // repository.ErrNotFound -> 404 via apierror.From
	}

	existingCustomer := ""
	if user.Subscription != nil {
		existingCustomer = user.Subscription.StripeCustomerID
	}

	customerID, err := s.stripe.EnsureCustomer(user.Email, existingCustomer)
	if err != nil {
		return "", apierror.Wrap("Failed to start checkout.", err)
	}

	if existingCustomer == "" {
		_ = s.users.UpdateByID(ctx, userID, bson.M{
			"subscription.stripeCustomerId": customerID,
			"subscription.updatedAt":        time.Now().UTC(),
		})
	}

	url, err := s.stripe.CreateCheckoutSession(userID, customerID)
	if err != nil {
		return "", apierror.Wrap("Failed to start checkout.", err)
	}
	return url, nil
}

// SessionStatus is the public status of a Checkout Session.
type SessionStatus struct {
	Status        string
	PaymentStatus string
}

// VerifyCheckout reports the status of a Checkout Session for the success page.
// Fulfilment itself is performed by the webhook.
func (s *Service) VerifyCheckout(sessionID string) (SessionStatus, error) {
	if sessionID == "" {
		return SessionStatus{}, apierror.BadRequest("Missing session_id")
	}
	sess, err := s.stripe.GetSession(sessionID)
	if err != nil {
		return SessionStatus{}, apierror.Wrap("Failed to verify session.", err)
	}
	return SessionStatus{
		Status:        string(sess.Status),
		PaymentStatus: string(sess.PaymentStatus),
	}, nil
}

// HandleWebhook verifies a webhook payload and applies its subscription side
// effects. It returns an error only when the signature is invalid; per-event
// processing failures are logged and swallowed so Stripe's retries are not
// triggered by transient state-write errors. Idempotent under retries.
func (s *Service) HandleWebhook(ctx context.Context, payload []byte, signature string) error {
	event, err := s.stripe.ConstructEvent(payload, signature)
	if err != nil {
		s.log.Warn("stripe: webhook signature verification failed", "error", err)
		return apierror.BadRequest("Invalid signature")
	}

	now := time.Now().UTC()

	switch event.Type {
	case "checkout.session.completed":
		var sess stripesdk.CheckoutSession
		if err := json.Unmarshal(event.Data.Raw, &sess); err != nil {
			s.log.Error("stripe: decode session failed", "error", err)
			break
		}
		if sess.ClientReferenceID == "" {
			break
		}
		set := bson.M{
			"subscription.status":    "active",
			"subscription.priceId":   s.priceID,
			"subscription.updatedAt": now,
		}
		if sess.Customer != nil {
			set["subscription.stripeCustomerId"] = sess.Customer.ID
		}
		if sess.Subscription != nil {
			set["subscription.stripeSubscriptionId"] = sess.Subscription.ID
		}
		if err := s.users.UpdateByID(ctx, sess.ClientReferenceID, set); err != nil {
			s.log.Error("stripe: activate subscription failed", "userId", sess.ClientReferenceID, "error", err)
		}

	case "customer.subscription.updated":
		var sub stripesdk.Subscription
		if err := json.Unmarshal(event.Data.Raw, &sub); err == nil {
			s.applySubscriptionStatus(ctx, sub.Customer, string(sub.Status))
		}

	case "customer.subscription.deleted":
		var sub stripesdk.Subscription
		if err := json.Unmarshal(event.Data.Raw, &sub); err == nil {
			s.applySubscriptionStatus(ctx, sub.Customer, "canceled")
		}

	case "invoice.payment_failed":
		var inv stripesdk.Invoice
		if err := json.Unmarshal(event.Data.Raw, &inv); err == nil {
			s.applySubscriptionStatus(ctx, inv.Customer, "past_due")
		}

	default:
		s.log.Debug("stripe: unhandled event", "type", event.Type)
	}

	return nil
}

// applySubscriptionStatus maps a Stripe customer to a user and updates their
// subscription status. Idempotent, so safe under Stripe's webhook retries.
func (s *Service) applySubscriptionStatus(ctx context.Context, cust *stripesdk.Customer, status string) {
	if cust == nil || cust.ID == "" {
		return
	}
	user, err := s.users.FindByStripeCustomerID(ctx, cust.ID)
	if err != nil {
		s.log.Error("stripe: no user for customer", "customer", cust.ID, "error", err)
		return
	}
	if err := s.users.UpdateByID(ctx, user.ID.Hex(), bson.M{
		"subscription.status":    status,
		"subscription.updatedAt": time.Now().UTC(),
	}); err != nil {
		s.log.Error("stripe: update subscription status failed", "error", err)
	}
}

// HasActiveSubscription reports whether the user currently has an active
// subscription. Used to gate paywalled features.
func (s *Service) HasActiveSubscription(ctx context.Context, userID string) bool {
	user, err := s.users.FindByID(ctx, userID)
	return err == nil && user.Subscription != nil && user.Subscription.Status == "active"
}
