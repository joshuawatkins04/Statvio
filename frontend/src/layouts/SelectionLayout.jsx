import React, { useState } from "react";

const SelectionLayout = ({ title, bodyText, connectToService, buttonText }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await connectToService();
    } catch (error) {
      console.error("Error in button action:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface shadow-lg rounded-xl p-6 hover:shadow-xl transition">
      <h2 className="text-textPrimary text-2xl font-semibold mb-4">{title}</h2>
      <p className="text-textSecondary mb-6">{bodyText}</p>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`border-2 border-primary hover:text-white hover:border-surface hover:dark:text-white hover:bg-primary text-primary w-full flex items-center justify-center px-4 py-2 rounded-xl ${
          loading ? "cursor-not-allowed" : ""
        } font-semibold transition duration-200`}
      >
        {loading ? (
          <svg
            className="animate-spin h-5 w-5 mr-3 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
        ) : null}
        {loading ? "Processing..." : buttonText}
      </button>
    </div>
  );
};

export default SelectionLayout;
