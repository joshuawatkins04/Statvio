import React, { useState, useEffect } from "react";
import { fetchDashboardData } from "../hooks/UserAuthentication/userAuth";
import {
  getSpotifyStatus,
  getSpotifyPlaylists,
  connectToSpotify,
} from "../hooks/MusicIntegration/spotifyIntegration";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isSpotifyLinked, setIsSpotifyLinked] = useState(false);
  const [spotifyPlaylists, setSpotifyPlaylists] = useState([]);
  const [spotifyLoading, setSpotifyLoading] = useState(false);
  const [spotifyError, setSpotifyError] = useState(null);

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        const data = await fetchDashboardData();
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getDashboardData();
  }, []);

  // Check if Spotify is linked on component mount
  useEffect(() => {
    const checkSpotifyLink = async () => {
      try {
        const status = await getSpotifyStatus();
        setIsSpotifyLinked(status.linked);
      } catch (err) {
        console.error("Failed to check Spotify status:", err);
      }
    };

    checkSpotifyLink();
  }, []);

  const handleConnectSpotify = () => {
    connectToSpotify();
  };

  const handleFetchPlaylists = async () => {
    setSpotifyLoading(true);
    setSpotifyError(null);
    try {
      const data = await getSpotifyPlaylists();
      setSpotifyPlaylists(data.playlists || []);
    } catch (err) {
      setSpotifyError(err.message);
    } finally {
      setSpotifyLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Welcome to your Dashboard</h1>
      {dashboardData?.user ? (
        <div>
          <p>
            <strong>Username:</strong> {dashboardData.user.username}
          </p>
          <p>
            <strong>Email:</strong> {dashboardData.user.email}
          </p>
        </div>
      ) : (
        <p>No user data available</p>
      )}

      <div style={{ marginTop: "2rem" }}>
        {isSpotifyLinked ? (
          <div>
            <p>Your Spotify account is linked!</p>
            <button
              onClick={handleFetchPlaylists}
              className="mt-4 bg-green-600 text-white py-2 rounded-md hover:bg-green-400 transition"
              disabled={spotifyLoading}
            >
              {spotifyLoading
                ? "Fetching playlists..."
                : "Get My Spotify Playlists"}
            </button>
            {spotifyError && (
              <div className="text-red-500 mt-2">{spotifyError}</div>
            )}
            {spotifyPlaylists.length > 0 && (
              <ul className="mt-4">
                {spotifyPlaylists.map((pl) => (
                  <li
                    key={pl.id}
                    className="border p-2 mb-2 rounded flex items-center"
                  >
                    {/* Playlist image */}
                    <img
                      src={pl.imageUrl || "https://via.placeholder.com/100"}
                      alt={pl.name || "No image available"}
                      className="w-16 h-16 mr-4 rounded"
                    />
                    {/* Playlist info */}
                    <div>
                      <strong>{pl.name || "Untitled Playlist"}</strong>
                      <p>{pl.trackCount} tracks</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <button
            onClick={handleConnectSpotify}
            className="mt-4 bg-green-600 text-white py-2 rounded-md hover:bg-green-400 transition"
          >
            Connect to Spotify
          </button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
