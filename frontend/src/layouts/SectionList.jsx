import React from "react";

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

const SectionList = ({ title, items }) => {
  return (
    <section className="bg-surface p-6 mb-8 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-semibold">{title}</h3>
      </div>

      <ul className="space-y-2">
        {items.map((item, index) => (
          <li
            key={item.id || `section-list-${index}`}
            className="flex items-start p-2 bg-surface rounded-md hover:bg-gray-200 dark:hover:bg-gray-400 min-h-[70px]"
          >
            <div className="flex-shrink-0 flex items-center w-24 sm:w-28">
              <span className="w-8 text-center font-bold">{index + 1}.</span>
              <img
                src={item.imageUrl || "https://via.placeholder.com/50"}
                alt={item.name}
                className="ml-2 w-12 h-12 object-cover rounded-md"
              />
            </div>

            <div className="flex-1 ml-4 min-w-0">
              <div className="flex flex-col justify-start">
                <p className="font-medium text-sm sm:text-base break-words">{item.name}</p>
                <p className="text-xs sm:text-sm text-gray-600 break-words">
                  {item.artist || "Unknown Artist"}
                </p>
              </div>
            </div>

            <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap flex-shrink-0 ml-4">
              {timeAgo(item.played_at)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SectionList;
