import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="p-6 bg-surface dark:bg-surface text-center text-sm text-textSubtle dark:text-onSurface border-t border-gray-200 dark:border-gray-700 transition-colors">
      <div className="flex flex-col gap-4 justify-between items-center space-y-4">
        <div className="flex justify-center items-center space-x-6">
          <Link to="/privacy" className="hover:text-primary">
            Privacy & policy
          </Link>
          <Link to="/contact" className="hover:text-primary">
            Contact
          </Link>
          <Link to="/terms" className="hover:text-primary">
            Terms of Service
          </Link>
        </div>

        <div>
          © {new Date().getFullYear()} Statvio. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;