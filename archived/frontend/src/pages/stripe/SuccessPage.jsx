import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyCheckoutSession } from "../../hooks/payments/stripe";

// Stripe redirects here with ?session_id=... after checkout. Fulfilment is done
// by the backend webhook; this page only confirms the session and redirects.
const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Confirming your subscription...");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setMessage("Missing session reference.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const data = await verifyCheckoutSession(sessionId);
        if (cancelled) return;
        if (data.status === "complete" || data.paymentStatus === "paid") {
          setMessage("Subscription active! Redirecting to your dashboard...");
        } else {
          setMessage("Payment received. Your subscription is being finalized...");
        }
        setDone(true);
      } catch (error) {
        if (!cancelled) {
          setMessage(
            "We couldn't confirm your subscription yet. If you were charged, it will activate shortly."
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  useEffect(() => {
    if (!done) return undefined;
    const timeout = setTimeout(() => navigate("/dashboard"), 2000);
    return () => clearTimeout(timeout);
  }, [done, navigate]);

  return (
    <div>
      <h2>Subscription Status</h2>
      <p>{message}</p>
      {done && <p>Redirecting to your dashboard...</p>}
    </div>
  );
};

export default SuccessPage;
