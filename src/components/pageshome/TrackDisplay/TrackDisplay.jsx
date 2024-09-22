import React, { useEffect, useState } from "react";
import "./TrackDisplay.css";
import TrackModal from "./TrackModel.jsx";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const TrackDisplay = ({ artist }) => {
  const [trackList, setTrackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem('trackFavorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  const [trackName, setTrackName] = useState('');
  const [artistName, setArtistName] = useState('');

  // Get the userEmail from localStorage
  const userEmail = localStorage.getItem('email');
  const isAdmin = userEmail === 'chamodjanaka90@gmail.com';

  // Fetch general track data
  const fetchTrackData = async () => {
    try {
      const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/artistmain');
      if (!response.ok) throw new Error('Failed to fetch track data');
      const data = await response.json();
      setTrackList(data.tracks || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch track data based on search criteria
  const fetchSearchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/search-tracks?trackName=${encodeURIComponent(trackName)}&artistName=${encodeURIComponent(artistName)}`
      );
      if (!response.ok) throw new Error('Failed to fetch search data');
      const data = await response.json();
      setTrackList(data.tracks || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsLoggedIn(!!userEmail); 
    fetchTrackData();
  }, []);

  const handleItemClick = (item) => {
    handleTrackPlay(item); // Save the track to recently played when clicked
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  // Handle the track play action
  const handleTrackPlay = async (item) => {
    if (!userEmail) {
      console.error('User is not logged in. Cannot save track.');
      return;
    }
  
    try {
      const response = await fetch(`https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/recent-plays?userEmail=${encodeURIComponent(userEmail)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track: item }),
      });
  
      if (!response.ok) throw new Error('Failed to save recently played track');
      console.log('Track saved to recently played:', item);
    } catch (error) {
      console.error('Error saving recently played track:', error.message);
    }
  };

  const handleFavoriteToggle = async (item, e) => {
    e.stopPropagation();
  
    if (!userEmail) {
      console.error('User email is not defined.');
      return;
    }
  
    const isFavorite = favorites.some(fav => fav.trackId === item.trackId);
    const updatedFavorites = isFavorite
      ? favorites.filter(fav => fav.trackId !== item.trackId)
      : [...favorites, item];
  
    setFavorites(updatedFavorites);
    localStorage.setItem('trackFavorites', JSON.stringify(updatedFavorites));
  
    try {
      const response = await fetch(`https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/savetrackfavourites?userEmail=${encodeURIComponent(userEmail)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorites: updatedFavorites, userEmail: userEmail }), // Ensure userEmail is included in the body
      });
  
      if (!response.ok) throw new Error('Failed to save favorites');
      console.log('Favorites saved:', await response.json());
    } catch (error) {
      console.error('Error saving favorites:', error.message);
    }
  };
  

  const handleSearch = () => {
    fetchSearchData();
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="track-display">
      <h2>Tracks Near You</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Track Name"
          value={trackName}
          onChange={(e) => setTrackName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Artist Name"
          value={artistName}
          onChange={(e) => setArtistName(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="track-display-list">
        {trackList.length === 0 ? (
          <p>No tracks available.</p>
        ) : (
          trackList
            .filter(item => artist === "All" || artist === item.artistName)
            .map(item => {
              const isFavorite = favorites.some(fav => fav.trackId === item.trackId);
              return (
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
                  {!isAdmin && isLoggedIn &&(
                    <button
                      className="favorite-button"
                      onClick={(e) => handleFavoriteToggle(item, e)}
                    >
                      {isFavorite ? <FaHeart color="red" /> : <FaRegHeart />}
                    </button>
                  )}
                </div>
              );
            })
        )}
      </div>
      {selectedItem && (
        <TrackModal item={selectedItem} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default TrackDisplay;
