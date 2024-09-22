import React from "react";
import { NavLink } from "react-router-dom";
import "./sidebarinventroy.css";

const SidebarInventory = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-options">
      <NavLink to="inventory-album" className="sidebar-option">
          <p>Album Inventory</p>
        </NavLink>
        <NavLink to="inventory-track" className="sidebar-option">
          <p>Track Inventory</p>
        </NavLink>
       
      </div>
    </div>
  );
};

export default SidebarInventory;
