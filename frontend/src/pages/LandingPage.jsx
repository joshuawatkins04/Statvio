import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-primary">Statly</h1>
        <div>
          <Link
            to="/login"
            className="mr-4 text-textSubtle hover:text-neutral-900"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="flex-1 flex flex-col justify-center items-center text-center px-8">
        <h1 className="text-5xl font-extrabold text-neutral-900 mb-6">
          Welcome to <span className="text-primary">Statly</span>
        </h1>
        <p className="text-lg text-textSubtle mb-8 max-w-2xl">
          Track your streaming habits with personalized AI insights and
          multi-platform analytics.
        </p>
        <div>
          <Link
            to="/signup"
            className="mr-4 px-6 py-3 bg-accent text-white rounded-md font-medium hover:bg-accent-dark"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 border border-accent text-accent rounded-md font-medium hover:bg-accent-light hover:text-white transition"
          >
            Log In
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="bg-white shadow-inner py-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-6">
          <div className="p-4 flex flex-col items-center">
            <div className="w-12 h-12 mb-3 bg-highlight text-white flex items-center justify-center rounded-full">
              <span className="font-bold">AI</span>
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              AI-Powered Insights
            </h2>
            <p className="text-textSubtle text-center">
              Personalized suggestions and analytics for your music & podcast
              habits.
            </p>
          </div>
          <div className="p-4 flex flex-col items-center">
            <div className="w-12 h-12 mb-3 bg-primary text-white flex items-center justify-center rounded-full">
              <span className="font-bold">MP</span>
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Multi-Platform Tracking
            </h2>
            <p className="text-textSubtle text-center">
              Combine your Spotify, Apple Music, and more in a single dashboard.
            </p>
          </div>
          <div className="p-4 flex flex-col items-center">
            <div className="w-12 h-12 mb-3 bg-accent text-white flex items-center justify-center rounded-full">
              <span className="font-bold">RT</span>
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Real-Time Stats
            </h2>
            <p className="text-textSubtle text-center">
              View your most-played tracks, artists, and trends as they evolve
              daily.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="p-6 bg-neutral-50 text-center text-sm text-textSubtle border-t border-gray-200">
        © {new Date().getFullYear()} Statly. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
