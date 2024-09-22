import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./sidebar/sidebar";
import AddItems from "./pages/AddItems/AddItems";
import ListItems from "./pages/ListItems/ListItems";
import PopularItems from "./pages/PopolarItems/PopularItems";
import UserDetails from "./pages/UserDetails/UserDetails";
import AddTrack from "./pages/AddTracks/AddTracks";
import ListTracks from "./pages/ListTracks/ListTracks";
import AddArtist from "./pages/AddArtists/AddArtists";
import ListArtists from "./pages/ListArtists/ListArtists";
import AddAlbum from "./pages/Addalbums/Addalbums";
import ListAlbums from "./pages/ListAlbums/ListAlbums";
import ViewAlbums from "./pages/ViewAlbums/ViewAlbums";
import PopularTracks from "./pages/PopularTracks/PopularTracks";
import MainDashboard from "./pages/MainDashboard/MainDashboard";
import AddGenre from "./pages/AddGenre/AddGenre";
import AllGenres from "./pages/AllGenres/Allgenres";
import TrackDetails from "./pages/TrackDetails/TrackDetails";
import GetPremiumArtistDetails from "./pages/GetPremiumArtistDetails/GetPremiumArtistDetails";
import GetPremiumTracksDetails from "./pages/GetPremiumTrackDetails/GetPremiumTrackDetails";

function AdminDashboard() {
  return (
    <div style={{ display: "flex" }}>
      <ToastContainer />
      <Sidebar />
      <div className="main-content" style={{ flex: 1,padding: '55px', marginLeft: "20%" }}>
        <Routes>
          <Route path="/" element={<MainDashboard />} />
          <Route path="add-items" element={<AddItems />} />
          <Route path="list-items" element={<ListItems />} />
          <Route path="popular-items" element={<PopularItems />} />
          <Route path="user-list" element={<UserDetails />} />
          <Route path="add-track" element={<AddTrack />} />
          <Route path="list-track" element={<ListTracks />} />
          <Route path="Add-Artists" element={<AddArtist />} />
          <Route path="List-Artists" element={<ListArtists />} />
          <Route path="add-albums" element={<AddAlbum />} />
          <Route path="list-albums" element={<ListAlbums />} />
          <Route path="view-albums" element={<ViewAlbums />} />
          <Route path="Popular-Tracks" element={<PopularTracks />} />
          <Route path="main-dashboard" element={<MainDashboard />} />
          <Route path="add-genres" element={<AddGenre />} />
          <Route path="all-genres" element={<AllGenres />} />
          <Route path="track-details" element={<TrackDetails />} />
          <Route path="premium-artist" element={<GetPremiumArtistDetails />} />
          <Route path="premium-track" element={<GetPremiumTracksDetails />} />
        </Routes>
      </div>
    </div>
  );
}

export default AdminDashboard;
