import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import {
  connectToSpotify,
  unlinkSpotify,
  connectToSoundcloud,
  unlinkSoundcloud,
} from "../../hooks/music-integration";

const apiConfig = [
  {
    name: "Spotify",
    connect: connectToSpotify,
    unlink: unlinkSpotify,
  },
  {
    name: "Soundcloud",
    connect: connectToSoundcloud,
    unlink: unlinkSoundcloud,
  },
];

const ManageApis = () => {
  const { user, updateApiInfo } = useContext(AuthContext);
  const [apis, setApis] = useState(user?.apisLinked || []);
  const [apiCount, setApiCount] = useState(user?.apiCount || 0);

  const updateData = async () => {
    try {
      const { apiCount, apisLinked } = await updateApiInfo();
      setApis(apisLinked || []);
      setApiCount(apiCount || 0);
    } catch (error) {
      console.error("Failed to update APIs:", error.message);
    }
  };

  useEffect(() => {
    updateData();
  }, []);

  const handleConnect = async (connectFunction) => {
    try {
      await connectFunction();
    } catch (error) {
      console.error("Failed to connect Spotify:", error.message);
    }
  };

  const handleUnlink = async (unlinkFunction) => {
    try {
      await unlinkFunction();
      console.log("Unlinked Spotify successfully.");
      await updateData();
    } catch (error) {
      console.error("Failed to unlink Spotify:", error.message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Manage APIs</h2>
      <p className="mb-2">Here you can manage the APIs linked to your account.</p>
      <p className="mb-10">Amount of APIs linked: {apiCount}</p>
      <div className="grid gap-4">
        {apiConfig.map((api) => {
          const isLinked = apis.includes(api.name);

          return (
            <div
              key={api.name}
              className="flex flex-col md:flex-row justify-between bg-surface md:items-center p-6 rounded-xl transition-colors"
            >
              <h3 className="mb-2 text-textPrimary text-lg font-semibold">{api.name}</h3>
              <div className="flex gap-4">
                {isLinked ? (
                  <button
                    type="button"
                    disabled
                    className="w-full md:w-auto px-4 py-2 rounded-md font-semibold shadow-md transition-colors focus:ring-2 focus:ring-primary bg-gray-300 text-white cursor-not-allowed"
                  >
                    Linked
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleConnect(api.connect)}
                      className="w-full md:w-auto px-4 py-2 rounded-md font-semibold shadow-md transition-colors focus:ring-2 focus:ring-primary bg-primary text-white hover:bg-primaryHover"
                    >
                      Link
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => handleUnlink(api.unlink)}
                  className="w-full md:w-auto px-4 py-2 border border-red-500 text-red-500 rounded-md font-semibold shadow-md transition-colors hover:bg-red-500 hover:text-white focus:ring-2 focus:ring-primary"
                >
                  Unlink
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ManageApis;
