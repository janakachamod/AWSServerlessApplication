import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


import AddPremiumArtists from "./Businessone/AddPremiumArtists/AddPremiumArtists";
import ListPremiumArtist from "./Businessone/ListPremiumArtists/ListPremiumArtist";
import AddPremiumTracks from "./Businessone/AddPremiumTracks/AddPremiumTracks";
import ListPremiumTracks from "./Businessone/ListPremiumTracks/ListPremiumTracks";
import SidebarPremium from "./sidebarpremium/sidebarpremium";

function PremiumDashboard() {
  return (
    <div style={{ display: "flex" }}>
      <ToastContainer />
      <SidebarPremium />
      <div className="main-content" style={{ flex: 1,padding: '65px', marginLeft: "20%" }}>
        <Routes>
          <Route path="/" element={<AddPremiumArtists />} />
          <Route path="premium-artist" element={<AddPremiumArtists />} />
          <Route path="premium-artistlist" element={<ListPremiumArtist />} />
          <Route path="premium-track" element={<AddPremiumTracks />} />
          <Route path="premium-tracklist" element={<ListPremiumTracks />} />
         
        </Routes>
      </div>
    </div>
  );
}

export default PremiumDashboard;
