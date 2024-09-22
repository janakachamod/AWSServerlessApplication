import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import './InventoryTracks.css'; // Ensure this file exists and has necessary styles

const InventoryTrack = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="track-details">
      <h2>All Tracks Details</h2>

      <div className="most-popular-track">
        <h3>Most Popular Track Name:</h3>
        <p>{mostPopularTrackName}</p>
      </div>

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

export default InventoryTrack ;
