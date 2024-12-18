import React, { useState, useEffect } from "react";
import { fetchDashboardData } from "../hooks/UserAuthentication/userAuth";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        const data = await fetchDashboardData();
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getDashboardData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Welcome to your Dashboard</h1>
      {dashboardData?.user ? (
        <div>
          <p><strong>Username:</strong> {dashboardData.user.username}</p>
          <p><strong>Email:</strong> {dashboardData.user.email}</p>
        </div>
      ) : (
        <p>No user data available</p>
      )}
    </div>
  );
};

export default Dashboard;