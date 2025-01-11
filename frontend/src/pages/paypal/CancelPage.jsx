import React from "react";
import { useNavigate } from "react-router-dom";

const CancelPage = () => {
  const navigate = useNavigate();

  const handleReturn = () => {
    navigate("/");
  };

  return (
    <div>
      <h2>Payment Cancelled</h2>
      <p>You have cancelled the payment process.</p>
      <button onClick={handleReturn}>Go Back to Home</button>
    </div>
  );
};

export default CancelPage;
