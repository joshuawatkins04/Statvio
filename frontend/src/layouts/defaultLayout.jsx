import React from "react";

const defaultLayout = ({ children }) => {
  return (
    <div className="min-h-screen p-6 bg-backdrop text-textPrimary transition-colors duration-300">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <main>{children}</main>
      </div>
    </div>
  );
};

export default defaultLayout;
