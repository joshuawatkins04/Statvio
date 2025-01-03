import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "../../pages/ThemeToggle";
import { AuthContext } from "../../contexts/AuthContext";

const Navbar = () => {
  const { user } = useContext(AuthContext);

  return (
    <nav className="bg-backdrop dark:bg-backdrop shadow-md flex justify-between items-center p-6 fixed top-0 left-0 w-full">
      <Link to="/" className="text-textPrimary dark:text-textPrimary text-2xl font-bold">
        Statvio
      </Link>
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        {!user ? (
          <>
            <Link
              to="/login"
              className="px-4 py-2 mr-4 border text-textSubtle dark:text-textSecondary hover:text-neutral-900 dark:hover:text-neutral-50 rounded-md"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-primary dark:bg-primary text-white dark:text-white rounded-md hover:bg-primary-dark dark:hover:bg-primary-dark"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <Link to="/dashboard" className="relative">
            <img
              src={user.profileImage || "https://www.gravatar.com/avatar/?d=mp"}
              alt="Profile"
              className="w-10 h-10 rounded-full cursor-pointer"
            />
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
