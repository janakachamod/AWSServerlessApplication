import React, { useEffect, useState } from "react";
import "./RecentlyPlayed.css";
import TrackModal from "./RecentlyModel.jsx";

const RecentlyPlayed = ({ artist }) => {
  const [trackList, setTrackList] = useState([]);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Get the userEmail from localStorage
  const userEmail = localStorage.getItem('email');

  // Check if user is logged in and not an admin
  const isLoggedIn = !!userEmail;
  const isAdmin = userEmail === 'chamodjanaka90@gmail.com';

  // Fetch recently played track data
  const fetchTrackData = async () => {
    if (!isLoggedIn) {
      return; // Do nothing if not logged in
    }

    try {
      const response = await fetch(`https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/getrecentplayestracks?userEmail=${encodeURIComponent(userEmail)}`);
      if (!response.ok) throw new Error('Failed to fetch track data');
      const data = await response.json();
      setTrackList(data.tracks || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (isLoggedIn && !isAdmin) {
      fetchTrackData();
    }
  }, [isLoggedIn, isAdmin]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  // Render nothing if not logged in or if admin
  if (!isLoggedIn || isAdmin) return null;

  // Display error message if any
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="track-display">
      <h2>Recently Played Tracks</h2>

      <div className="track-display-list">
        {trackList.length === 0 ? (
          <p>No tracks available.</p>
        ) : (
          trackList
            .filter(item => artist === "All" || artist === item.artistName)
            .map(item => (
              <div
                key={item.trackId}
                className="track-item"
                onClick={() => handleItemClick(item)}
              >
                <img
                  src={`https://uploadmagenew.s3.eu-north-1.amazonaws.com/${item.artistAvatar}`} // URL for artist image
                  alt={item.artistName}
                  className="artist-image"
                />
                <div className="track-item-info">
                  <h3>{item.trackName}</h3>
                </div>
              </div>
            ))
        )}
      </div>
      {selectedItem && (
        <TrackModal item={selectedItem} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default RecentlyPlayed;
