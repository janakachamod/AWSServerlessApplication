import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import './Addalbums.css'; // Add your custom CSS

const AddAlbum = () => {
  const [formData, setFormData] = useState({
    name: "",
    numberOfTracks: "",
    albumArt: null,
    artistId: "",
    studio: "",
    genre: "",
    sortOrder: "",
    status: true
  });
  const [artists, setArtists] = useState([]);
  const [genres, setGenres] = useState([]);

  // Fetch artist data
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/getartists');
        if (!response.ok) throw new Error('Failed to fetch artist data');
        const data = await response.json();
        setArtists(data || []);
      } catch (error) {
        console.error(`Error fetching artists: ${error.message}`);
        toast.error('Failed to load artists');
      }
    };

    // Fetch genres data
    const fetchGenres = async () => {
      try {
        const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/getallgenres');
        if (!response.ok) throw new Error('Failed to fetch genre data');
        const data = await response.json();
        setGenres(data.genres || []);
      } catch (error) {
        console.error(`Error fetching genres: ${error.message}`);
        toast.error('Failed to load genres');
      }
    };

    fetchArtists();
    fetchGenres();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "file" ? files[0] : type === "checkbox" ? checked : value,
    }));
  };

  const getPresignedUrl = async (fileName, contentType) => {
    try {
      const response = await fetch(`https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/presingedforalbum?filename=${fileName}&contentType=${contentType}`);
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
      if (!formData.albumArt) throw new Error('Please provide an album art image.');

      const fileName = formData.albumArt.name;
      const contentType = formData.albumArt.type;

      // Get pre-signed URL
      const fileUrl = await getPresignedUrl(fileName, contentType);

      // Upload file to S3
      const uploadFileResponse = await fetch(fileUrl, {
        method: 'PUT',
        body: formData.albumArt,
      });
      if (!uploadFileResponse.ok) throw new Error('Failed to upload file');

      // Prepare metadata
      const metadata = {
        name: formData.name,
        numberOfTracks: parseInt(formData.numberOfTracks, 10),
        albumArtKey: `uploads/album-pics/${fileName}`,
        artistId: formData.artistId,
        studio: formData.studio || null,
        genre: formData.genre || null,
        sortOrder: parseInt(formData.sortOrder, 10) || null,
        status: formData.status
      };

      // Log metadata for debugging
      console.log("Metadata to be sent:", metadata);

      // Send metadata to backend
      const metadataResponse = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/addalbums', {
        method: "POST",
        body: JSON.stringify(metadata),
        headers: {
          "Content-Type": "application/json"
        },
      });

      if (!metadataResponse.ok) throw new Error('Failed to add album');

      const result = await metadataResponse.json();
      toast.success(result.message || "Album added successfully!");
      setFormData({
        name: "",
        numberOfTracks: "",
        albumArt: null,
        artistId: "",
        studio: "",
        genre: "",
        sortOrder: "",
        status: true
      }); // Clear form after submission
    } catch (error) {
      toast.error(`An error occurred: ${error.message}`);
    }
  };

  return (
    <div className="add-album">
      <form className="flex-col" onSubmit={handleSubmit}>
        <div className="add-album-upload">
          <p>Upload Album Art</p>
          <label htmlFor="albumArt" className="file-upload-button">
            {formData.albumArt ? formData.albumArt.name : "Choose Album Art Image"}
            <input
              type="file"
              id="albumArt"
              name="albumArt"
              accept="image/jpeg, image/png, image/gif"
              onChange={handleChange}
              hidden
              required
            />
          </label>
        </div>
        <div className="add-album-info">
          <div className="add-album-name">
            <p>Album Name</p>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Type here"
              required
            />
          </div>
          <div className="add-album-numberOfTracks">
            <p>Number of Tracks</p>
            <input
              type="number"
              name="numberOfTracks"
              value={formData.numberOfTracks}
              onChange={handleChange}
              placeholder="Type here"
              required
            />
          </div>
          <div className="add-album-artistId">
            <p>Artist</p>
            <select
              name="artistId"
              value={formData.artistId}
              onChange={handleChange}
              required
            >
              <option value="">Select Artist</option>
              {artists.map((artist) => (
                <option key={artist.artistId} value={artist.artistId}>
                  {artist.name}
                </option>
              ))}
            </select>
          </div>
          <div className="add-album-studio">
            <p>Studio</p>
            <input
              type="text"
              name="studio"
              value={formData.studio}
              onChange={handleChange}
              placeholder="Type here"
            />
          </div>
          <div className="add-album-genre">
            <p>Genre</p>
            <select
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              required
            >
              <option value="">Select Genre</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.genre_name}>
                  {genre.genre_name}
                </option>
              ))}
            </select>
          </div>
          <div className="add-album-sortOrder">
            <p>Sort Order</p>
            <input
              type="number"
              name="sortOrder"
              value={formData.sortOrder}
              onChange={handleChange}
              placeholder="Type here"
            />
          </div>
          <div className="add-album-status">
            <p>Status</p>
            <label>
              <input
                type="checkbox"
                name="status"
                checked={formData.status}
                onChange={handleChange}
              />
              Active
            </label>
          </div>
        </div>
        <button type="submit" className="add-button">
          Add Album
        </button>
      </form>
    </div>
  );
};

export default AddAlbum;
