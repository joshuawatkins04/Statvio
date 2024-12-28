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
    <DefaultLayout title={"Your Dashboard"}>
      {/* User Info Section */}
      <div className="bg-surface text-onSurface rounded-xl shadow-card p-6 mb-6 shadow-lg">
        {/* Profile pic replacement */}
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="py-6 flex items-center justify-center space-x-8">
            <img
              src="https://www.gravatar.com/avatar/?d=mp"
              className="w-36 h-36 object-cover rounded-full"
            />
          </div>
          <div className="py-6">
            <h2 className="text-textPrimary text-xl font-semibold mb-4">User Information</h2>
            {user ? (
              <div className="text-textSecondary">
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
          },
          {
            name: "Movies/TV",
            link: "/dashboard/movies",
          },
          {
            name: "Gaming",
            link: "/dashboard/gaming",
          },
        ].map((category, index) => (
          <Link to={category.link} key={index}>
            <div className="bg-surface p-6 shadow-lg rounded-xl hover:shadow-xl transition transform hover:scale-105 cursor-pointer">
              <h3 className="text-textPrimary text-lg font-semibold">{category.name}</h3>
              <p className="text-textSecondary mt-2">Explore the latest trends and insights.</p>
              <button className="bg-white text-textSubtle hover:bg-gray-200 font-semibold mt-4 px-4 py-2 rounded-xl transition duration-200">
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
