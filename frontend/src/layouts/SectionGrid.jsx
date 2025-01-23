import React, { useState } from "react";
import Spinner from "../components/Spinner";
import SpotifyIcon from "../assets/Primary_Logo_Black_CMYK.svg";

const SectionGrid = ({ title, items, loading, tutorial }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <section className="bg-surface p-6 mb-8 rounded-xl">
      <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={toggleExpand}>
        <h3 className="text-lg sm:text-xl font-semibold">{title}</h3>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-5 h-5 text-onSurface transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={4}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Grid Content */}
      <div>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Spinner />
          </div>
        ) : (
          <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-5">
            {items.slice(0, isExpanded ? items.length : 5).map((item, index) => (
              <li
                key={item.id || `section-grid-${index}`}
                className="flex flex-col items-center bg-surface cursor-pointer" // rounded-lg hover:shadow-lg transition-shadow p-4
              >
                <div className="max-w-44">
                  <div className="w-full max-h-44 aspect-square rounded-md overflow-hidden flex justify-center items-center">
                    <img
                      src={item.imageUrl || "https://placehold.co/1000x1000"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm sm:text-base text-onSurface font-medium line-clamp-2">
                      <span className="font-bold text-onSurface">{index + 1}. </span>
                      {item.name}
                    </span>
                    {tutorial ? (
                      <img
                        src={"https://placehold.co/20x20"}
                        alt={item.name}
                        className="w-5 h-5 rounded-full"
                      />
                    ) : (
                      <img src={SpotifyIcon} alt="Spotify" className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default SectionGrid;
