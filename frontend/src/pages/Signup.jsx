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
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Password does not match");
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
            <label htmlFor="username" className="block text-textSubtle mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="text-textSubtle w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-textSubtle mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="text-textSubtle w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-textSubtle mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="text-textSubtle w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-textSubtle mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
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
