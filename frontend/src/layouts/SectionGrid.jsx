import React, { useState } from "react";

const SectionGrid = ({ title, items }) => {
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
      <ul
        className={`grid gap-4 ${
          isExpanded
            ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        }`}
      >
        {items.slice(0, isExpanded ? items.length : 5).map((item, index) => (
          <li
            key={item.id || `section-grid-${index}`}
            className="flex flex-col items-center text-center bg-surface p-4 rounded-lg hover:shadow-lg transition-shadow"
          >
            <img
              src={item.imageUrl || "https://via.placeholder.com/80"}
              alt={item.name}
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 object-cover rounded-md mb-4"
            />
            <span className="text-sm sm:text-base text-onSurface font-medium">
              <span className="font-bold text-onSurface">{index + 1}. </span>
              {item.name}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SectionGrid;
