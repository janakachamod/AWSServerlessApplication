import React, { useEffect, useState } from "react";
import "./GetPremiumArtistDetails.css";
import { toast } from "react-toastify";

const GetPremiumArtistDetails = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [publishingState, setPublishingState] = useState({}); // To track publishing state

  useEffect(() => {
    fetchArtistData();
  }, []);

  // Fetch artist data from the API
  const fetchArtistData = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/getpremiumartistdetails");
      if (!response.ok) {
        throw new Error("Failed to fetch artist data");
      }
      const data = await response.json();
      setArtists(data);
      // Initialize the publishing state based on fetched data
      const initialPublishingState = data.reduce((acc, artist) => {
        acc[artist.artistId] = artist.published || false;
        return acc;
      }, {});
      setPublishingState(initialPublishingState);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting an artist
  const handleDelete = async (artistId) => {
    try {
      const response = await fetch(`https://your-api-gateway-url.amazonaws.com/prod/deleteartistpremium?artistId=${artistId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete artist');

      fetchArtistData();
      toast.success("Artist deleted successfully!");
    } catch (error) {
      toast.error(`Error deleting artist: ${error.message}`);
    }
  };


  // Handle publishing (saving) artist details
const handlePublish = async (artist) => {
    try {
      const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/publish-artist', {
        method: 'POST',
        body: JSON.stringify({
          name: artist.name,
          bio: artist.bio || '',
          avatarKey: artist.avatarUrl ? `uploads/artist-avatars/${artist.avatarUrl.split('/').pop()}` : '', // Ensure the correct path is used
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) throw new Error('Failed to publish artist');
  
      fetchArtistData(); // Refresh artist list to include the updated artist
      toast.success("Artist published successfully!");
    } catch (error) {
      toast.error(`Error publishing artist: ${error.message}`);
    }
  };
  

  return (
    <div className="artist-list">
      {loading && <p>Loading artists...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && !error && artists.length === 0 && <p>No artists available.</p>}
      {!loading && artists.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Name</th>
              <th>Bio</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {artists.map((artist) => (
              <tr key={artist.artistId}>
                <td>
                  <img src={artist.avatarUrl} alt={artist.name} className="artist-avatar" />
                </td>
                <td>{artist.name}</td>
                <td>{artist.bio}</td>
                <td>
                  {publishingState[artist.artistId] ? (
                    <button disabled>Published</button>
                  ) : (
                    <button onClick={() => handlePublish(artist)}>Publish</button>
                  )}
                  <button onClick={() => handleDelete(artist.artistId)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default GetPremiumArtistDetails;
