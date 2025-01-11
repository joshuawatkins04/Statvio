import React from "react";
import usePasswordForm from "../../hooks/user-management/usePasswordForm";

const PasswordForm = () => {
  const {
    newPassword,
    confirmPassword,
    criteria,
    isButtonEnabled,
    message,
    isFocused,
    handleNewPasswordChange,
    handleConfirmPasswordChange,
    handleSubmit,
    handleCancel,
    setFocus,
  } = usePasswordForm();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-textPrimary dark:text-textPrimary mb-2">Current Password</label>
      <p className="p-3 bg-surface dark:bg-surface rounded-md text-textPrimary dark:text-textPrimary">
        ••••••••
      </p>
      <div>
        <label className="block text-textPrimary dark:text-textPrimary mb-2">New Password</label>
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={handleNewPasswordChange}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          className="w-full p-3 border border-gray-300 rounded-md bg-surface dark:bg-surface text-textPrimary dark:text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          maxLength={40}
        />
      </div>
      <div>
        <label className="block text-textPrimary dark:text-textPrimary mb-2">Confirm New Password</label>
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          className="w-full p-3 border border-gray-300 rounded-md bg-surface dark:bg-surface text-textPrimary dark:text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          maxLength={40}
        />
      </div>
      {isFocused && (
        <div className="mt-2 p-2 text-sm bg-gray-50 border rounded-md">
          <p className={criteria.length ? "text-green-600" : "text-red-600"}>
            {criteria.length ? "✅" : "❌"} Between 8 and 40 characters
          </p>
          <p className={criteria.uppercase ? "text-green-600" : "text-red-600"}>
            {criteria.uppercase ? "✅" : "❌"} At least one uppercase letter
          </p>
          <p className={criteria.lowercase ? "text-green-600" : "text-red-600"}>
            {criteria.lowercase ? "✅" : "❌"} At least one lowercase letter
          </p>
          <p className={criteria.number ? "text-green-600" : "text-red-600"}>
            {criteria.number ? "✅" : "❌"} At least one number
          </p>
          <p className={criteria.specialCharacters ? "text-green-600" : "text-red-600"}>
            {criteria.specialCharacters ? "✅" : "❌"} At least one special character (@$!%*?&)
          </p>
          <p className={criteria.matchesConfirm ? "text-green-600" : "text-red-600"}>
            {criteria.matchesConfirm ? "✅" : "❌"} Passwords match
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

export default PasswordForm;
