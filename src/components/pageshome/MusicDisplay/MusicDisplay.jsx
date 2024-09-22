import React, { useEffect, useState } from "react";
import "./MusicDisplay.css";
import MusicModal from "./MusicModel.jsx";
import { FaHeart, FaRegHeart } from "react-icons/fa"; // Import heart icons

const MusicDisplay = ({ category, artist}) => {
  const [musicList, setMusicList] = useState([]);
  const [filteredMusicList, setFilteredMusicList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    // Load favorites from local storage or initialize as an empty array
    const savedFavorites = localStorage.getItem('favorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  // Search state
  const [albumName, setAlbumName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [genre, setGenre] = useState('');

  // Determine if the current user is an admin
  const userEmail = localStorage.getItem('email'); // Ensure userEmail is correctly retrieved
  const isAdmin = userEmail === 'chamodjanaka90@gmail.com'; // Replace with actual admin check if necessary

  // Fetch music data
  const fetchMusicData = async () => {
    try {
      const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/viewalbums');
      if (!response.ok) {
        throw new Error('Failed to fetch music data');
      }
      const data = await response.json();
      setMusicList(data);
      setFilteredMusicList(data); // Initialize filtered list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch music data based on search criteria
  const fetchSearchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/searchalbums?albumName=${encodeURIComponent(albumName)}&artistName=${encodeURIComponent(artistName)}&genre=${encodeURIComponent(genre)}`
      );
      if (!response.ok) throw new Error('Failed to fetch search data');
      const data = await response.json();
      setFilteredMusicList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsLoggedIn(!!userEmail); 
    fetchMusicData();
  }, []);

  useEffect(() => {
    if (albumName || artistName || genre) {
      fetchSearchData();
    } else {
      setFilteredMusicList(musicList); // Reset to full list if no search term
    }
  }, [albumName, artistName, genre, musicList]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  const handleFavoriteToggle = async (item, e) => {
    e.stopPropagation(); // Prevent triggering the item click

    const isFavorite = favorites.some(fav => fav.albumId === item.albumId); // Use albumId for uniqueness
    const updatedFavorites = isFavorite
      ? favorites.filter(fav => fav.albumId !== item.albumId)
      : [...favorites, item];

    // Update local state and storage
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));

    try {
      // Call the Lambda function to save favorites
      console.log('Saving favorites for user:', userEmail);

      const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/savefavourities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail, favorites: updatedFavorites }),
      });

      if (!response.ok) {
        throw new Error('Failed to save favorites');
      }

      const result = await response.json();
      console.log('Favorites saved:', result.message);
    } catch (error) {
      console.error('Error saving favorites:', error.message);
    }
  };

  const handleSearch = () => {
    fetchSearchData();
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="music-display">
      <h2>Music Near You</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Album Name"
          value={albumName}
          onChange={(e) => setAlbumName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Artist Name"
          value={artistName}
          onChange={(e) => setArtistName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="music-display-list">
        {filteredMusicList.length === 0 ? (
          <p>No music items available.</p>
        ) : (
          filteredMusicList
            .filter(item => (category === "All" || category === item.genre) && (artist ==="All" || artist === item.artistName)) // Filter by genre if category is set to "All"
            .map(item => {
              const isFavorite = favorites.some(fav => fav.albumId === item.albumId); // Use albumId for uniqueness
              return (
                <div
                  key={item.albumId}
                  className="music-item"
                  onClick={() => handleItemClick(item)}
                >
                  <img
                    src={item.albumArtUrl}
                    alt={item.albumName}
                    className="album-art"
                  />
                  <div className="music-item-info">
                    <h3>{item.albumName}</h3>
                    <p><strong>Artist:</strong> {item.artistName}</p>
                    <p><strong>Genre:</strong> {item.genre}</p>
                    <p><strong>Studio:</strong> {item.studio}</p>
                  </div>
                  {/* Conditionally render the favorite button based on user role */}
                  {!isAdmin && isLoggedIn &&(
                    <button
                      className="favorite-button"
                      onClick={(e) => handleFavoriteToggle(item, e)} // Pass event to handler
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
        <MusicModal item={selectedItem} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default MusicDisplay;
