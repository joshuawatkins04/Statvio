import React, { useState } from "react";
import SpotifyIcon from "../assets/Primary_Logo_Black_CMYK.svg";

const timeAgo = (isoTimestamp) => {
  const now = new Date();
  const past = new Date(isoTimestamp);
  const diffMs = now - past;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (seconds > 0) return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
  return "just now";
};

const SectionList = ({ title, items, tutorial }) => {
  const [showItems, setShowItems] = useState(false);
  return (
    <section className="bg-surface p-6 mb-8 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-semibold">{title}</h3>
      </div>

      <hr className="border-gray-300 my-4" />

      <ul className="space-y-2">
        {items.slice(0, showItems ? items.length : 10).map((item, index) => (
          <li
            key={`${item.id || "no-id"}-${index}`}
            className="flex items-start p-2 bg-surface rounded-md hover:bg-gray-200 dark:hover:bg-gray-400 min-h-[70px]"
          >
            <div className="flex-shrink-0 flex items-center w-24 sm:w-28">
              <span className="w-8 text-center font-bold">{index + 1}.</span>
              <a href={item.track_url} target="_blank" rel="noopener noreferrer">
                <img
                  src={item.image_url || "https://placehold.co/48x48"}
                  alt={item.name}
                  className="ml-2 w-12 h-12 object-cover rounded-md"
                />
              </a>
            </div>

            <div className="flex-1 ml-4 min-w-0 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex justify-start">
                  <a href={item.track_url} target="_blank" rel="noopener noreferrer">
                    <p className="font-medium text-sm sm:text-base break-words">{item.name}</p>
                  </a>
                  {tutorial ? (
                    <img
                      src={"https://placehold.co/20x20"}
                      alt={item.name}
                      className="mx-2 w-5 h-5 rounded-full"
                    />
                  ) : (
                    <a href={item.track_url} target="_blank" rel="noopener noreferrer">
                      <img src={SpotifyIcon} alt="Spotify" className="mx-2 w-5 h-5" />
                    </a>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 break-words">
                  <a href={item.artist_url} target="_blank" rel="noopener noreferrer">
                    {item.artist || "Unknown Artist"}
                  </a>
                </p>
              </div>

              <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap flex-shrink-0">
                {timeAgo(item.played_at)}
              </span>
            </div>
          </li>
        ))}
        {items.length > 10 && (
          <button
            onClick={() => setShowItems(!showItems)}
            className="mt-2 px-4 py-2 text-sm font-medium text-gray-500 hover:underline"
          >
            {showItems ? "Show Less" : "Show More"}
          </button>
        )}
      </ul>
    </section>
  );
};

export default SectionList;
