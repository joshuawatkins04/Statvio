import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import useAuthRedirect from "../hooks/UserAuthentication/userRedirect";

const Login = () => {
  useAuthRedirect();

  const { login } = useContext(AuthContext);
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(usernameOrEmail, password);
      setMessage("Login successful! Redirecting...");
      navigate("/dashboard");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="bg-backdrop min-h-screen flex flex-col justify-center items-center transition-colors duration-300 pt-28">
      {/* Card Container */}
      <div className="bg-surface p-8 shadow-md rounded-xl w-full max-w-md transition-colors duration-300">
        <h1 className="text-textPrimary dark:text-white text-2xl font-bold mb-6 text-center">
          Log In to Statvio
        </h1>
        {message && (
          <div
            className={`mb-4 p-3 text-center rounded ${
              message.includes("successful") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {message}
          </div>
        )}
        <form onSubmit={handleLogin} className="flex flex-col space-y-4">
          <div>
            <label htmlFor="usernameOrEmail" className="block text-onSurface mb-1">
              Username or Email
            </label>
            <input
              type="text"
              id="usernameOrEmail"
              className="text-onSurface w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="Username or you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-onSurface mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="text-onSurface w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="mt-4 bg-primary text-white py-2 rounded-md hover:bg-primary-dark transition"
          >
            Log In
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-textSubtle">
          Don’t have an account?{" "}
          <a href="/signup" className="text-primary hover:underline">
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
