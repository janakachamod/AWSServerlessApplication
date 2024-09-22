import React from "react";
import { NavLink } from "react-router-dom";
import "./sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-options">
      <NavLink to="main-dashboard" className="sidebar-option">
          <p>Admin Dashboard</p>
        </NavLink>
        <NavLink to="add-items" className="sidebar-option">
          <p>Add Items</p>
        </NavLink>
        <NavLink to="add-track" className="sidebar-option">
          <p>ADD Tracks</p>
        </NavLink>
        <NavLink to="Add-Artists" className="sidebar-option">
          <p>Add-Artists</p>
        </NavLink>
        <NavLink to="add-albums" className="sidebar-option">
          <p>Add Albums</p>
        </NavLink>
        <NavLink to="add-genres" className="sidebar-option">
          <p>Add Genre</p>
        </NavLink>
        <NavLink to="list-items" className="sidebar-option">
          <p>List Items</p>
        </NavLink>
       
        <NavLink to="user-list" className="sidebar-option">
          <p>User Details</p>
        </NavLink>
       
        <NavLink to="list-track" className="sidebar-option">
          <p>ALL Tracks</p>
        </NavLink>
        
        <NavLink to="List-Artists" className="sidebar-option">
          <p>All Artists</p>
        </NavLink>
       
        <NavLink to="list-albums" className="sidebar-option">
          <p>All Albums</p>
        </NavLink>
        
         
       
        
        <NavLink to="all-genres" className="sidebar-option">
          <p>All Genres</p>
        </NavLink>
        <NavLink to="track-details" className="sidebar-option">
          <p>Track Details</p>
        </NavLink>
        
        <NavLink to="view-albums" className="sidebar-option">
          <p>view Albums</p>
        </NavLink>
        <NavLink to="Popular-Tracks" className="sidebar-option">
          <p>Popular Tracks</p>
        </NavLink>
        <NavLink to="popular-items" className="sidebar-option">
          <p>Popular Items</p>
        </NavLink>
        <NavLink to="premium-artist" className="sidebar-option">
          <p>User Add Artists</p>
        </NavLink>
        <NavLink to="premium-track" className="sidebar-option">
          <p>user Add Tracks</p>
        </NavLink>
        <NavLink to="additional" className="sidebar-option">
          <p>Additional</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
