import React from "react";
import SelectionLayout from "../layouts/SelectionLayout";
import DefaultLayout from "../layouts/DefaultLayout";

const Music = () => {
  const handleConnectSpotify = async () => {
    console.log("Connecting to Apple Music...");
    window.location.href = __SPOTIFY_DASHBOARD__;
  };

  const handleConnectAppleMusic = async () => {
    console.log("Connecting to Apple Music...");
    window.location.href = __APPLE_MUSIC_AUTH_URL__;
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
