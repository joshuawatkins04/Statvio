import React, { useState, useEffect } from "react";
import { getSpotifyStatus, getSpotifyOverview } from "../hooks/MusicIntegration/spotifyIntegration";
import DefaultLayout from "../layouts/DefaultLayout";

const SectionGrid = ({ title, items }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <section className="bg-surface p-6 mb-8 rounded-xl">
      <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={toggleExpand}>
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
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

      {/* Content */}
      <ul className={`grid gap-2 ${isExpanded ? "grid-cols-5" : "grid-cols-5"}`}>
        {items.slice(0, isExpanded ? items.length : 5).map((item, index) => (
          <li key={item.id} className="flex flex-col items-center text-center">
            <img
              src={item.imageUrl || "https://via.placeholder.com/80"}
              alt={item.name}
              className="w-40 h-40 object-cover rounded-md mb-4"
            />
            <span className="text-onSurface">
              <span className="font-bold text-onSurface">{index + 1}. </span>
              {item.name}
            </span>
          </li>
        ))}
      </ul>
      {/* 
      
      <h3 className="text-xl font-semibold mb-4">Listening History</h3>
      <ul>
        {listenHistory.map((item) => (
          <div key={item.id}>
            <img
              src={item.imageUrl || "https://via.placeholder.com/80"}
              alt={item.name}
              className="w-16 h-16 rounded-md mr-4"
            />
            <li className="mb-2 text-onSurface">
              {item.name}
              {item.artist}
              {item.played_at}
            </li>
          </div>
        ))}
      </ul>

      <h3 className="text-xl font-semibold mb-4">Your Spotify Playlists</h3>
      <ul>
        {playlists.map((item) => (
          <div key={item.id} className="flex items-center p-4 bg-surface rounded-lg shadow">
            <img
              src={item.imageUrl || "https://via.placeholder.com/80"}
              alt={item.name}
              className="w-16 h-16 rounded-md mr-4"
            />
            <li className="mb-2 text-onSurface">{item.name}</li>
          </div>
        ))}
      </ul> */}
    </section>
  );
};

const SpotifyStats = () => {
  const [loading, setLoading] = useState(true);
  const [topSongs, setTopSongs] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [listenHistory, setListenHistory] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    const fetchSpotifyData = async () => {
      try {
        const status = await getSpotifyStatus();
        if (!status.linked) {
          console.log("Spotify is not connected.");
          return;
        }

        setLoading(true);

        const overviewData = await getSpotifyOverview();
        if (overviewData) {
          setTopSongs(overviewData.topSongs);
          setTopArtists(overviewData.topArtists);
          setListenHistory(overviewData.listeningHistory);
          setPlaylists(overviewData.playlists);
        }
      } catch (error) {
        console.error("Error fetching Spotify data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpotifyData();
  }, []);

  if (loading) {
    return <p>Loading data...</p>;
  }

  if (playlists.length === 0) {
    return <p>No playlists found. Connect Spotify to get your playlists.</p>;
  }

  return (
    <DefaultLayout title={"Your Spotify Stats"}>
      <div className="mt-8">
        <SectionGrid title="Recent Top Songs" items={topSongs} />
        <SectionGrid title="Top Artists" items={topArtists} />
      </div>
    </DefaultLayout>
  );
};

export default SpotifyStats;
