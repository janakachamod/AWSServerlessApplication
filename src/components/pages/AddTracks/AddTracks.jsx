import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import './AddTracks.css'; // Add your custom CSS

const AddTrack = () => {
  const [formData, setFormData] = useState({
    name: "",
    file: null,
    artistId: "", // Add artistId to formData
  });
  const [artists, setArtists] = useState([]); // State to store artists list

  useEffect(() => {
    // Fetch available artists when component mounts
    const fetchArtists = async () => {
      try {
        const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/getartists');
        if (!response.ok) throw new Error('Failed to fetch artists');
        const data = await response.json();
        setArtists(data); // Assuming response is an array of artists
      } catch (error) {
        console.error(`Error fetching artists: ${error.message}`);
        toast.error(`Failed to load artists: ${error.message}`);
      }
    };

    fetchArtists();
  }, []);

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
      if (!formData.file) throw new Error('Please provide a music track file.');
      if (!formData.artistId) throw new Error('Please select an artist.');

      const fileName = formData.file.name;

      // Get pre-signed URL
      const fileUrl = await getPresignedUrl(fileName, formData.file.type);

      // Upload file to S3
      const uploadFileResponse = await fetch(fileUrl, {
        method: 'PUT',
        body: formData.file,
      });
      if (!uploadFileResponse.ok) throw new Error('Failed to upload file');

      // Prepare metadata
      const metadata = {
        name: formData.name,
        fileKey: `uploads/music-tracks/${fileName}`,
        artistId: formData.artistId, // Include artistId
      };

      // Log metadata for debugging
      console.log("Metadata to be sent:", metadata);

      // Send metadata to backend
      const metadataResponse = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/add_tracks', {
        method: "POST",
        body: JSON.stringify(metadata),
        headers: {
          "Content-Type": "application/json"
        },
      });

      if (!metadataResponse.ok) throw new Error('Failed to add track');

      const result = await metadataResponse.json();
      toast.success(result.message || "Track added successfully!");
      setFormData({
        name: "",
        file: null,
        artistId: "", // Clear artistId after submission
      }); // Clear form after submission
    } catch (error) {
      toast.error(`An error occurred: ${error.message}`);
    }
  };

  return (
    <div className="add-track">
      <form className="flex-col" onSubmit={handleSubmit}>
        <div className="add-track-upload">
          <p>Upload Music Track</p>
          <label htmlFor="file" className="file-upload-button">
            {formData.file ? formData.file.name : "Choose Music Track"}
            <input
              type="file"
              id="file"
              name="file"
              accept="audio/mpeg"
              onChange={handleChange}
              hidden
              required
            />
          </label>
        </div>
        <div className="add-track-info">
          <div className="add-track-name">
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
          <div className="add-track-artist">
            <p>Artist</p>
            <select
              name="artistId"
              value={formData.artistId}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select an artist</option>
              {artists.map((artist) => (
                <option key={artist.artistId} value={artist.artistId}>
                  {artist.name}
                </option>
              ))}
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

export default AddTrack;
