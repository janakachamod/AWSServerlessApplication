import React, { useState } from "react";
import Header from "../components/pageshome/Header/Header";
import ExploreMenu from "../components/pageshome/ExploreMenu/ExploreMenu";
import MusicDisplay from "../components/pageshome/MusicDisplay/MusicDisplay";
import TrackDisplay from "./pageshome/TrackDisplay/TrackDisplay";
import Chatbot from "./pageshome/ChatBot/Chatbot";
import RecentlyPlayed from "./pageshome/RecenlyplayedTracks/RecentlyPlayed";

function Home() {
  const [category, setCategory] = useState("All");
  const [artist, setArtist] = useState("All");

  return (
    <div className="home">
      <Header />
      <ExploreMenu category={category} setCategory={setCategory}  artist={artist} setArtist={setArtist} />
      <RecentlyPlayed artist={artist} />
      <TrackDisplay artist={artist} />
      <MusicDisplay category={category} artist={artist} />
      
      <Chatbot/>
     
    </div>
  );
}

export default Home;
