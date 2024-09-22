import React, { useState } from "react";
import { toast } from "react-toastify";
import './AddItems.css';

const AddItems = () => {
  const [formData, setFormData] = useState({
    name: "",
    numberOfTracks: "",
    year: "",
    category: "",
    albumArt: null,
    musicTrack: null,
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const getPresignedUrl = async (fileName, contentType) => {
    try {
      const response = await fetch(`https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/uploadmagenew/${fileName}?contentType=${contentType}`);
      if (!response.ok) throw new Error('Failed to fetch pre-signed URL');
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error(`Error fetching pre-signed URL: ${error.message}`);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!formData.albumArt || !formData.musicTrack) throw new Error('Please provide both album art and music track.');

      const albumArtFileName = formData.albumArt.name;
      const musicTrackFileName = formData.musicTrack.name;

      // Get pre-signed URLs
      const albumArtUrl = await getPresignedUrl(albumArtFileName, formData.albumArt.type);
      const musicTrackUrl = await getPresignedUrl(musicTrackFileName, formData.musicTrack.type);

      // Upload files to S3
      const uploadAlbumArtResponse = await fetch(albumArtUrl, {
        method: 'PUT',
        body: formData.albumArt,
      });
      if (!uploadAlbumArtResponse.ok) throw new Error('Failed to upload album art');

      const uploadMusicTrackResponse = await fetch(musicTrackUrl, {
        method: 'PUT',
        body: formData.musicTrack,
      });
      if (!uploadMusicTrackResponse.ok) throw new Error('Failed to upload music track');

      // Prepare metadata
      const metadata = {
        name: formData.name,
        numberOfTracks: formData.numberOfTracks,
        year: formData.year,
        category: formData.category,
        albumArtKey: `uploads/album-art/${albumArtFileName}`,
        musicTrackKey: `uploads/music-tracks/${musicTrackFileName}`,  // Updated path
      };
      
      // Log metadata for debugging
      console.log("Metadata to be sent:", metadata);

      // Send metadata to backend
      const metadataResponse = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/addmusic', {
        method: "POST",
        body: JSON.stringify(metadata),
        headers: {
          "Content-Type": "application/json"
        },
      });

      if (!metadataResponse.ok) throw new Error('Failed to add item');

      const result = await metadataResponse.json();
      toast.success(result.message || "Item added successfully!");
      setFormData({
        name: "",
        numberOfTracks: "",
        year: "",
        category: "",
        albumArt: null,
        musicTrack: null,  // Clear music track field
      }); // Clear form after submission
    } catch (error) {
      toast.error(`An error occurred: ${error.message}`);
    }
  };

  return (
    <div className="add">
      <form className="flex-col" onSubmit={handleSubmit}>
        <div className="add-image-upload">
          <p>Upload Album Art</p>
          <label htmlFor="albumArt" className="file-upload-button">
            {formData.albumArt ? formData.albumArt.name : "Choose Album Art"}
            <input
              type="file"
              id="albumArt"
              name="albumArt"
              accept="image/*"
              onChange={handleChange}
              hidden
              required
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
        <div className="add-music-track-upload">
          <p>Upload Music Track</p>
          <label htmlFor="musicTrack" className="file-upload-button">
            {formData.musicTrack ? formData.musicTrack.name : "Choose Music Track"}
            <input
              type="file"
              id="musicTrack"
              name="musicTrack"
              accept="audio/mpeg"
              onChange={handleChange}
              hidden
              required
            />
          </label>
        </div>
        <div className="add-music-info">
          <div className="add-product-name">
            <p>Track Name</p>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Type here"
              required
            />
          </div>
          <div className="add-number-of-tracks">
            <p>Number of Tracks</p>
            <input
              type="number"
              name="numberOfTracks"
              value={formData.numberOfTracks}
              onChange={handleChange}
              placeholder="Number of Tracks"
              required
            />
          </div>
          <div className="add-year">
            <p>Release Year</p>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              placeholder="Release Year"
              required
            />
          </div>
          <div className="add-category">
            <p>Category</p>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
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
          </div>
        </div>
        <button type="submit" className="add-button">
          Add Track
        </button>
      </form>
    </div>
  );
};

export default AddItems;
