import React, { useState, useEffect, useRef } from "react";
import DefaultLayout from "../../layouts/DefaultLayout";
import SectionGrid from "../../layouts/SectionGrid";
import SectionList from "../../layouts/SectionList";
import { exampleTopSongs, exampleTopArtists, exampleListeningHistory } from "./TutorialContent";

const Box = ({ title, body }) => {
  return (
    <div className="animate-fadeIn select-none text-center bg-surface rounded-lg p-5 mb-10 shadow-md transition hover:scale-105 cursor-default">
      <h1 className="text-textPrimary text-xl font-bold mb-4">{title}</h1>
      <p className="text-textSecondary">{body}</p>
    </div>
  );
};

const Tutorial = () => {
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

  return (
    <>
      <DefaultLayout title="How to use Statvio!" position="center">
        {/* <div className="grid grid-rows-3 gap-2 md:grid-cols-3 md:gap-6"> */}
        <div className="grid grid-cols-3 gap-6">
          <Box
            title="1. First of all"
            body="Welcome to Statvio! Your one-stop hub for connecting and managing all your favorite streaming services and apps in one place."
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
            className="mt-10 hover:bg-primaryHover transition animate-bounce bg-primary rounded-md p-4 text-white font-semibold"
          >
            Connect to Statvio!
          </button>
        </div>
      </DefaultLayout>

      <DefaultLayout title="Example Content">
        {click && (
          <div ref={contentRef} style={{ scrollMarginTop: "200px" }}>
            <SectionGrid title="Top Songs" items={topSongs} loading={false} tutorial={true} />
            <SectionGrid title="Top Artists" items={topArtists} loading={false} tutorial={true} />
            <SectionList title="Listening History" items={listeningHistory} tutorial={true} />
          </div>
        )}
      </DefaultLayout>
    </>
  );
};

export default Tutorial;
