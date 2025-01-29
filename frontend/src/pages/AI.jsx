import React, { useState, useEffect } from "react";
import SpotifyIcon from "../assets/Primary_Logo_Black_CMYK.svg";
import { getAnalysis } from "../hooks/music-integration/spotify";
import Spinner from "../components/Spinner";

const AI = ({ items }) => {
  const [generatedResponse, setGeneratedResponse] = useState(
    "Waiting for mode and playlist to be selected..."
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [animationDirection, setAnimationDirection] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const totalItems = items.length;

  useEffect(() => {
    const updateItemsPerPage = () => {
      setItemsPerPage(window.innerWidth < 480 ? 1 : 5);
    };
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  useEffect(() => {
    if (mode) {
      console.log("Updated mode:", mode);
      setGeneratedResponse(`Mode selected: ${mode}. Select a playlist and then click generate...`);
    }
  }, [mode]);

  useEffect(() => {
    if (selectedPlaylist) {
      console.log("Updated selectedPlaylist:", selectedPlaylist);
    }
  }, [selectedPlaylist]);

  const handleMode = (selectedMode) => {
    setMode(selectedMode);
    console.log("Mode selected:", selectedMode);
  };

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
    try {
      setLoading(true);

      const getResponse = await getAnalysis(item);

      console.log("API response: ", getResponse);
      let response = getResponse?.data?.response || "No response received.";
      console.log("AI Response: ", response);

      setGeneratedResponse(response);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setGeneratedResponse("Failed to generate response.");
    } finally {
      setLoading(false);
      setMode("");
      setSelectedPlaylist("");
    }
  };

  return (
    <section className="bg-surface p-6 mb-8 rounded-xl relative">
      <div className="md:flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-semibold pb-2 md:pb-0">AI Insights</h3>
        <div className="space-x-2">
          <button
            onClick={() => handleMode("recommend_songs")}
            className="p-2 bg-primary hover:bg-primaryHover transition rounded-lg text-white"
          >
            Recommend Songs
          </button>
          <button
            onClick={() => handleMode("playlist_stats")}
            className="p-2 bg-primary hover:bg-primaryHover transition rounded-lg text-white"
          >
            Playlist Stats
          </button>
          {/* <button className="mt-4 p-2 bg-primary hover:bg-primaryHover transition rounded-lg text-white">
          Generate Playlist
        </button> */}
        </div>
      </div>

      <hr className="border-gray-300 my-4" />

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
            className={`grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-5 transition-transform duration-300 p-1 ${
              animationDirection === "left"
                ? "animate-slide-left"
                : animationDirection === "right"
                ? "animate-slide-right"
                : ""
            }`}
          >
            {items
              .slice(currentIndex, currentIndex + itemsPerPage)
              .concat(items.slice(0, Math.max(0, currentIndex + itemsPerPage - totalItems)))
              .map((item, index) => (
                <li
                  key={item.id || `section-grid-${index}`}
                  onClick={() => setSelectedPlaylist((prev) => (prev === item.id ? "" : item.id))}
                  className={`flex flex-col items-center bg-surface cursor-pointer rounded-lg transition-shadow ${
                    selectedPlaylist === item.id
                      ? "outline outline-2 outline-primary outline-offset-2 shadow-lg"
                      : "outline-none"
                  }`}
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
        <button
          onClick={handleNext}
          className="z-10 flex justify-center items-center bg-primary rounded-full mt-0 ml-0 md:ml-2 p-4 h-5 w-5 hover:bg-primaryHover transition text-white font-extrabold top-1/2 transform -translate-y-1/2"
        >
          &gt;
        </button>
      </div>

      <hr className="border-gray-300 my-4" />

      <div className="md:flex flex-col mt-4 mb-4">
        <div className="flex justify-between">
          <h3 className="text-lg sm:text-xl font-semibold mb-3">AI Response</h3>
          {selectedPlaylist && mode ? (
            <button
              onClick={() => handlePlaylistSelection(selectedPlaylist)}
              className="p-2 bg-primary hover:bg-primaryHover transition rounded-lg text-white"
            >
              Generate
            </button>
          ) : (
            <button disabled className="p-2 bg-gray-400 transition rounded-lg text-white cursor-not-allowed">
              Generate
            </button>
          )}
        </div>
        <div className="break-words">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Spinner />
            </div>
          ) : (
            <>
              {generatedResponse.split("\n").map((line, index) => {
                const formattedLine = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
                return <p key={index} dangerouslySetInnerHTML={{ __html: formattedLine }} className="mb-2" />;
              })}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default AI;
