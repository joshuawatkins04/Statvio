import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getSpotifyStatus,
  getSpotifyOverview,
  getSpotifyTopSongs,
  getSpotifyTopArtists,
} from "../../hooks/music-integration/spotify";
import DefaultLayout from "../../layouts/DefaultLayout";
import SectionGrid from "../../layouts/SectionGrid";
import SectionList from "../../layouts/SectionList";
import LoadingBar from "../../components/LoadingBar";
import Spinner from "../../components/Spinner";

const SpotifyStats = () => {
  const [loading, setLoading] = useState(true);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [progress, setProgress] = useState(0);
  const [connected, setConnected] = useState(false);
  const [topSongs, setTopSongs] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [listeningHistory, setListeningHistory] = useState([]);
  const [playlists, setPlaylists] = useState([]);

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
        setConnected(data.linked);
      } catch (error) {
        console.error("[Frontend] Error fetching Spotify status:", error.message);
      }
    };

    fetchConnectionStatus();
  }, []);

  const fetchSpotifyData = async () => {
    try {
      setLoading(true);
      setProgress(0);

      const status = await getSpotifyStatus();
      setProgress(25);
      if (!status.linked) {
        console.log("Spotify is not connected.");
        setConnected(false);
        return;
      }

      setConnected(true);

      const overviewData = await getSpotifyOverview();
      setProgress(60);
      if (overviewData) {
        setTopSongs(overviewData.topSongs || []);
        setTopArtists(overviewData.topArtists || []);
        setListeningHistory(overviewData.listeningHistory || []);
        setPlaylists(overviewData.playlists || []);
        console.log("Status after overviewData: ", status);
      }
      setProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Error fetching Spotify data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpotifyData();
  }, []);

  const handleUpdateData = async () => {
    console.log("Updating Spotify data...");
    await fetchSpotifyData();
  };

  const fetchTopSongs = async (timeRange) => {
    try {
      setLoadingSongs(true);
      const response = await getSpotifyTopSongs(timeRange);
      if (response) {
        setTopSongs(response.topSongs || []);
      }
    } catch (error) {
      console.error("Error fetching top songs:", error);
    } finally {
      setLoadingSongs(false);
    }
  };

  const fetchTopArtists = async (timeRange) => {
    try {
      setLoadingArtists(true);
      const response = await getSpotifyTopArtists(timeRange);
      if (response) {
        setTopArtists(response.topArtists || []);
      }
    } catch (error) {
      console.error("Error fetching top artists:", error);
    } finally {
      setLoadingArtists(false);
    }
  };

  const handleTimeRangeChange = async (timeRange) => {
    fetchTopSongs(timeRange);
    fetchTopArtists(timeRange);
  };

  if (loading) {
    return <LoadingBar progress={progress} />;
  }

  return (
    <DefaultLayout title={"Your Spotify Stats"}>
      {connected && playlists.length > 0 ? (
        <>
          <section className="p-6 mb-8 bg-surface rounded-xl flex flex-row items-center justify-center">
            <div className="space-x-0 space-y-2 sm:space-x-2 sm:space-y-0">
              <button
                onClick={() => handleTimeRangeChange("short_term")}
                className="min-w-32 border border-outline hover:border-surface text-textSecondary hover:text-white hover:bg-primary font-semibold px-4 py-2 rounded-xl transition"
              >
                4 Weeks
              </button>
              <button
                onClick={() => handleTimeRangeChange("medium_term")}
                className="min-w-32 border border-outline hover:border-surface text-textSecondary hover:text-white hover:bg-primary font-semibold px-4 py-2 rounded-xl transition"
              >
                6 Months
              </button>
              <button
                onClick={() => handleTimeRangeChange("long_term")}
                className="min-w-32 border border-outline hover:border-surface text-textSecondary hover:text-white hover:bg-primary font-semibold px-4 py-2 rounded-xl transition"
              >
                Lifetime
              </button>
            </div>

            {connected ? (
              <>
                <Link
                  to="/settings?section=manage-api"
                  className="px-4 py-2 text-xs sm:text-sm font-semibold underline"
                >
                  Unlink
                </Link>
                <span
                  onClick={handleUpdateData}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold underline cursor-pointer"
                >
                  Update Data
                </span>
              </>
            ) : (
              <>
                <Link
                  to="/settings?section=manage-api"
                  className="px-4 py-2 text-xs sm:text-sm font-semibold underline"
                >
                  Connect Spotify
                </Link>
              </>
            )}
          </section>

          <SectionGrid title="Top Songs" items={topSongs} loading={loadingSongs} />
          <SectionGrid title="Top Artists" items={topArtists} loading={loadingArtists} />
          <SectionList title="Listening History" items={listeningHistory} />
        </>
      ) : (
        <div className="mt-8">
          {!connected ? (
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
