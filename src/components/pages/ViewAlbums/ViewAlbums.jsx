import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import './ViewAlbums.css'; // Ensure this file is styled according to your needs

const ViewAlbums = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [reportRecipient, setReportRecipient] = useState("");

  // Function to fetch album data and pre-signed URLs
  const fetchAlbumData = async () => {
    try {
      const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/viewalbums');
      if (!response.ok) throw new Error('Failed to fetch album data');
      
      const data = await response.json();
      console.log('API Response Data:', data);  // Check this log to ensure correct data
  
      // Ensure the response contains `albums`
      if (Array.isArray(data)) {
        setAlbums(data);
        // Call the function to update the database with fetched albums
        await updateAlbumsInDatabase(data);
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

  // Function to update album details in the database
  const updateAlbumsInDatabase = async (albums) => {
    try {
      const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/inventory-album-update', {
        method: 'POST',
        body: JSON.stringify({ albums }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update albums');
      }

      toast.success("Albums updated successfully!");
    } catch (error) {
      console.error('Error updating albums:', error);
      toast.error(`Error updating albums: ${error.message}`);
    }
  };

  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  const handleSendReport = async () => {
    try {
      const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/send-all-albums', {
        method: 'POST',
        body: JSON.stringify({ recipient: reportRecipient, albums }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send report');
      }

      toast.success("Report sent successfully!");
      closePopup();
      
      // Optionally update the albums in the database here
      await updateAlbumsInDatabase(albums);

    } catch (error) {
      console.error('Error sending report:', error);
      toast.error(`Error sending report: ${error.message}`);
    }
  };

  return (
    <div className="view-albums">
      {loading && <p>Loading albums...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && !error && albums.length === 0 && <p>No albums available.</p>}
      {!loading && albums.length > 0 && (
        <>
          <button onClick={openPopup} className="generate-report-button">
            Generate Report
          </button>

          {/* Popup Form */}
          {isPopupOpen && (
            <div className="popup-overlay">
              <div className="popup-content">
                <h2>Send Report</h2>
                <p><strong>Album Count:</strong> {albums.length}</p>
                <input
                  type="email"
                  id="recipient-email"
                  name="recipient-email"
                  value={reportRecipient}
                  onChange={(e) => setReportRecipient(e.target.value)}
                  placeholder="Enter recipient's email"
                  className="email-input"
                />
                <button onClick={handleSendReport} className="send-report-button">
                  Send Report
                </button>
                <button onClick={closePopup} className="close-popup-button">
                  Close
                </button>
              </div>
            </div>
          )}

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
        </>
      )}
    </div>
  );
};

export default ViewAlbums;
