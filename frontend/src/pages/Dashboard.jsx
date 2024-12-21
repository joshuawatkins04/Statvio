import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-gray min-h-screen p-6">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-3xl font-bold text-center mb-6">Your Dashboard</h1>

        {/* User Info Section */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          {dashboardData?.user ? (
            <div className="text-gray-700">
              <p>
                <strong>Username:</strong> {dashboardData.user.username}
              </p>
              <p>
                <strong>Email:</strong> {dashboardData.user.email}
              </p>
            </div>
          ) : (
            <p>No user data available.</p>
          )}
        </div>

        {/* Categories Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {[
            {
              name: "Music",
              link: "/dashboard/spotify",
              gradient: "from-green-400 to-blue-500",
              buttonColor: "text-green-500",
            },
            {
              name: "Movies/TV",
              link: "/dashboard/movies",
              gradient: "from-red-400 to-pink-500",
              buttonColor: "text-red-500",
            },
            {
              name: "Gaming",
              link: "/dashboard/gaming",
              gradient: "from-purple-400 to-indigo-500",
              buttonColor: "text-purple-500",
            },
          ].map((category, index) => (
            <Link to={category.link} key={index} className="block">
              <div
                className={`bg-gradient-to-r ${category.gradient} text-white rounded-xl p-6 shadow-lg transition hover:shadow-xl transform hover:scale-105 cursor-pointer`}
              >
                <h3 className="text-lg font-semibold">{category.name}</h3>
                <p className="mt-2">Explore the latest trends and insights.</p>
                <button
                  className={`mt-4 bg-white ${category.buttonColor} px-4 py-2 rounded-xl hover:bg-gray-200`}
                >
                  Explore {category.name}
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
