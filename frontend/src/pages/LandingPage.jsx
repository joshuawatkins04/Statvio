import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col dark:text-onSurface">
      {/* Hero Section */}
      <header className="relative flex flex-col justify-center items-center text-center px-8 pt-16 h-screen">
        {/* Animation Section */}
        <div className="area">
          <ul className="circles">
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
          </ul>
        </div>
		
        {/* Header Content */}
        <h1 className="text-5xl font-extrabold text-textPrimary dark:text-textPrimary mb-4">
          Welcome to{" "}
          <span className="text-primary dark:text-primary">Statvio</span>
        </h1>
        <p className="text-lg text-textSubtle dark:text-textSecondary max-w-2xl mb-8">
          The one-stop hub for tracking and understanding your streaming habits 
          across all your favorite platforms.
        </p>
        <div>
          <Link
            to="/signup"
            className="mr-4 px-6 py-3 bg-primary dark:bg-primary text-white dark:text-white rounded-md font-semibold shadow-md transition-colors hover:bg-primaryHover dark:hover:bg-primaryHover"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 border border-primary dark:border-primary text-primary dark:text-primary rounded-md font-semibold shadow-md transition-colors hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-white"
          >
            Log In
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="bg-backdrop dark:bg-backdrop shadow-inner py-10 transition-colors duration-300">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-6">
          {/* Feature 1 */}
          <div className="p-4 flex flex-col items-center">
            <div className="w-12 h-12 mb-3 bg-highlight text-white flex items-center justify-center rounded-full">
              <span className="font-bold">AI</span>
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-textPrimary mb-2">
              AI-Powered Insights
            </h2>
            <p className="text-textSubtle dark:text-textSecondary text-center">
              Personalized suggestions and analytics for your music & podcast habits.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-4 flex flex-col items-center">
            <div className="w-12 h-12 mb-3 bg-primary dark:bg-primary text-white flex items-center justify-center rounded-full">
              <span className="font-bold">MP</span>
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-textPrimary mb-2">
              Multi-Platform Tracking
            </h2>
            <p className="text-textSubtle dark:text-textSecondary text-center">
              Combine your Spotify, Apple Music, and more in a single dashboard.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-4 flex flex-col items-center">
            <div className="w-12 h-12 mb-3 bg-accent dark:bg-accent text-white flex items-center justify-center rounded-full">
              <span className="font-bold">RT</span>
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-textPrimary mb-2">
              Real-Time Stats
            </h2>
            <p className="text-textSubtle dark:text-textSecondary text-center">
              View your most-played tracks, artists, and trends as they evolve daily.
            </p>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-14 bg-surface dark:bg-surface transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-textPrimary mb-8">
            Our Impact
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {/* Statistic 1 */}
            <div className="flex flex-col items-center">
              <div className="text-4xl font-extrabold text-primary dark:text-primary mb-2">
                N/A
              </div>
              <p className="text-lg text-textSubtle dark:text-textSecondary">
                Users Worldwide
              </p>
            </div>
            {/* Statistic 2 */}
            <div className="flex flex-col items-center">
              <div className="text-4xl font-extrabold text-primary dark:text-primary mb-2">
                N/A
              </div>
              <p className="text-lg text-textSubtle dark:text-textSecondary">
                Data Points Collected
              </p>
            </div>
            {/* Statistic 3 */}
            <div className="flex flex-col items-center">
              <div className="text-4xl font-extrabold text-primary dark:text-primary mb-2">
                N/A
              </div>
              <p className="text-lg text-textSubtle dark:text-textSecondary">
                Supported Platforms
              </p>
            </div>
            {/* Statistic 4 */}
            <div className="flex flex-col items-center">
              <div className="text-4xl font-extrabold text-primary dark:text-primary mb-2">
                N/A
              </div>
              <p className="text-lg text-textSubtle dark:text-textSecondary">
                Uptime Reliability
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-14 bg-backdrop dark:bg-backdrop transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-textPrimary mb-8">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary dark:bg-primary rounded-full flex items-center justify-center mb-4 text-white font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-textPrimary mb-2">
                Connect Your Accounts
              </h3>
              <p className="text-textSubtle dark:text-textSecondary max-w-sm">
                Link your Spotify, Apple Music, and other streaming services 
                with Statvio in a few easy steps.
              </p>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-accent dark:bg-accent rounded-full flex items-center justify-center mb-4 text-white font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-textPrimary mb-2">
                Get Insights
              </h3>
              <p className="text-textSubtle dark:text-textSecondary max-w-sm">
                AI-powered dashboards show your top genres, artists, and more, 
                plus personalized recommendations.
              </p>
            </div>
            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-highlight dark:bg-highlight rounded-full flex items-center justify-center mb-4 text-white font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-textPrimary mb-2">
                Stay Tuned
              </h3>
              <p className="text-textSubtle dark:text-textSecondary max-w-sm">
                Explore real-time updates, track your daily, weekly or monthly 
                stats, and watch how your favorites evolve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto p-6 bg-surface dark:bg-surface text-center text-sm text-textSubtle dark:text-onSurface border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
        © {new Date().getFullYear()} Statvio. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
