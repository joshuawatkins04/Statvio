import React from "react";

const DefaultLayout = ({ title, children, position }) => {
  {
    /* <div className="min-h-screen p-6 bg-backdrop text-textPrimary transition-colors duration-300"> */
  }
  return position === "center" ? (
    <div className="min-h-screen flex items-center p-6 bg-backdrop text-textPrimary transition-colors duration-300">
      <div className="w-full max-w-5xl mt-32 md:mt-0 mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header>
          <h1 className="text-3xl font-bold text-center mb-6">{title}</h1>
        </header>
        <main>{children}</main>
      </div>
    </div>
  ) : (
    <div className="min-h-screen p-6 bg-backdrop text-textPrimary transition-colors duration-300">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="mt-24">
          <h1 className="text-3xl font-bold text-center mb-6">{title}</h1>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
};

export default DefaultLayout;
