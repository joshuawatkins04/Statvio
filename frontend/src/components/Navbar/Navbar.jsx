import React, { useContext } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "../../pages/ThemeToggle";
import { AuthContext } from "../../contexts/AuthContext";
import DropdownMenu from "./DropdownMenu";

const Navbar = () => {
  const { user } = useContext(AuthContext);

  return (
    <nav className="bg-backdrop dark:bg-backdrop shadow-md flex justify-between items-center p-6 fixed top-0 left-0 w-full z-50 transition-colors duration-300">
      <Link to="/" className="text-textPrimary dark:text-textPrimary text-2xl font-bold">
        Statvio
      </Link>
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        {!user ? (
          <>
            <Link
              to="/login"
              className="px-4 py-2 mr-4 rounded-md border text-textSubtle hover:text-textPrimary dark:text-textPrimary dark:hover:text-textSecondary transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-md bg-primary hover:bg-primaryHover dark:bg-primary dark:hover:bg-primaryHover text-white dark:text-white transition-colors"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <>
            <DropdownMenu user={user} />
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
