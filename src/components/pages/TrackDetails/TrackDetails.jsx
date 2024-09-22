import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import './TrackDetails.css'; // Ensure this file exists and has necessary styles

const TrackDetails = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [reportRecipient, setReportRecipient] = useState("");
  const [mostPopularTrackName, setMostPopularTrackName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/get_all_tracks');
        if (!response.ok) throw new Error('Failed to fetch track data');
        const data = await response.json();
        setTracks(data.tracks || []); // Adjust based on actual response structure

        // Calculate the most popular track name after data is fetched
        const nameCount = {};
        data.tracks.forEach(track => {
          nameCount[track.trackName] = (nameCount[track.trackName] || 0) + 1;
        });
        const popularTrackName = Object.keys(nameCount).reduce((a, b) => nameCount[a] > nameCount[b] ? a : b, '');
        setMostPopularTrackName(popularTrackName);

        // Update tracks in database
        await updateTracksInDatabase(data.tracks || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateTracksInDatabase = async (tracks) => {
    try {
      const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/inventory-update-for-tracks', {
        method: 'POST',
        body: JSON.stringify({ tracks }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update tracks');
      }

      toast.success("Tracks updated successfully!");
    } catch (error) {
      console.error('Error updating tracks:', error);
      toast.error(`Error updating tracks: ${error.message}`);
    }
  };

  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  const handleSendReport = async () => {
    try {
      const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/send-all-tracks', {
        method: "POST",
        body: JSON.stringify({ email: reportRecipient, tracks: tracks }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send report');
      }

      toast.success("Report sent successfully!");
      closePopup();
    } catch (error) {
      console.error('Error sending report:', error);
      toast.error(`Error sending report: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="track-details">
      <h2>All Tracks Details</h2>
      <button onClick={openPopup} className="generate-report-button">
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

      <div className="list-table">
        <div className="list-table-format title">
          <b>Name</b>
          <b>File</b>
          <b>Artist Name</b>
          <b>Artist ID</b>
        </div>
        {tracks.map((track) => (
          <div key={track.trackId} className="list-table-format">
            <p>{track.trackName}</p>
            <audio controls>
              <source
                src={`https://uploadmagenew.s3.eu-north-1.amazonaws.com/${track.fileKey}`}
                type="audio/mpeg"
                onError={(e) => {
                  console.error(`Error loading audio file for track ${track.trackName}: ${e.target.src}`);
                  e.target.src = '';
                }}
              />
              Your browser does not support the audio element.
            </audio>
            <p>{track.artistName || 'Unknown Artist'}</p>
            <p>{track.artistId}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackDetails;
