import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="p-6 bg-surface dark:bg-surface text-center text-sm text-textSubtle dark:text-onSurface border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-center space-y-4 sm:space-y-0">
        <div>
          <span className="text-lg font-semibold text-textPrimary dark:text-white">
            Statvio
          </span>
        </div>

        <div className="flex justify-center items-center space-x-6">
          <Link to="/privacy" className="hover:text-primary transition">
            Privacy & policy
          </Link>
          <Link to="/contact" className="hover:text-primary transition">
            Contact
          </Link>
          <Link to="/about" className="hover:text-primary transition">
            About Us
          </Link>
          <Link to="/terms" className="hover:text-primary transition">
            Terms of Service
          </Link>
        </div>

        <div className="">
          © {new Date().getFullYear()} Statvio. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;