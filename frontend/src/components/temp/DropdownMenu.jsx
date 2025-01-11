import React, { useState, useRef, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

const DropdownMenu = () => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      closeDropdown();
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-800 hover:text-gray-600 focus:outline-none"
      >
        <img
          src={user.profileImageUrl || "https://www.gravatar.com/avatar/?d=mp"}
          alt="Profile"
          onClick={toggleDropdown}
          className="w-10 h-10 rounded-full cursor-pointer"
        />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-surface rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <ul className="py-1">
            <li>
              <Link
                to="/dashboard"
                onClick={closeDropdown}
                className="block px-4 py-2 text-sm text-textSubtle dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-800 transition duration-200"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                onClick={closeDropdown}
                className="block px-4 py-2 text-sm text-textSubtle dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-800 transition duration-200"
              >
                Settings
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-textSubtle dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-800 transition duration-200"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
