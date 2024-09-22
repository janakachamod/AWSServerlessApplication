import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import './ListTracks.css'; // Ensure this file exists and has necessary styles

const ListTracks = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTrack, setEditTrack] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    file: null,
    artistId: "",
  });
  const [artists, setArtists] = useState([]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setEditTrack(null); // Clear editTrack when closing modal
    setFormData({ name: "", file: null, artistId: "" }); // Reset form data
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([fetchTrackData(), fetchArtists()]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (editTrack) {
      setFormData({
        name: editTrack.trackName || '',
        file: null,
        artistId: editTrack.artistId || '',
      });
      console.log('Edit Track Loaded:', editTrack);
    }
  }, [editTrack]);

  const fetchTrackData = async () => {
    try {
      const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/get_all_tracks');
      if (!response.ok) throw new Error('Failed to fetch track data');
      const data = await response.json();
      setTracks(data.tracks || []); // Adjust based on actual response structure
      console.log('Track Data:', data.tracks);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchArtists = async () => {
    try {
      const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/getartists');
      if (!response.ok) throw new Error('Failed to fetch artists');
      const data = await response.json();
      console.log('Raw Response:', data); // Log raw response
      if (Array.isArray(data)) {
        setArtists(data); // Use data directly if it's an array
      } else if (data.artists) {
        setArtists(data.artists); // Use data.artists if it's an object with artists property
      } else {
        console.error('Unexpected response format:', data);
      }
    } catch (error) {
      console.error(`Error fetching artists: ${error.message}`);
      toast.error(`Failed to load artists: ${error.message}`);
    }
  };

  const handleEditClick = (track) => {
    setEditTrack(track);
    openModal(); // Open modal when edit button is clicked
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    if (!editTrack) {
      setError("No track selected for editing.");
      return;
    }

    if (formData.name === editTrack.trackName && !formData.file && formData.artistId === editTrack.artistId) {
      setError("No changes detected.");
      return;
    }

    try {
      const metadata = {
        trackId: editTrack.trackId,
        name: formData.name || editTrack.trackName,
        fileKey: editTrack.fileKey || '',
        artistId: formData.artistId || editTrack.artistId,
      };

      if (formData.file) {
        const fileName = formData.file.name;
        const fileUrl = await getPresignedUrl(fileName, formData.file.type);

        const uploadResponse = await fetch(fileUrl, {
          method: 'PUT',
          body: formData.file,
        });

        if (!uploadResponse.ok) throw new Error('Failed to upload new file');
        metadata.fileKey = `uploads/music-tracks/${fileName}`;
      } else {
        metadata.fileKey = editTrack.fileKey;
      }

      const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/update-track', {
        method: "PUT",
        body: JSON.stringify(metadata),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update track');
      }

      await fetchTrackData();
      closeModal(); // Close modal after successful update
      toast.success("Track updated successfully!");
    } catch (error) {
      console.error('Error updating track:', error);
      toast.error(`Error updating track: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this track?")) {
      try {
        const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/delete_track', {
          method: "DELETE",
          body: JSON.stringify({ trackId: id }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error Response:', errorData);
          throw new Error(errorData.message || 'Failed to delete track');
        }

        await fetchTrackData();
        toast.success("Track deleted successfully!");
      } catch (error) {
        console.error('Error deleting track:', error.message);
        toast.error(`Error deleting track: ${error.message}`);
      }
    }
  };

  const getPresignedUrl = async (fileName, contentType) => {
    try {
      const response = await fetch(`https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/uploadfile/${fileName}?contentType=${contentType}`);
      if (!response.ok) throw new Error('Failed to fetch pre-signed URL');
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error(`Error fetching pre-signed URL: ${error.message}`);
      throw error;
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="list-tracks">
      <h2>All Tracks List</h2>
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            {editTrack && (
              <form onSubmit={handleUpdateSubmit} className="edit-form">
                <h3>Edit Track</h3>
                <input
                  type="text"
                  placeholder="Track Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <div className="upload-file">
                  <p>Upload New File (optional)</p>
                  <label htmlFor="file" className="file-upload-button">
                    {formData.file ? formData.file.name : "Choose New File"}
                    <input
                      type="file"
                      id="file"
                      name="file"
                      accept="audio/*"
                      onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                      hidden
                    />
                  </label>
                </div>
                <div className="select-artist">
                  <p>Artist</p>
                  <select
                    name="artistId"
                    value={formData.artistId}
                    onChange={(e) => setFormData({ ...formData, artistId: e.target.value })}
                    required
                  >
                    <option value="" disabled>Select an artist</option>
                    {artists.length > 0 ? (
                      artists.map((artist) => (
                        <option key={artist.artistId} value={artist.artistId}>
                          {artist.name}
                        </option>
                      ))
                    ) : (
                      <option value="">No artists available</option>
                    )}
                  </select>
                </div>
                <button type="submit">Update</button>
                <button type="button" onClick={closeModal}>Cancel</button>
              </form>
            )}
          </div>
        </div>
      )}
      <div className="list-table">
        <div className="list-table-format title">
          <b>Name</b>
          <b>File</b>
          <b>Artist Name</b>
          <b>Artist ID</b>
          <b>Actions</b>
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
            <button onClick={() => handleEditClick(track)}>Edit</button>
            <button onClick={() => handleDelete(track.trackId)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListTracks;
