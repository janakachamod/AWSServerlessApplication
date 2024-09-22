import React, { useState, useEffect, useContext } from 'react';
import './FavouriteTracks.css';
import AccountContext from '../../../Context/AccountContext.js'; // Import AccountContext

const FavouriteTracks = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getsession } = useContext(AccountContext); // Use context to get user session

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const sessionData = await getsession(); // Get user session
        const userEmail = sessionData.email; // Assume email is stored in sessionData

        // Fetch favorites for the current user
        const response = await fetch(`https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/fetchindividualtrack?userEmail=${encodeURIComponent(userEmail)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch favorites');
        }
        const data = await response.json();
        setFavorites(data.tracks || []); // Ensure data.tracks is used if available
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [getsession]); // Depend on getsession to refetch if it changes

  const handleDelete = async (trackId) => {
    try {
      const sessionData = await getsession(); // Get user session
      const userEmail = sessionData.email; // Assume email is stored in sessionData
  
      const response = await fetch(`https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/deletefavtrack?trackId=${encodeURIComponent(trackId)}&userEmail=${encodeURIComponent(userEmail)}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete track');
      }
  
      // Remove deleted track from state
      setFavorites(favorites.filter(item => item.trackId !== trackId));
      alert('Track removed from favorites successfully!');
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to remove track from favorites.');
    }
  };
  

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="favorites-page">
      <h1>My Favorite Tracks</h1>
      {favorites.length === 0 ? (
        <p>No favorite tracks yet.</p>
      ) : (
        <table className="favorites-table">
          <thead>
            <tr>
              <th>Artist Image</th>
              <th>Name</th>
              <th>Artist</th>
              <th>File</th>
              <th>Action</th> {/* Added Action column */}
            </tr>
          </thead>
          <tbody>
            {favorites.map(item => (
              <tr key={item.trackId}>
                <td>
                  <img
                    src={`https://uploadmagenew.s3.eu-north-1.amazonaws.com/${item.artistAvatar}`}
                    alt={item.artistName}
                    className="artist-avatar"
                  />
                </td>
                <td>{item.trackName}</td>
                <td>{item.artistName}</td>
                <td>
                  <audio controls>
                    <source src={`https://uploadmagenew.s3.eu-north-1.amazonaws.com/${item.fileKey}`} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </td>
                <td>
                  <button onClick={() => handleDelete(item.trackId)} className="delete-button">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FavouriteTracks;
