import React from "react";
import useUsernameForm from "../../hooks/user-management/useUsernameForm";

const UsernameForm = () => {
  const {
    username,
    isFocused,
    criteria,
    isButtonEnabled,
    message,
    handleChange,
    handleSubmit,
    handleCancel,
    setFocus,
  } = useUsernameForm();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-textPrimary dark:text-textPrimary mb-2">Current Username</label>
      <p className="p-3 bg-surface dark:bg-surface rounded-md text-textPrimary dark:text-textPrimary">
        {criteria.original}
      </p>
      <div>
        <label className="block text-textPrimary dark:text-textPrimary mb-2">New Username</label>
        <input
          type="text"
          placeholder="Enter new username"
          value={username}
          onChange={handleChange}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          className="w-full p-3 border border-gray-300 rounded-md bg-surface dark:bg-surface text-textPrimary dark:text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          maxLength={20}
        />
      </div>
      {isFocused && (
        <div className="mt-2 p-2 text-sm bg-gray-50 border rounded-md">
          <p className={criteria.length ? "text-green-600" : "text-red-600"}>
            {criteria.length ? "✅" : "❌"} Between 4 and 20 characters
          </p>
          <p className={criteria.validCharacters ? "text-green-600" : "text-red-600"}>
            {criteria.validCharacters ? "✅" : "❌"} Only letters, numbers, and underscores
          </p>
          <p className={criteria.noSpaces ? "text-green-600" : "text-red-600"}>
            {criteria.noSpaces ? "✅" : "❌"} No spaces allowed
          </p>
        </div>
      )}
      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={!isButtonEnabled}
          className={`px-6 py-2 rounded-md font-semibold shadow-md transition-colors focus:ring-2 focus:ring-primary ${
            isButtonEnabled
              ? "bg-primary text-white hover:bg-primaryHover"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="px-6 py-2 border border-primary text-primary rounded-md font-semibold shadow-md transition-colors hover:bg-primary hover:text-white focus:ring-2 focus:ring-primary"
        >
          Cancel
        </button>
      </div>
      {message && (
        <p className={`mt-2 text-sm ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </form>
  );
};

export default UsernameForm;