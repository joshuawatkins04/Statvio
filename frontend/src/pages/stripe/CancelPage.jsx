import React from "react";
import { useNavigate } from "react-router-dom";

const CancelPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Checkout Cancelled</h2>
      <p>Your subscription checkout was cancelled. No charge was made.</p>
      <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
    </div>
  );
};

export default CancelPage;
