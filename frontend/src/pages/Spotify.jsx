import React, { useState, useEffect } from "react";
import {
  getSpotifyStatus,
  getSpotifyOverview,
  connectToSpotify,
  unlinkSpotify,
} from "../hooks/MusicIntegration/spotifyIntegration";
import DefaultLayout from "../layouts/DefaultLayout";

const SectionList = ({ title, items }) => {
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
                <p className="font-medium text-sm sm:text-base break-words">
                  {item.name}
                </p>
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

const SectionGrid = ({ title, items }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <section className="bg-surface p-6 mb-8 rounded-xl">
      <div
        className="flex items-center justify-between mb-4 cursor-pointer"
        onClick={toggleExpand}
      >
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
            className="flex flex-col items-center text-center bg-surface rounded-md p-4 shadow hover:shadow-lg transition-shadow"
          >
            <img
              src={item.imageUrl || "https://via.placeholder.com/80"}
              alt={item.name}
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 object-cover rounded-full mb-4"
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

const SpotifyStats = () => {
  const [loading, setLoading] = useState(true);
  const [topSongs, setTopSongs] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [listeningHistory, setListeningHistory] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [spotifyConnected, setSpotifyConnected] = useState(false);

  useEffect(() => {
    const fetchConnectionStatus = async () => {
      try {
        const response = await fetch(`${__SPOTIFY_BASE_URL__}/status`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch Spotify status");
        }

        const data = await response.json();
        console.log("[Frontend] Spotify Linked Status:", data.linked);
        setSpotifyConnected(data.linked);
      } catch (error) {
        console.error("[Frontend] Error fetching Spotify status:", error.message);
      }
    };

    fetchConnectionStatus();
  }, []);

  const fetchSpotifyData = async () => {
    try {
      const status = await getSpotifyStatus();
      if (!status.linked) {
        console.log("Spotify is not connected.");
        setSpotifyConnected(false);
        return;
      }

      setSpotifyConnected(true);
      setLoading(true);

      const overviewData = await getSpotifyOverview();
      if (overviewData) {
        setTopSongs(overviewData.topSongs || []);
        setTopArtists(overviewData.topArtists || []);
        setListeningHistory(overviewData.listeningHistory || []);
        setPlaylists(overviewData.playlists || []);
        console.log("Status after overviewData: ", status);
      }
    } catch (error) {
      console.error("Error fetching Spotify data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpotifyData();
  }, []);

  const handleConnectSpotify = () => {
    connectToSpotify();
  };

  const handleUnlinkSpotify = async () => {
    try {
      await unlinkSpotify();
      setSpotifyConnected(false);
      setTopSongs([]);
      setTopArtists([]);
      setListeningHistory([]);
      setPlaylists([]);
      console.log("Unlinked Spotify successfully.");
    } catch (error) {
      console.error("Failed to unlink Spotify:", error);
    }
  };

  const handleUpdateData = async () => {
    console.log("Updating Spotify data...");
    await fetchSpotifyData();
  };

  if (loading) {
    return <p>Loading data...</p>;
  }

  return (
    <DefaultLayout title={"Your Spotify Stats"}>
      <div className="flex flex-wrap justify-end gap-4 mb-4">
        {spotifyConnected ? (
          <>
            <button onClick={handleUnlinkSpotify} className="px-4 py-2 text-xs sm:text-sm bg-red-600 text-white rounded">
              Unlink
            </button>
            <button onClick={handleUpdateData} className="px-4 py-2 text-xs sm:text-sm bg-green-600 text-white rounded">
              Update Data
            </button>
          </>
        ) : (
          <button onClick={handleConnectSpotify} className="px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded">
            Connect Spotify
          </button>
        )}
      </div>

      {/* Render data if linked */}
      {spotifyConnected && playlists.length > 0 ? (
        <div className="mt-8">
          <SectionGrid title="Recent Top Songs" items={topSongs} />
          <SectionGrid title="Top Artists" items={topArtists} />
          <SectionList title="Listening History" items={listeningHistory} />
        </div>
      ) : (
        <div className="mt-8">
          {!spotifyConnected ? (
            <p>Spotify not connected. Click "Connect Spotify" above.</p>
          ) : (
            <p>No playlists found. Try "Update Data" or check your Spotify account.</p>
          )}
        </div>
      )}
    </DefaultLayout>
  );
};

export default SpotifyStats;
