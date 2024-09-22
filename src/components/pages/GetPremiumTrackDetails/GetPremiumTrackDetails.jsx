import React, { useEffect, useState } from "react";
import "./GetPremiumTrackDetails.css";
import { toast } from "react-toastify";

const GetPremiumTracksDetails = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [publishingState, setPublishingState] = useState({});
  const [artists, setArtists] = useState([]); // New state for artists
  const [selectedArtistId, setSelectedArtistId] = useState(''); // State for selected artist ID

  useEffect(() => {
    fetchTrackData();
    fetchArtists(); // Fetch artists on component mount
  }, []);

  // Fetch track data from the API
  const fetchTrackData = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/getpremiumtrackdetails");
      if (!response.ok) {
        throw new Error("Failed to fetch track data");
      }
      const data = await response.json();
      setTracks(data.tracks || []);
      const initialPublishingState = data.tracks.reduce((acc, track) => {
        acc[track.trackId] = track.published || false;
        return acc;
      }, {});
      setPublishingState(initialPublishingState);
    } catch (err) {
      setError(`Track Data Error: ${err.message}`);
      console.error("Track Data Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch artists from the API
  const fetchArtists = async () => {
    try {
      const response = await fetch("https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/getartists");
      if (!response.ok) {
        throw new Error("Failed to fetch artists");
      }
      const data = await response.json();
      
      // Log the entire response to understand its structure
      console.log("Artists Response Data:", data);
      
      // Adjust the following line based on the actual response structure
      if (Array.isArray(data)) {
        setArtists(data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      setError(`Artists Fetch Error: ${err.message}`);
      console.error("Artists Fetch Error:", err);
    }
  };

  // Handle deleting a track
  const handleDelete = async (trackId) => {
    try {
      const response = await fetch(`https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/deletetrack?trackId=${trackId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete track');

      fetchTrackData();
      toast.success("Track deleted successfully!");
    } catch (error) {
      toast.error(`Error deleting track: ${error.message}`);
    }
  };

  // Handle publishing (saving) track details
  const handlePublish = async (track) => {
    try {
      if (!selectedArtistId) {
        throw new Error('Please select an Artist ID.');
      }

      const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/publishtrack', {
        method: 'POST',
        body: JSON.stringify({ 
          name: track.trackName, 
          fileKey: track.fileKey,
          artistId: selectedArtistId, // Use selected artist ID
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to publish track');
      }

      setPublishingState(prevState => ({
        ...prevState,
        [track.trackId]: true,
      }));

      toast.success("Track published successfully!");
    } catch (error) {
      toast.error(`Error publishing track: ${error.message}`);
    }
  };

  // Construct the URL for the audio file
  const constructAudioUrl = (fileKey) => {
    const bucketName = 'uploadmagenew'; // Replace with your bucket name
    return `https://${bucketName}.s3.eu-north-1.amazonaws.com/${fileKey}`;
  };

  return (
    <div className="tracks-list">
      {loading && <div className="loading-spinner">Loading tracks...</div>}
      {error && <p>Error: {error}</p>}
      {!loading && !error && tracks.length === 0 && <p>No tracks available.</p>}
      {!loading && tracks.length > 0 && (
        <>
          <div className="artist-selection">
            <label htmlFor="artist-select">Select Artist:</label>
            <select
              id="artist-select"
              value={selectedArtistId}
              onChange={(e) => setSelectedArtistId(e.target.value)}
            >
              <option value="">--Select Artist--</option>
              {artists.map(artist => (
                <option key={artist.artistId} value={artist.artistId}>
                  {artist.name} {/* Adjust this if needed */}
                </option>
              ))}
            </select>
          </div>
          <table>
            <thead>
              <tr>
                <th>Track Name</th>
                <th>Artist Name</th>
                <th>Artist ID</th>
                <th>Playback</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tracks.map((track) => (
                <tr key={track.trackId}>
                  <td>{track.trackName}</td>
                  <td>{track.artistName}</td>
                  <td>{track.artistId}</td>
                  <td>
                    {track.fileKey && (
                      <audio controls>
                        <source src={constructAudioUrl(track.fileKey)} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    )}
                  </td>
                  <td>
                    {publishingState[track.trackId] ? (
                      <button disabled>Published</button>
                    ) : (
                      <button onClick={() => handlePublish(track)}>Publish</button>
                    )}
                    <button onClick={() => handleDelete(track.trackId)}>Delete</button>
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

export default GetPremiumTracksDetails;
