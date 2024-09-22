import React, { useState, useEffect } from 'react';
import './PopularItems.css'; // For styling

const PopularItems = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [mostPopularName, setMostPopularName] = useState('');

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/fetchfavourities');
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
  }, []);

  const calculateMostPopularName = () => {
    const nameCount = {};
    favorites.forEach(item => {
      nameCount[item.name] = (nameCount[item.name] || 0) + 1;
    });
    return Object.keys(nameCount).reduce((a, b) => nameCount[a] > nameCount[b] ? a : b, '');
  };

  const handleGenerateReport = () => {
    const popularName = calculateMostPopularName();
    setMostPopularName(popularName);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const handleSendReport = async () => {
    try {
      const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/send-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          favorites // Include favorites in the request
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to send report');
      }
  
      setReportGenerated(true);
      alert('Report sent successfully!');
      closePopup(); // Close the popup after sending the report
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to send the report.');
    }
  };
  

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="popular-items-page">
      <h1>Popular Items</h1>
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
            </tr>
          </thead>
          <tbody>
            {favorites.map(item => (
              <tr key={item.itemId}>
                <td>
                  <img
                    src={`https://uploadmagenew.s3.eu-north-1.amazonaws.com/${item.albumArtKey}`}
                    alt={item.name}
                    className="album-art"
                  />
                </td>
                <td>{item.name}</td>
                <td>{item.artist}</td>
                <td>{item.genre}</td>
                <td>{item.studio}</td>
                <td>{item.numberOfTracks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button onClick={handleGenerateReport} className="generate-report-button">
        Generate Report
      </button>

      {/* Popup Form */}
      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Send Report</h2>
            <p><strong>Most Popular Name:</strong> {mostPopularName}</p>
            <input
              type="email"
              id="recipient-email"
              name="recipient-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

      {reportGenerated && <p>Report has been sent to {email}.</p>}
    </div>
  );
};

export default PopularItems;
