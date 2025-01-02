import React from "react";
import { useNavigate } from "react-router-dom";
import SelectionLayout from "../layouts/SelectionLayout";
import DefaultLayout from "../layouts/DefaultLayout";
import { connectToSpotify } from "../hooks/MusicIntegration/spotifyIntegration";

const Music = () => {
  const handleConnectSpotify = async () => {
    connectToSpotify();
  };

  const handleConnectAppleMusic = async () => {
    console.log("Connecting to Apple Music...");
    window.location.href = "http://localhost:5000/api/music/apple/auth";
  };

  return (
    <DefaultLayout>
      <div className="grid grid-rows-1 md:grid-rows-2 gap-6">
        <SelectionLayout
          title="Spotify"
          bodyText="Connect your Spotify account to stream music seamlessly."
          connectToService={handleConnectSpotify}
          buttonText="Connect to Spotify"
        />
        <SelectionLayout
          title="Apple Music"
          bodyText="Connect your Apple Music account for an enriched experience."
          connectToService={handleConnectAppleMusic}
          buttonText="Connect to Apple Music"
        />
      </div>
    </DefaultLayout>
  );
};

export default Music;
