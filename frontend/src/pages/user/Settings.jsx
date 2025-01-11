import React, { useState } from "react";
import DefaultLayout from "../../layouts/DefaultLayout";
import Sidebar from "../../components/settings/Sidebar";
import GeneralSettings from "../../components/settings/GeneralSettings";
import ManageAccount from "../../components/settings/ManageAccount";
import ManageAPIs from "../../components/settings/ManageApis";

const Settings = () => {
  const [activeSection, setActiveSection] = useState("General Settings");

  const renderSettings = () => {
    switch (activeSection) {
      case "General Settings":
        return <GeneralSettings />;
      case "Manage Account":
        return <ManageAccount />;
      case "Manage APIs":
        return <ManageAPIs />;
      default:
        return null;
    }
  };

  return (
    <DefaultLayout>
      <div className="flex h-screen">
        <Sidebar activeSection={activeSection} onChange={setActiveSection} />
        <div className="mt-8 w-[1px] bg-gray-300 dark:bg-gray-600"></div>
        <div className="w-3/4 p-6">{renderSettings()}</div>
      </div>
    </DefaultLayout>
  );
};

export default Settings;

/*

import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { validateUsername, validateEmail, validatePassword } from "../utils/validation";
import DefaultLayout from "../layouts/DefaultLayout";
import { updateUsername, updateEmail, updatePassword } from "../hooks/UserAuthentication/userAuth";

const Settings = () => {
  const { user } = useContext(AuthContext);
  const [activeSection, setActiveSection] = useState("General Settings");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [usernameCriteria, setUsernameCriteria] = useState({
    length: false,
    validCharacters: false,
    noSpaces: false,
  });
  const [emailCriteria, setEmailCriteria] = useState({
    length: false,
    hasAtSymbol: false,
    hasDomain: false,
    hasValidTLD: false,
    noSpaces: false,
    validCharacters: false,
  });
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialCharacters: false,
    matchesConfirm: false,
  });

  const [originalValues, setOriginalValues] = useState({
    username: "",
    email: "",
  });
  const [isUsernameButtonEnabled, setIsUsernameButtonEnabled] = useState(false);
  const [isEmailButtonEnabled, setIsEmailButtonEnabled] = useState(false);
  const [isPasswordButtonEnabled, setIsPasswordButtonEnabled] = useState(false);

  const [usernameMessage, setUsernameMessage] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    setUsername(user.username || "");
    setEmail(user.email || "");
    setOriginalValues({
      username: user.username || "",
      email: user.email || "",
    });
  }, [user]);

  useEffect(() => {
    const allUsernameCriteriaMet =
      usernameCriteria.length && usernameCriteria.validCharacters && usernameCriteria.noSpaces;

    const isUsernameChanged = username !== originalValues.username;

    setIsUsernameButtonEnabled(allUsernameCriteriaMet && isUsernameChanged);
  }, [usernameCriteria, username, originalValues.username]);

  useEffect(() => {
    const allEmailCriteriaMet =
      emailCriteria.length &&
      emailCriteria.hasAtSymbol &&
      emailCriteria.hasDomain &&
      emailCriteria.hasValidTLD &&
      emailCriteria.noSpaces &&
      emailCriteria.validCharacters;

    const isEmailChanged = email !== originalValues.email;

    setIsEmailButtonEnabled(allEmailCriteriaMet && isEmailChanged);
  }, [emailCriteria, email, originalValues.email]);

  useEffect(() => {
    const allPasswordCriteriaMet =
      passwordCriteria.length &&
      passwordCriteria.uppercase &&
      passwordCriteria.lowercase &&
      passwordCriteria.number &&
      passwordCriteria.specialCharacters &&
      passwordCriteria.matchesConfirm;

    const isPasswordFilled = password !== "" && confirmPassword !== "";

    setIsPasswordButtonEnabled(allPasswordCriteriaMet && isPasswordFilled);
  }, [passwordCriteria, password, confirmPassword]);

  const handleSectionChange = (section) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSection(section);
      setIsTransitioning(false);
      setUsernameMessage("");
      setEmailMessage("");
      setPasswordMessage("");
    }, 200);
  };

  const handleUsernameChange = (e) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    const criteria = validateUsername(newUsername);
    setUsernameCriteria(criteria);
    setUsernameMessage("");
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    const criteria = validateEmail(newEmail);
    setEmailCriteria(criteria);
    setEmailMessage("");
  };

  const handlePasswordUpdate = (password, confirmPassword) => {
    const criteria = validatePassword(password, confirmPassword);
    setPasswordCriteria(criteria);
  };
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    handlePasswordUpdate(newPassword, confirmPassword);
    setPasswordMessage("");
  };
  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    handlePasswordUpdate(password, newConfirmPassword);
    setPasswordMessage("");
  };

  const handleCancelPassword = (e) => {
    setPassword("");
    setConfirmPassword("");
    setPasswordCriteria({
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      specialCharacters: false,
      matchesConfirm: false,
    });
    setIsPasswordFocused(false);
    setPasswordMessage("");
  };

  const handleCancelUsername = () => {
    setUsername(originalValues.username);
    setUsernameCriteria({
      length: true,
      validCharacters: true,
      noSpaces: true,
    });
    setIsUsernameFocused(false);
    setUsernameMessage("");
  };

  const handleCancelEmail = () => {
    setEmail(originalValues.email);
    setEmailCriteria({
      length: true,
      hasAtSymbol: true,
      hasDomain: true,
      hasValidTLD: true,
      noSpaces: true,
      validCharacters: true,
    });
    setIsEmailFocused(false);
    setEmailMessage("");
  };

  const handleSubmitUsername = async (e) => {
    e.preventDefault();

    if (!isUsernameButtonEnabled) return;

    try {
      const response = await updateUsername(username);
      setUsernameMessage(response.message || "Username updated successfully!");
      setOriginalValues((prev) => ({ ...prev, username }));
      // Optionally update user context
      // setUser((prev) => ({ ...prev, username }));
    } catch (error) {
      console.error("Error updating username:", error);
      setUsernameMessage(error.response?.data?.message || "Failed to update username.");
    }
  };

  const handleSubmitEmail = async (e) => {
    e.preventDefault();

    if (!isEmailButtonEnabled) return;

    try {
      const response = await updateEmail(email);
      setEmailMessage(response.message || "Email updated successfully!");
      setOriginalValues((prev) => ({ ...prev, email }));
      // Optionally update user context
      // setUser((prev) => ({ ...prev, email }));
    } catch (error) {
      console.error("Error updating email:", error);
      setEmailMessage(error.response?.data?.message || "Failed to update email.");
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();

    if (!isPasswordButtonEnabled) return;

    try {
      const response = await updatePassword(password, confirmPassword);
      setPasswordMessage(response.message || "Password updated successfully!");
      // Optionally, you might want to log the user out after password change
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordMessage(error.response?.data?.message || "Failed to update password.");
    }
  };

  const renderSettings = () => {
    switch (activeSection) {
      case "General Settings":
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-4">General Settings</h2>
            <p>Here you can manage general application settings.</p>
          </div>
        );
      case "Manage Account":
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Manage Account</h2>
            <p className="mb-10">Here you can update your account information and preferences.</p>
            <div className="space-y-10">
              <form onSubmit={handleSubmitUsername} className="space-y-2">
                <label className="block text-textPrimary dark:text-textPrimary mb-2">Current Username</label>
                <p className="p-3 bg-surface dark:bg-surface rounded-md text-textPrimary dark:text-textPrimary">
                  {originalValues.username || "Username not available"}
                </p>
                <div>
                  <label className="block text-textPrimary dark:text-textPrimary mb-2">New Username</label>
                  <input
                    type="text"
                    placeholder="Enter new username"
                    value={username}
                    onChange={handleUsernameChange}
                    onFocus={() => setIsUsernameFocused(true)}
                    onBlur={() => setIsUsernameFocused(false)}
                    className="w-full p-3 border border-gray-300 rounded-md bg-surface dark:bg-surface text-textPrimary dark:text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                {isUsernameFocused && (
                  <div className="mt-2 p-2 text-sm bg-gray-50 border rounded-md">
                    <p className={usernameCriteria.length ? "text-green-600" : "text-red-600"}>
                      {usernameCriteria.length ? "✅" : "❌"} Between 4 and 20 characters
                    </p>
                    <p className={usernameCriteria.validCharacters ? "text-green-600" : "text-red-600"}>
                      {usernameCriteria.validCharacters ? "✅" : "❌"} Only letters, numbers, and underscores
                    </p>
                    <p className={usernameCriteria.noSpaces ? "text-green-600" : "text-red-600"}>
                      {usernameCriteria.noSpaces ? "✅" : "❌"} No spaces allowed
                    </p>
                  </div>
                )}
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={!isUsernameButtonEnabled}
                    className={`px-6 py-2 rounded-md font-semibold shadow-md transition-colors focus:ring-2 focus:ring-primary ${
                      isUsernameButtonEnabled
                        ? "bg-primary text-white hover:bg-primaryHover"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelUsername}
                    className="px-6 py-2 border border-primary text-primary rounded-md font-semibold shadow-md transition-colors hover:bg-primary hover:text-white focus:ring-2 focus:ring-primary"
                  >
                    Cancel
                  </button>
                </div>
                {usernameMessage && (
                  <p
                    className={`mt-2 text-sm ${
                      usernameMessage.includes("successfully") ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {usernameMessage}
                  </p>
                )}
              </form>

              <form onSubmit={handleSubmitEmail} className="space-y-2">
                <label className="block text-textPrimary dark:text-textPrimary mb-2">Current email</label>
                <p className="p-3 bg-surface dark:bg-surface rounded-md text-textPrimary dark:text-textPrimary">
                  {originalValues.email || "Email not available"}
                </p>
                <div>
                  <label className="block text-textPrimary dark:text-textPrimary mb-2">New email</label>
                  <input
                    type="email"
                    placeholder="Enter new email"
                    value={email}
                    onChange={handleEmailChange}
                    onFocus={() => setIsEmailFocused(true)}
                    onBlur={() => setIsEmailFocused(false)}
                    className="w-full p-3 border border-gray-300 rounded-md bg-surface dark:bg-surface text-textPrimary dark:text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                {isEmailFocused && (
                  <div className="mt-2 p-2 text-sm bg-gray-50 border rounded-md">
                    <p className={emailCriteria.length ? "text-green-600" : "text-red-600"}>
                      {emailCriteria.length ? "✅" : "❌"} Between 5 and 45 characters
                    </p>
                    <p className={emailCriteria.hasAtSymbol ? "text-green-600" : "text-red-600"}>
                      {emailCriteria.hasAtSymbol ? "✅" : "❌"} Contains @ symbol
                    </p>
                    <p className={emailCriteria.hasDomain ? "text-green-600" : "text-red-600"}>
                      {emailCriteria.hasDomain ? "✅" : "❌"} Has a valid domain (e.g., example.com)
                    </p>
                    <p className={emailCriteria.hasValidTLD ? "text-green-600" : "text-red-600"}>
                      {emailCriteria.hasValidTLD ? "✅" : "❌"} Ends with valid TLD (e.g., .com)
                    </p>
                    <p className={emailCriteria.noSpaces ? "text-green-600" : "text-red-600"}>
                      {emailCriteria.noSpaces ? "✅" : "❌"} No spaces allowed
                    </p>
                    <p className={emailCriteria.validCharacters ? "text-green-600" : "text-red-600"}>
                      {emailCriteria.validCharacters ? "✅" : "❌"} Valid characters in the local part
                    </p>
                  </div>
                )}
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={!isEmailButtonEnabled}
                    className={`px-6 py-2 rounded-md font-semibold shadow-md transition-colors focus:ring-2 focus:ring-primary ${
                      isEmailButtonEnabled
                        ? "bg-primary text-white hover:bg-primaryHover"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEmail}
                    className="px-6 py-2 border border-primary text-primary rounded-md font-semibold shadow-md transition-colors hover:bg-primary hover:text-white focus:ring-2 focus:ring-primary"
                  >
                    Cancel
                  </button>
                </div>
                {emailMessage && (
                  <p
                    className={`mt-2 text-sm ${
                      emailMessage.includes("successfully") ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {emailMessage}
                  </p>
                )}
              </form>

              <form onSubmit={handleSubmitPassword} className="space-y-2">
                <label className="block text-textPrimary dark:text-textPrimary mb-2">Current Password</label>
                <p className="p-3 bg-surface dark:bg-surface rounded-md text-textPrimary dark:text-textPrimary">
                  ••••••••
                </p>
                <div>
                  <label className="block text-textPrimary dark:text-textPrimary mb-2">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new Password"
                    value={password}
                    onChange={handlePasswordChange}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    className="w-full p-3 border border-gray-300 rounded-md bg-surface dark:bg-surface text-textPrimary dark:text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-textPrimary dark:text-textPrimary mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new Password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    className="w-full p-3 border border-gray-300 rounded-md bg-surface dark:bg-surface text-textPrimary dark:text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                {isPasswordFocused && (
                  <div className="mt-2 p-2 text-sm bg-gray-50 border rounded-md">
                    <p className={passwordCriteria.length ? "text-green-600" : "text-red-600"}>
                      {passwordCriteria.length ? "✅" : "❌"} Between 8 and 40 characters
                    </p>
                    <p className={passwordCriteria.uppercase ? "text-green-600" : "text-red-600"}>
                      {passwordCriteria.uppercase ? "✅" : "❌"} At least one uppercase letter
                    </p>
                    <p className={passwordCriteria.lowercase ? "text-green-600" : "text-red-600"}>
                      {passwordCriteria.lowercase ? "✅" : "❌"} At least one lowercase letter
                    </p>
                    <p className={passwordCriteria.number ? "text-green-600" : "text-red-600"}>
                      {passwordCriteria.number ? "✅" : "❌"} At least one number
                    </p>
                    <p className={passwordCriteria.specialCharacters ? "text-green-600" : "text-red-600"}>
                      {passwordCriteria.specialCharacters ? "✅" : "❌"} At least one special character
                      (@$!%*?&)
                    </p>
                    <p className={passwordCriteria.matchesConfirm ? "text-green-600" : "text-red-600"}>
                      {passwordCriteria.matchesConfirm ? "✅" : "❌"} Passwords match
                    </p>
                  </div>
                )}
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={!isPasswordButtonEnabled}
                    className={`px-6 py-2 rounded-md font-semibold shadow-md transition-colors focus:ring-2 focus:ring-primary ${
                      isPasswordButtonEnabled
                        ? "bg-primary text-white hover:bg-primaryHover"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelPassword}
                    className="px-6 py-2 border border-primary text-primary rounded-md font-semibold shadow-md transition-colors hover:bg-primary hover:text-white focus:ring-2 focus:ring-primary"
                  >
                    Cancel
                  </button>
                </div>
                {passwordMessage && (
                  <p
                    className={`mt-2 text-sm ${
                      passwordMessage.includes("successfully") ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {passwordMessage}
                  </p>
                )}
              </form>

              {/* <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">API Access</label>
                <select className="w-full p-3 border border-gray-300 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
            </div>
          </div>
        );
      case "Manage APIs":
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Manage APIs</h2>
            <p>Here you can manage the APIs linked to your account.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <DefaultLayout>
      <div className="flex h-screen">
        {/* Sidebar 
        <div className="w-1/4 p-6">
          <div className="space-y-4">
            <button
              onClick={() => handleSectionChange("General Settings")}
              className={`w-full text-center py-2 rounded-md ${
                activeSection === "General Settings"
                  ? "bg-primary text-white"
                  : "hover:bg-surface dark:hover:bg-surface"
              }`}
            >
              General Settings
            </button>
            <button
              onClick={() => handleSectionChange("Manage Account")}
              className={`w-full text-center py-2 rounded-md ${
                activeSection === "Manage Account"
                  ? "bg-primary text-white"
                  : "hover:bg-surface dark:hover:bg-surface"
              }`}
            >
              Manage Account
            </button>
            <button
              onClick={() => handleSectionChange("Manage APIs")}
              className={`w-full text-center py-2 rounded-md ${
                activeSection === "Manage APIs"
                  ? "bg-primary text-white"
                  : "hover:bg-surface dark:hover:bg-surface"
              }`}
            >
              Manage APIs
            </button>
          </div>
        </div>

        <div className="mt-8 w-[1px] bg-gray-300 dark:bg-gray-600"></div>

        {/* Main Content 
        <div
          className={`w-3/4 p-6 transition-opacity duration-200 ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          {renderSettings()}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Settings;

*/