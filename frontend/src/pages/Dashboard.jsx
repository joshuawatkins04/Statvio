import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import Subscribe from "./Subscribe";
import DefaultLayout from "../layouts/DefaultLayout";

const Dashboard = () => {
  const { user, authLoading } = useContext(AuthContext);

  if (authLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  if (!user)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl">Error: User not authenticated.</div>
      </div>
    );

  return (
    <DefaultLayout>
      <h1 className="text-3xl font-bold text-center mb-6">Your Dashboard</h1>

      {/* User Info Section */}
      <div className="bg-surface text-onSurface rounded-xl shadow-card p-6 mb-6">
        {/* Profile pic replacement */}
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="py-6 flex items-center justify-center space-x-8">
            <img
              src="https://www.gravatar.com/avatar/?d=mp"
              className="w-36 h-36 object-cover rounded-full"
            />
          </div>
          <div className="py-6">
            <h2 className="text-xl font-semibold mb-4">User Information</h2>
            {user ? (
              <div className="">
                <p>
                  <strong>Username:</strong> {user.username}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
              </div>
            ) : (
              <p>No user data available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {[
          {
            name: "Music",
            link: "/dashboard/music",
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

      {/* Payment Section */}
      <div className="bg-surface text-onSurface shadow-lg rounded-xl p-6">
        <Subscribe />
      </div>
    </DefaultLayout>
  );
};

export default Dashboard;
