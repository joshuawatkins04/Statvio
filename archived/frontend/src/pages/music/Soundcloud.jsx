import React, { useState, useEffect } from "react";
import {
  getSoundcloudStatus,
  getSoundcloudOverview,
  connectToSoundcloud,
  unlinkSoundcloud,
} from "../../hooks/music-integration/soundcloud";
import DefaultLayout from "../../layouts/DefaultLayout";
import SectionGrid from "../../layouts/SectionGrid";
import SectionList from "../../layouts/SectionList";
import LoadingBar from "../../components/LoadingBar";

const Soundcloud = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [connected, setConnected] = useState(false);
  const [topSongs, setTopSongs] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [listeningHistory, setListeningHistory] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    const fetchConnectionStatus = async () => {
      try {
        const response = await fetch(`${__SOUNDCLOUD_BASE_URL__}/status`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch Soundcloud status");
        }

        const data = await response.json();
        console.log("[Frontend] Soundcloud Linked Status:", data.linked);
        setConnected(data.linked);
      } catch (error) {
        console.error("[Frontend] Error fetching Soundcloud status:", error.message);
      }
    };

    fetchConnectionStatus();
  }, []);

  const fetchSoundcloudData = async () => {
    try {
      setLoading(true);
      setProgress(0);

      const status = await getSoundcloudStatus();
      setProgress(25);
      if (!status.linked) {
        console.log("Soundcloud is not connected.");
        setConnected(false);
        return;
      }

      setConnected(true);

      const overviewData = await getSoundcloudOverview();
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
      console.error("Error fetching Soundcloud data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoundcloudData();
  }, []);

  const handleConnect = () => {
    connectToSoundcloud();
  };

  const handleUnlink = async () => {
    try {
      await unlinkSoundcloud();
      setConnected(false);
      setTopSongs([]);
      setTopArtists([]);
      setListeningHistory([]);
      setPlaylists([]);
      console.log("Unlinked Soundcloud successfully.");
    } catch (error) {
      console.error("Failed to unlink Soundcloud:", error);
    }
  };

  const handleUpdateData = async () => {
    console.log("Updating Soundcloud data...");
    await fetchSoundcloudData();
  };

  if (loading) {
    return <LoadingBar progress={progress} />;
  }

  return (
    <DefaultLayout title={"Your Soundcloud Stats"}>
      <div>
        {connected ? (
          <>
            <button
              onClick={handleUnlink}
              className="px-4 py-2 text-xs sm:text-sm bg-red-600 text-white rounded"
            >
              Unlink
            </button>
            <button
              onClick={handleUpdateData}
              className="px-4 py-2 text-xs sm:text-sm bg-green-600 text-white rounded"
            >
              Update Data
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleConnect}
              className="px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded"
            >
              Connect Soundcloud
            </button>
          </>
        )}
      </div>

      {connected && playlists.length > 0 ? (
        <div className="mt-8">
          <SectionGrid title="Recent Top Songs" items={topSongs} />
          <SectionGrid title="Top Artists" items={topArtists} />
          <SectionList title="Listening History" items={listeningHistory} />
        </div>
      ) : (
        <div className="mt-8">
          {!connected ? (
            <p> not connected. Click "Connect Soundcloud" above.</p>
          ) : (
            <p>No playlists found. Try "Update Data" or check your Soundcloud account.</p>
          )}
        </div>
      )}
    </DefaultLayout>
  );
};

export default Soundcloud;
