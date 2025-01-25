import React, { useState } from "react";
import { getSpotifyPlaylists } from "../hooks/music-integration/spotify";
import {} from "../hooks/ai-integration/ai";
import SpotifyIcon from "../assets/Primary_Logo_Black_CMYK.svg";

const AI = ({ items }) => {
  const [playlistData, setPlaylistData] = useState([]);

  const handlePlaylistSelection = (item) => {
    console.log("Test", item);
  };

  return (
    <section className="bg-surface p-6 mb-8 rounded-xl">
      <h3 className="text-lg sm:text-xl font-semibold">AI Insights</h3>
      <button className="p-4 bg-primary rounded-lg text-white">Insights on playlist</button>

      <div>
        {/* {loading ? (
          <div className="flex justify-center items-center h-40">
            <Spinner />
          </div>
        ) : ( */}
        <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-5">
          {items.slice(0, items.length).map((item, index) => (
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
                    <span className="font-bold text-onSurface">{index + 1}. </span>
                    {item.name}
                  </span>

                  <img src={SpotifyIcon} alt="Spotify" className="w-5 h-5" />
                </div>
              </div>
            </li>
          ))}
        </ul>
        {/* )} */}
      </div>
    </section>
  );
};

export default AI;
