import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import Subscribe from "./Subscribe";
import DefaultLayout from "../../layouts/DefaultLayout";
import ProfileImageUpload from "./ProfileImageUpload";

const Dashboard = () => {
  const { user, isAuthenticated, authLoading } = useContext(AuthContext);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(
    user?.profileImageUrl || "https://www.gravatar.com/avatar/?d=mp"
  );

  useEffect(() => {
    if (user && user.profileImageUrl) {
      setProfileImage(user.profileImageUrl);
    }
  }, [user]);

  const handleProfileClick = () => {
    setIsUploadModalOpen(true);
  };

  const handleImageUpload = (imageUrl) => {
    setProfileImage(imageUrl);
    setIsUploadModalOpen(false);
  };

  if (authLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  if (!isAuthenticated && !user)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl">Error: User not authenticated.</div>
      </div>
    );

  return (
    <DefaultLayout title={"Your Dashboard"}>
      {/* User Info Section */}
      <div className="bg-surface text-onSurface rounded-xl shadow-card p-6 mb-6 shadow-lg hover:shadow-xl transition">
        {/* Profile pic replacement */}
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="py-6 flex items-center justify-center space-x-8">
            <img
              src={profileImage}
              className="w-36 h-36 object-cover rounded-full cursor-pointer"
              alt="Profile"
              onClick={handleProfileClick}
            />
          </div>
          <div className="py-6">
            {user ? (
              <>
                <div className="mb-4">
                  <span className="text-textPrimary text-xl font-extrabold">
                    Welcome <span className="text-primary">{user.username}</span>
                  </span>
                </div>
                <div className="flex flex-col space-y-1">
                <Link
                    to="/settings?section=general"
                    className="text-textSecondary font-semibold hover:underline flex items-center"
                  >
                    General Settings
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-1 w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    to="/settings?section=manage-profile"
                    className="text-textSecondary font-semibold hover:underline flex items-center"
                  >
                    Manage Profile
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-1 w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    to="/settings?section=manage-api"
                    className="text-textSecondary font-semibold hover:underline flex items-center"
                  >
                    Manage API's
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-1 w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-textSecondary">User not found</p>
            )}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
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
            <div className="bg-surface text-left p-6 shadow-lg rounded-xl hover:shadow-xl transition">
              <h3 className="text-textPrimary text-lg font-semibold">{category.name}</h3>
              <p className="text-textSecondary mt-2">Explore the latest trends and insights.</p>
              <button className="border border-outline hover:border-surface text-textSecondary hover:text-white hover:bg-primary font-semibold mt-4 px-4 py-2 rounded-xl transition duration-200">
                Explore {category.name}
              </button>
            </div>
          </Link>
        ))}
      </div>

      {/* Payment Section */}
      {/* <div className="bg-surface text-onSurface shadow-lg rounded-xl p-6">
        <Subscribe />
      </div> */}

      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Upload Profile Picture</h2>
            <ProfileImageUpload onUploadSuccess={handleImageUpload} />
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </DefaultLayout>
  );
};

export default Dashboard;
