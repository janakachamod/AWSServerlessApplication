import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import './AddPremiumArtists.css'; // Add your custom CSS

const AddPremiumArtists = () => {
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    avatar: null,
  });
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    // Retrieve user email from local storage or any other method you're using
    const email = localStorage.getItem("email"); // Adjust this if needed
    if (email) {
      setUserEmail(email);
    } else {
      toast.error("User email not found.");
    }
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
      const response = await fetch(`https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/artistpresinged?filename=${fileName}&contentType=${contentType}`);
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
      if (!formData.avatar) throw new Error('Please provide an avatar image.');

      const fileName = formData.avatar.name;
      const contentType = formData.avatar.type;

      // Get pre-signed URL
      const fileUrl = await getPresignedUrl(fileName, contentType);

      // Upload file to S3
      const uploadFileResponse = await fetch(fileUrl, {
        method: 'PUT',
        body: formData.avatar,
      });
      if (!uploadFileResponse.ok) throw new Error('Failed to upload file');

      // Prepare metadata
      const metadata = {
        name: formData.name,
        bio: formData.bio,
        avatarKey: `uploads/artist-avatars/${fileName}`,
        userEmail: userEmail, // Include the user email here
      };

      // Log metadata for debugging
      console.log("Metadata to be sent:", metadata);

      // Send metadata to backend
      const metadataResponse = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/artistaddP', {
        method: "POST",
        body: JSON.stringify(metadata),
        headers: {
          "Content-Type": "application/json"
        },
      });

      if (!metadataResponse.ok) throw new Error('Failed to add artist');

      const result = await metadataResponse.json();
      toast.success(result.message || "Artist added successfully!");
      setFormData({
        name: "",
        bio: "",
        avatar: null,
      }); // Clear form after submission
    } catch (error) {
      toast.error(`An error occurred: ${error.message}`);
    }
  };

  return (
    <div className="add-artist">
      <form className="flex-col" onSubmit={handleSubmit}>
        <div className="add-artist-upload">
          <p>Upload Artist Avatar</p>
          <label htmlFor="avatar" className="file-upload-button">
            {formData.avatar ? formData.avatar.name : "Choose Avatar Image"}
            <input
              type="file"
              id="avatar"
              name="avatar"
              accept="image/jpeg, image/png, image/gif"
              onChange={handleChange}
              hidden
              required
            />
          </label>
        </div>
        <div className="add-artist-info">
          <div className="add-artist-name">
            <p>Artist Name</p>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Type here"
              required
            />
          </div>
          <div className="add-artist-bio">
            <p>Artist Bio</p>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Type here"
              rows="4"
            />
          </div>
        </div>
        <button type="submit" className="add-button">
          Add Artist
        </button>
      </form>
    </div>
  );
};

export default AddPremiumArtists;
