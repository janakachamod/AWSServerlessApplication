import React, { useState, useEffect } from 'react';
import './PopularTracks.css'; // For styling

const PopularTracks = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [mostPopularTrackName, setMostPopularTrackName] = useState('');

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/fetchfavouriteTracks');
        if (!response.ok) {
          throw new Error('Failed to fetch tracks');
        }
        const data = await response.json();
        setTracks(data.tracks || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, []);

  const calculateMostPopularTrackName = () => {
    const nameCount = {};
    tracks.forEach(track => {
      nameCount[track.trackName] = (nameCount[track.trackName] || 0) + 1;
    });
    return Object.keys(nameCount).reduce((a, b) => nameCount[a] > nameCount[b] ? a : b, '');
  };

  const handleGenerateReport = () => {
    const popularTrackName = calculateMostPopularTrackName();
    setMostPopularTrackName(popularTrackName);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const handleSendReport = async () => {
    try {
      const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/send-populartracks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          tracks // Include tracks in the request
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
    <div className="popular-tracks-page">
      <h1>Popular Tracks</h1>
      {tracks.length === 0 ? (
        <p>No popular tracks available.</p>
      ) : (
        <table className="tracks-table">
          <thead>
            <tr>
              <th>Artist Image</th>
              <th>Track Name</th>
              <th>Artist</th>
              <th>Audio</th>
            </tr>
          </thead>
          <tbody>
            {tracks.map(track => (
              <tr key={track.trackId}>
                <td>
                  <img
                    src={`https://uploadmagenew.s3.eu-north-1.amazonaws.com/${track.artistAvatar}`}
                    alt={track.artistName}
                    className="artist-avatar"
                  />
                </td>
                <td>{track.trackName}</td>
                <td>{track.artistName}</td>
                <td>
                  <audio controls>
                    <source src={`https://uploadmagenew.s3.eu-north-1.amazonaws.com/${track.fileKey}`} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </td>
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
            <p><strong>Most Popular Track Name:</strong> {mostPopularTrackName}</p>
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

export default PopularTracks;
