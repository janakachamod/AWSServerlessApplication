import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import AccountState from "./Status/AcountState"; // Correct file path
import Myfavourite from "./components/pageshome/Myfavourite/Myfavourite";
import FavouriteTracks from "./components/pageshome/FavouriteTracks/FavouriteTracks"
import Inventory from "./components/Inventory";
import PremiumDashboard from "./components/premiumdashboard";

function App() {
  return (
    <BrowserRouter>
      <AccountState>
        <Header />
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={
                <div style={{ paddingTop: "50px" }}>
                  <Login />
                </div>
              }
            />
            <Route path="/favorites" element={<Myfavourite />} />
            <Route path="/favoritestracks" element={<FavouriteTracks />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/inventory/*" element={<Inventory />} />
            <Route path="/premium/*" element={<PremiumDashboard />} />
          </Routes>
        </div>
        <Footer />
      </AccountState>
    </BrowserRouter>
  );
}

export default App;
