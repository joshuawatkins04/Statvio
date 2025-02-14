import React from "react";
import useEmailForm from "../../hooks/user-management/useEmailForm";
const EmailForm = () => {
  const {
    email,
    criteria,
    isButtonEnabled,
    message,
    isFocused,
    handleChange,
    handleSubmit,
    handleCancel,
    setFocus,
  } = useEmailForm();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-textPrimary dark:text-textPrimary mb-2">Current Email</label>
      <p className="p-3 text-xs md:text-base bg-surface dark:bg-surface rounded-md text-textPrimary dark:text-textPrimary truncate">
        {criteria.original || "Email not available"}
      </p>
      <div>
        <label className="block text-textPrimary dark:text-textPrimary mb-2">New Email</label>
        <input
          type="email"
          placeholder="Enter new email"
          value={email}
          onChange={handleChange}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          className="w-full text-xs md:text-base p-3 border border-gray-300 rounded-md bg-surface dark:bg-surface text-textPrimary dark:text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          maxLength={45}
        />
      </div>
      {isFocused && (
        <div className="mt-2 p-2 text-sm bg-surface border rounded-md">
          <p className={criteria.length ? "text-green-600" : "text-red-600"}>
            {criteria.length ? "✅" : "❌"} Between 5 and 45 characters
          </p>
          <p className={criteria.hasAtSymbol ? "text-green-600" : "text-red-600"}>
            {criteria.hasAtSymbol ? "✅" : "❌"} Contains @ symbol
          </p>
          <p className={criteria.hasDomain ? "text-green-600" : "text-red-600"}>
            {criteria.hasDomain ? "✅" : "❌"} Has a valid domain (e.g., example.com)
          </p>
          <p className={criteria.hasValidTLD ? "text-green-600" : "text-red-600"}>
            {criteria.hasValidTLD ? "✅" : "❌"} Ends with valid TLD (e.g., .com)
          </p>
          <p className={criteria.noSpaces ? "text-green-600" : "text-red-600"}>
            {criteria.noSpaces ? "✅" : "❌"} No spaces allowed
          </p>
          <p className={criteria.validCharacters ? "text-green-600" : "text-red-600"}>
            {criteria.validCharacters ? "✅" : "❌"} Valid characters in the local part
          </p>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
        <button
          type="submit"
          disabled={!isButtonEnabled}
          className={`w-full md:w-auto px-4 py-2 rounded-md font-semibold shadow-md transition-colors focus:ring-2 focus:ring-primary ${
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
          className="w-full md:w-auto px-4 py-2 border border-primary text-primary rounded-md font-semibold shadow-md transition-colors hover:bg-primary hover:text-white focus:ring-2 focus:ring-primary"
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

export default EmailForm;
