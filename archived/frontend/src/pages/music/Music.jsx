import React from "react";
import SelectionLayout from "../../layouts/SelectionLayout";
import DefaultLayout from "../../layouts/DefaultLayout";

const Music = () => {
  const handleConnectSpotify = async () => {
    console.log("Connecting to Spotify...");
    window.location.href = __SPOTIFY_DASHBOARD__;
  };

  const handleConnectSoundcloud = async () => {
    console.log("Connecting to Soundcloud...");
    window.location.href = __SOUNDCLOUD_DASHBOARD__;
  };

  return (
    <DefaultLayout>
      <div className="grid grid-rows-1 md:grid-rows-2 gap-6">
        <SelectionLayout
          title="Spotify"
          bodyText="Connect your Spotify account to view insights and more!"
          connectToService={handleConnectSpotify}
          buttonText="Connect to Spotify"
        />
        <SelectionLayout
          title="Soundcloud"
          bodyText="Connect your Soundcloud account to view insights and more!"
          connectToService={handleConnectSoundcloud}
          buttonText="Connect to Soundcloud"
        />
      </div>
    </DefaultLayout>
  );
};

export default Music;
