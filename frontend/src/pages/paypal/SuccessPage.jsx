import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Processing your payment...");
  const hasFetched = useRef(false);
  const navigate = useNavigate();
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);

  useEffect(() => {
    const capturePayment = async () => {
      if (hasFetched.current) return;
      hasFetched.current = true;

      const token = searchParams.get("token");
      if (!token) {
        setMessage("Invalid token.");
        return;
      }

      const processedToken = sessionStorage.getItem("processedToken");
      if (processedToken === token) {
        setMessage("Payment already processed. Redirecting...");
        setPaymentSuccessful(true);
        return;
      }

      try {
        const response = await axios.get(`${__PAYPAL_COMPLETE_ORDER_URL__}=${token}`);
        setMessage("Course purchased successfully!");
        console.log("Capture Response:", response.data);

        sessionStorage.setItem("processedToken", token);
        setPaymentSuccessful(true);
      } catch (error) {
        console.error("Payment capture failed:", error.response?.data || error.message);
        if (error.response?.status === 400) {
          setMessage("Invalid payment token. Please contact support.");
        } else if (error.response?.status === 500) {
          setMessage("Server error occurred. Please try again later.");
        } else {
          setMessage("Failed to capture payment. Please try again.");
        }
      }
    };

    capturePayment();
  }, [searchParams]);

  useEffect(() => {
    let redirectTimeout;
    if (paymentSuccessful) {
      redirectTimeout = setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    }
    return () => {
      if (redirectTimeout) clearTimeout(redirectTimeout);
    };
  }, [paymentSuccessful, navigate]);

  return (
    <div>
      <h2>Payment Status</h2>
      <p>{message}</p>
      {paymentSuccessful && <p>Redirecting to your dashboard...</p>}
    </div>
  );
};

export default SuccessPage;
