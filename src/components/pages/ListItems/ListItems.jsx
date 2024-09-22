import React, { useEffect, useState } from "react";
import "./ListItems.css";

const ListItems = () => {
  const [musicList, setMusicList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    numberOfTracks: "",
    year: "",
    category: "",
    albumArt: null,
    musicTrack: null,
  });

  // Fetch music data
  const fetchMusicData = async () => {
    try {
      const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/getmusic');
      if (!response.ok) {
        throw new Error('Failed to fetch music data');
      }
      const data = await response.json();
      setMusicList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMusicData();
  }, []);

  const handleEditClick = (item) => {
    setEditItem(item);
    setFormData({
      name: item.name,
      numberOfTracks: item.numberOfTracks,
      year: item.year,
      category: item.category,
      albumArt: null,
      musicTrack: null,
    });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    try {
      const metadata = {
        id: editItem.id,
        name: formData.name,
        numberOfTracks: formData.numberOfTracks,
        year: formData.year,
        category: formData.category,
        albumArtKey: editItem.albumArtKey,
        musicTrackKey: editItem.musicTrackKey,
      };

      // Handle new album art upload
      if (formData.albumArt) {
        const albumArtFileName = formData.albumArt.name;
        const albumArtUrl = await getPresignedUrl(albumArtFileName);

        const uploadResponse = await fetch(albumArtUrl, {
          method: 'PUT',
          body: formData.albumArt,
        });

        if (!uploadResponse.ok) throw new Error('Failed to upload new album art');
        metadata.albumArtKey = `uploads/album-art/${albumArtFileName}`;
      }

      // Handle new music track upload
      if (formData.musicTrack) {
        const musicTrackFileName = formData.musicTrack.name;
        const musicTrackUrl = await getPresignedUrl(musicTrackFileName);

        const uploadResponse = await fetch(musicTrackUrl, {
          method: 'PUT',
          body: formData.musicTrack,
        });

        if (!uploadResponse.ok) throw new Error('Failed to upload new music track');
        metadata.musicTrackKey = `uploads/music-tracks/${musicTrackFileName}`;
      }

      const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/updatemusic', {
        method: "PUT",
        body: JSON.stringify(metadata),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      // Refresh music data and clear form
      fetchMusicData();
      setEditItem(null);
      setFormData({
        name: "",
        numberOfTracks: "",
        year: "",
        category: "",
        albumArt: null,
        musicTrack: null,
      });
    } catch (error) {
      console.error('Error updating item:', error);
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/deletemusic', {
          method: "DELETE",
          body: JSON.stringify({ id }), // Ensure id is in the body
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete item');
        }

        // Refresh the music list
        fetchMusicData();
      } catch (error) {
        console.error('Error deleting item:', error);
        setError(error.message);
      }
    }
  };

  const getPresignedUrl = async (fileName) => {
    try {
      const response = await fetch(`https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/uploadmagenew/${fileName}`);
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
    <div className="list">
      <h2>All Music List</h2>
      {editItem && (
        <div className="edit-form-container">
          <form onSubmit={handleUpdateSubmit} className="edit-form">
            <h3>Edit Item</h3>
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Number of Tracks"
              value={formData.numberOfTracks}
              onChange={(e) => setFormData({ ...formData, numberOfTracks: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Release Year"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              required
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Select Category</option>
              <option value="Pop">Pop</option>
              <option value="Rock">Rock</option>
              <option value="Jazz">Jazz</option>
              <option value="Classical">Classical</option>
              <option value="Hip-Hop">Hip-Hop</option>
              <option value="Country">Country</option>
              <option value="Electronic">Electronic</option>
              <option value="Reggae">Reggae</option>
            </select>
            <div className="add-image-upload">
              <p>Upload New Album Art (optional)</p>
              <label htmlFor="albumArt" className="file-upload-button">
                {formData.albumArt ? formData.albumArt.name : "Choose New Album Art"}
                <input
                  type="file"
                  id="albumArt"
                  name="albumArt"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, albumArt: e.target.files[0] })}
                  hidden
                />
              </label>
              {formData.albumArt && (
                <img
                  src={URL.createObjectURL(formData.albumArt)}
                  alt="Album Art Preview"
                  className="image-preview"
                />
              )}
            </div>
            <div className="add-music-upload">
              <p>Upload New Music Track (optional)</p>
              <label htmlFor="musicTrack" className="file-upload-button">
                {formData.musicTrack ? formData.musicTrack.name : "Choose New Music Track"}
                <input
                  type="file"
                  id="musicTrack"
                  name="musicTrack"
                  accept="audio/*"
                  onChange={(e) => setFormData({ ...formData, musicTrack: e.target.files[0] })}
                  hidden
                />
              </label>
            </div>
            <button type="submit">Update</button>
            <button type="button" onClick={() => setEditItem(null)}>Cancel</button>
          </form>
        </div>
      )}
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Year</b>
          <b>Actions</b>
        </div>
        {musicList.map((item) => (
          <div key={item.id} className="list-table-format">
            <img src={`https://uploadmagenew.s3.eu-north-1.amazonaws.com/${item.albumArtKey}`} alt={item.name} />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>{item.year}</p>
            <button onClick={() => handleEditClick(item)}>Edit</button>
            <button onClick={() => handleDelete(item.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListItems;
