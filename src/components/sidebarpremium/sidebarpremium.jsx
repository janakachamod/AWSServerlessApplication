import React from "react";
import { NavLink } from "react-router-dom";
import "./sidebarpremium.css";

const SidebarPremium = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-options">
      <NavLink to="premium-artist" className="sidebar-option">
          <p>Add Artist</p>
        </NavLink>
        <NavLink to="premium-artistlist" className="sidebar-option">
          <p>List Artist</p>
        </NavLink>
        <NavLink to="premium-track" className="sidebar-option">
          <p>Add Track</p>
        </NavLink>
        <NavLink to="premium-tracklist" className="sidebar-option">
          <p>List Track</p>
        </NavLink>
       
      </div>
    </div>
  );
};

export default SidebarPremium;
