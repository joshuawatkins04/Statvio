import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../hooks/UserAuthentication/userAuth";
import useAuthRedirect from "../hooks/UserAuthentication/userRedirect";

const Signup = () => {
  useAuthRedirect();

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

  const navigate = useNavigate();

  const validateUsername = (username) => {
    const criteria = {
      length: username.length >= 4 && username.length <= 20,
      validCharacters: /^[a-zA-Z0-9_]*$/.test(username),
      noSpaces: !/\s/.test(username),
    };
    setUsernameCriteria(criteria);
    return Object.values(criteria).every((value) => value === true);
  };

  const validateEmail = (email) => {
    const criteria = {
      length: email.length >= 5 && email.length <= 45,
      hasAtSymbol: /@/.test(email),
      hasDomain: /@[a-zA-Z0-9.-]+/.test(email),
      hasValidTLD: /\.[a-zA-Z]{2,}$/.test(email),
      noSpaces: !/\s/.test(email),
      validCharacters: /^[a-zA-Z0-9._%+-]+@/.test(email),
    };
    setEmailCriteria(criteria);
    return Object.values(criteria).every(Boolean);
  };

  const validatePassword = (password, confirmPassword) => {
    const criteria = {
      length: password.length >= 8 && password.length <= 40,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialCharacters: /[@$!%*?&]/.test(password),
      matchesConfirm: password === confirmPassword && confirmPassword !== "",
    };
    setPasswordCriteria(criteria);
    return Object.values(criteria).every(Boolean);
  };

  const handleUsernameChange = (e) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    validateUsername(newUsername);
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    validateEmail(newEmail);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword, confirmPassword);
  };
  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    validatePassword(password, newConfirmPassword);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateUsername(username)) {
      setMessage("Username does not meet criteria.");
      return;
    }
    if (!validateEmail(email)) {
      setMessage("Email does not meet criteria.");
      return;
    }
    if (!validatePassword(password, confirmPassword)) {
      setMessage("Password does not meet the criteria.");
      return;
    }
    try {
      await registerUser(username, email, password);
      setMessage("Registration successful");
      navigate("/login");
    } catch (error) {
      setMessage("Registration failed: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center items-center">
      {/* Card Container */}
      <div className="bg-white p-8 shadow-md rounded-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-neutral-900 mb-6 text-center">Create Your Statvio Account</h1>
        {/* Display Message */}
        {message && (
          <div
            className={`mb-4 p-3 text-center rounded ${
              message.includes("successful") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {message}
          </div>
        )}
        <form onSubmit={handleRegister} className="flex flex-col space-y-4">
          <div>
            <label htmlFor="username" className="block text-onSurface mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="text-onSurface w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
              value={username}
              onChange={handleUsernameChange}
              onFocus={() => setIsUsernameFocused(true)}
              onBlur={() => setIsUsernameFocused(false)}
              placeholder="Enter your username"
              maxLength={20}
              required
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

          <div>
            <label htmlFor="email" className="block text-onSurface mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              className="text-onSurface w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
              value={email}
              onChange={handleEmailChange}
              onFocus={() => setIsEmailFocused(true)}
              onBlur={() => setIsEmailFocused(false)}
              maxLength={45}
              placeholder="you@example.com"
              required
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

          <div>
            <label htmlFor="password" className="block text-onSurface mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="text-onSurface w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
              value={password}
              onChange={handlePasswordChange}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              maxLength={40}
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-onSurface mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="text-onSurface w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              maxLength={40}
              placeholder="••••••••"
              required
            />
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
                  {passwordCriteria.specialCharacters ? "✅" : "❌"} At least one special character (@$!%*?&)
                </p>
                <p className={passwordCriteria.matchesConfirm ? "text-green-600" : "text-red-600"}>
                  {passwordCriteria.matchesConfirm ? "✅" : "❌"} Passwords match
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="mt-4 bg-accent text-white py-2 rounded-md hover:bg-accent-dark transition"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-textSubtle">
          Already have an account?{" "}
          <a href="/login" className="text-primary hover:underline">
            Log In
          </a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
