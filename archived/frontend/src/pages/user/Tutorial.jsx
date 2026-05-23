import React, { useState, useEffect, useRef, useContext } from "react";
import DefaultLayout from "../../layouts/DefaultLayout";
import SectionGrid from "../../layouts/SectionGrid";
import SectionList from "../../layouts/SectionList";
import { updateTutorialStatus } from "../../hooks/user-management/userAuth";
import { AuthContext } from "../../contexts/AuthContext";
import { exampleTopSongs, exampleTopArtists, exampleListeningHistory } from "./TutorialContent";

const Box = ({ title, body }) => {
  return (
    <div className="animate-fadeIn select-none text-center bg-surface rounded-lg p-5 shadow-md transition hover:scale-105 cursor-default">
      <h1 className="text-textPrimary text-xl font-bold mb-4">{title}</h1>
      <p className="text-textSecondary">{body}</p>
    </div>
  );
};

const Tutorial = () => {
  const { user } = useContext(AuthContext);
  const [click, setClick] = useState(false);
  const [render, setRender] = useState(false);
  const contentRef = useRef(null);

  const [topSongs] = useState(exampleTopSongs);
  const [topArtists] = useState(exampleTopArtists);
  const [listeningHistory] = useState(exampleListeningHistory);

  const [loadingSongs, setLoadingSongs] = useState(true);
  const [loadingArtists, setLoadingArtists] = useState(true);

  const handleClick = () => {
    setClick(true);

    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 0);
  };

  const handleRedirect = async () => {
    try {
      const response = await updateTutorialStatus(true);
      console.log(response);
      window.location.reload();
    } catch (error) {
      console.error("Error redirecting:", error);
    }
  };

  return (
    <>
      <DefaultLayout title="How to use Statvio!" position="center">
        {/* <div className="grid grid-rows-3 gap-2 md:grid-cols-3 md:gap-6">  mt-32 md:mt-0*/}
        <div className="grid grid-rows-3 md:grid-rows-none md:grid-cols-3 gap-6">
          {/* <div className="grid grid-cols-3 gap-6"> */}
          <Box
            title="1. Welcome to Statvio!"
            body="Your one-stop hub for connecting and managing all your favourite streaming services and apps in one place."
          />
          <Box
            title="2. How to use"
            body="Navigate to your dashboard, select the service you want, connect your account, and start exploring your stats!"
          />
          <Box
            title="3. Try for yourself!"
            body="Click the connect button below and see how Statvio works for you!"
          />
        </div>

        <div className="flex justify-center items-center animate-fadeIn">
          <button
            onClick={handleClick}
            className="mt-10 hover:bg-primaryHover shadow-md hover:shadow-lg transition bg-primary rounded-md p-4 text-white font-semibold"
          >
            Connect to Statvio!
          </button>
        </div>
      </DefaultLayout>
      {click && (
        <DefaultLayout title="Example Content">
          <div ref={contentRef} style={{ scrollMarginTop: "200px" }}>
            <div className="flex justify-center items-center animate-fadeIn">
              <button
                onClick={handleRedirect}
                className="hover:bg-primaryHover shadow-md hover:shadow-lg transition bg-primary rounded-md p-4 mb-5 text-white font-semibold"
              >
                Go to dashboard!
              </button>
            </div>
            <SectionGrid title="Top Songs" items={topSongs} loading={false} tutorial={true} />
            <SectionGrid title="Top Artists" items={topArtists} loading={false} tutorial={true} />
            <SectionList title="Listening History" items={listeningHistory} tutorial={true} />
          </div>
        </DefaultLayout>
      )}
    </>
  );
};

export default Tutorial;
