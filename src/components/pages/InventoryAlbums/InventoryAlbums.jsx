import React, { useEffect, useState } from 'react';
import './InventoryAlbums.css'; // Ensure this file is styled according to your needs

const InventoryAlbums = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch album data
  const fetchAlbumData = async () => {
    try {
      const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/viewalbums');
      if (!response.ok) throw new Error('Failed to fetch album data');
      
      const data = await response.json();
      console.log('API Response Data:', data);  // Check this log to ensure correct data
  
      // Ensure the response contains `albums`
      if (Array.isArray(data)) {
        setAlbums(data);
      } else {
        console.error('Unexpected response format:', data);
        setAlbums([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbumData();
  }, []);

  return (
    <div className="view-albums">
      {loading && <p>Loading albums...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && !error && albums.length === 0 && <p>No albums available.</p>}
      {!loading && albums.length > 0 && (
        <table className="albums-table">
          <thead>
            <tr>
              <th>Album Art</th>
              <th>Album Name</th>
              <th>Number of Tracks</th>
              <th>Studio</th>
              <th>Genre</th>
              <th>Status</th>
              <th>Artist Name</th>
              <th>Artist Bio</th>
              <th>Artist Avatar</th>
            </tr>
          </thead>
          <tbody>
            {albums.map((album) => (
              <tr key={album.albumId}>
                <td>
                  {album.albumArtUrl ? (
                    <img src={album.albumArtUrl} alt={album.albumName} className="album-art" />
                  ) : (
                    <p>No Image</p>
                  )}
                </td>
                <td>{album.albumName}</td>
                <td>{album.numberOfTracks}</td>
                <td>{album.studio}</td>
                <td>{album.genre}</td>
                <td>{album.status ? 'Active' : 'Inactive'}</td>
                <td>{album.artistName}</td>
                <td>{album.bio}</td>
                <td>
                  {album.artistAvatarUrl ? (
                    <img src={album.artistAvatarUrl} alt={album.artistName} className="artist-avatar" />
                  ) : (
                    <p>No Image</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default InventoryAlbums;
