import React, { useState, useEffect } from "react";
import { getSpotifyPlaylists } from "../hooks/music-integration/spotify";
import {} from "../hooks/ai-integration/ai";
import SpotifyIcon from "../assets/Primary_Logo_Black_CMYK.svg";

import { getAnalysis } from "../hooks/music-integration/spotify";

const AI = ({ items }) => {
  const [playlistData, setPlaylistData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [animationDirection, setAnimationDirection] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const totalItems = items.length;

  useEffect(() => {
    const updateItemsPerPage = () => {
      setItemsPerPage(window.innerWidth < 640 ? 1 : 5);
    };
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  const handlePrev = () => {
    setAnimationDirection("left");
    setAnimationKey((prevKey) => prevKey + 1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalItems) % totalItems);
  };

  const handleNext = () => {
    setAnimationDirection("right");
    setAnimationKey((prevKey) => prevKey + 1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalItems);
  };

  const handlePlaylistSelection = async (item) => {
    console.log("Test", item);

    const response = await getAnalysis(item);

    console.log("response: ", response.data);
    // item is the playlist specific ID
    // send the ID to backend route for specific playlist data
    // backend gets data
    // returns data back here
    // sets setPlaylistData variable to the data
  };

  return (
    <section className="bg-surface p-6 mb-8 rounded-xl relative">
      <div className="md:flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-semibold">AI Insights</h3>
        <button className="p-2 bg-primary rounded-lg text-white">Recommend Songs</button>
      </div>
      <div className="flex justify-between items-center relative">
        <button
          onClick={handlePrev}
          className="z-10 flex justify-center items-center bg-primary rounded-full mt-0 mr-0 md:mr-2 p-4 h-5 w-5 hover:bg-primaryHover transition text-white font-extrabold top-1/2 transform -translate-y-1/2"
        >
          &lt;
        </button>

        <div className="relative w-full overflow-hidden">
          <ul
            key={animationKey}
            className={`grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-5 transition-transform duration-300 ${
              animationDirection === "left"
                ? "animate-slide-left"
                : animationDirection === "right"
                ? "animate-slide-right"
                : ""
            }`}
          >
            {/* {items.slice(0, items.length).map((item, index) => ( */}
            {items
              .slice(currentIndex, currentIndex + itemsPerPage)
              .concat(items.slice(0, Math.max(0, currentIndex + itemsPerPage - totalItems)))
              .map((item, index) => (
                <li
                  key={item.id || `section-grid-${index}`}
                  onClick={() => handlePlaylistSelection(item)}
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
                        <span className="font-bold text-onSurface">
                          {currentIndex + index + 1 > totalItems
                            ? currentIndex + index + 1 - totalItems
                            : currentIndex + index + 1}
                          .
                        </span>{" "}
                        {item.name}
                      </span>

                      <img src={SpotifyIcon} alt="Spotify" className="w-5 h-5" />
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
        {/* )} */}
        <button
          onClick={handleNext}
          className="z-10 flex justify-center items-center bg-primary rounded-full mt-0 ml-0 md:ml-2 p-4 h-5 w-5 hover:bg-primaryHover transition text-white font-extrabold top-1/2 transform -translate-y-1/2"
        >
          &gt;
        </button>
      </div>
    </section>
  );
};

export default AI;
