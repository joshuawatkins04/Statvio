import React, { useState, useEffect } from "react";
import {
  getSpotifyStatus,
  getSpotifyPlaylists,
  connectToSpotify,
} from "../hooks/MusicIntegration/spotifyIntegration";
import DefaultLayout from "../layouts/defaultLayout";

const Spotify = () => {
  const [isSpotifyLinked, setIsSpotifyLinked] = useState(false);
  const [spotifyPlaylists, setSpotifyPlaylists] = useState([]);
  const [spotifyLoading, setSpotifyLoading] = useState(false);
  const [spotifyError, setSpotifyError] = useState(null);

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

  return (
    <DefaultLayout>
      <div className="shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Spotify Integration</h2>
        {isSpotifyLinked ? (
          <div>
            <p>Your Spotify account is linked!</p>
            <button
              onClick={handleFetchPlaylists}
              className="mt-4 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-400 transition"
              disabled={spotifyLoading}
            >
              {spotifyLoading ? "Fetching playlists..." : "Get My Spotify Playlists"}
            </button>
            {spotifyError && <p className="text-red-500 mt-2">{spotifyError}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {spotifyPlaylists.map((playlist) => (
                <div key={playlist.id} className="flex items-center p-4 bg-gray-100 rounded-lg shadow">
                  <img
                    src={playlist.imageUrl || "https://via.placeholder.com/80"}
                    alt={playlist.name}
                    className="w-16 h-16 rounded mr-4"
                  />
                  <div>
                    <p className="font-bold">{playlist.name || "Untitled Playlist"}</p>
                    <p className="text-sm text-gray-600">{playlist.trackCount} tracks</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <button
            onClick={handleConnectSpotify}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-400 transition"
          >
            Connect to Spotify
          </button>
        )}
      </div>
    </DefaultLayout>
  );
};

export default Spotify;
