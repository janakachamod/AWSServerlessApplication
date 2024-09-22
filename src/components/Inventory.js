import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


import SidebarInventory from "./SidebarInventroy/sidebarinventory";
import InventoryTrack from "./pages/InventoryTracks/InventoryTracks";
import InventoryAlbums from "./pages/InventoryAlbums/InventoryAlbums";

function Inventory() {
  return (
    <div style={{ display: "flex" }}>
      <ToastContainer />
      <SidebarInventory/>
      <div className="main-content" style={{ flex: 1,padding: '55px', marginLeft: "20%" }}>
        <Routes>
          <Route path="/" element={<InventoryTrack />} />
          <Route path="inventory-track" element={<InventoryTrack />} />
          <Route path="inventory-album" element={<InventoryAlbums />} />
          
        </Routes>
      </div>
    </div>
  );
}

export default Inventory;
