import React, { useState, useEffect, useContext } from 'react';
import './Myfavourite.css';
import AccountContext from '../../../Context/AccountContext.js'; // Import AccountContext

const Myfavourite = () => {
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
        const response = await fetch(`https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/fetchindividualfavourities?userEmail=${encodeURIComponent(userEmail)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch favorites');
        }
        const data = await response.json();
        setFavorites(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [getsession]); // Depend on getsession to refetch if it changes

  const handleDelete = async (itemId) => {
    try {
      const sessionData = await getsession(); // Get user session
      const userEmail = sessionData.email; // Assume email is stored in sessionData

      // Make a request to delete the favorite item
      const response = await fetch(`https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/deletefavouritealbums?itemId=${encodeURIComponent(itemId)}&userEmail=${encodeURIComponent(userEmail)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete favorite');
      }

      // Remove the deleted item from the state
      setFavorites(favorites.filter(item => item.itemId !== itemId));
    } catch (err) {
      setError(err.message);
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
      <h1>My Favorites</h1>
      {favorites.length === 0 ? (
        <p>No favorite items yet.</p>
      ) : (
        <table className="favorites-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Artist</th>
              <th>Genre</th>
              <th>Studio</th>
              <th>Number of Tracks</th>
              <th>Action</th> {/* Added Action column */}
            </tr>
          </thead>
          <tbody>
            {favorites.map(item => (
              <tr key={item.itemId}>
                <td>
                  <img
                    src={`https://uploadmagenew.s3.eu-north-1.amazonaws.com/${item.albumArtKey}`} // Ensure this URL is correct
                    alt={item.name}
                    className="album-art"
                  />
                </td>
                <td>{item.name}</td>
                <td>{item.artist}</td>
                <td>{item.genre}</td>
                <td>{item.studio}</td>
                <td>{item.numberOfTracks}</td>
                <td>
                  <button 
                    className="delete-button" 
                    onClick={() => handleDelete(item.itemId)} // Call delete handler
                  >
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

export default Myfavourite;
