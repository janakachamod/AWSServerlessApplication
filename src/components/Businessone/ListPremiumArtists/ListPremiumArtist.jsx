import React, { useEffect, useState } from "react";
import "./ListPremiumArtists.css";
import { toast } from "react-toastify";

const ListPremiumArtist = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editArtist, setEditArtist] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    avatar: null,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Fetch user email from local storage and artist data
  useEffect(() => {
    const email = localStorage.getItem("email");
    if (email) {
      setUserEmail(email);
      fetchArtistData(email);
    } else {
      setError("User email not found.");
      setLoading(false);
    }
  }, []);

  // Fetch artist data
  const fetchArtistData = async (email) => {
    setLoading(true);
    try {
      const response = await fetch(`https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/getartistpremium?userEmail=${encodeURIComponent(email)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch artist data');
      }
      const data = await response.json();
      setArtists(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Open the edit modal
  const handleEditClick = (artist) => {
    setEditArtist(artist);
    setFormData({
      name: artist.name,
      bio: artist.bio,
      avatar: null,
    });
    setIsModalOpen(true);
  };

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditArtist(null);
    setFormData({ name: "", bio: "", avatar: null });
  };

  // Handle form submit for updating artist details
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    if (!editArtist) {
      setError("No artist selected for editing.");
      return;
    }

    try {
      const metadata = {
        artistId: editArtist.artistId,
        name: formData.name || editArtist.name,
        bio: formData.bio || editArtist.bio,
        avatarKey: editArtist.avatarKey || '',
        oldAvatarKey: editArtist.avatarKey || '',
      };

      if (formData.avatar) {
        const avatarName = formData.avatar.name;
        const avatarUrl = await getPresignedUrl(avatarName, formData.avatar.type);

        const uploadResponse = await fetch(avatarUrl, {
          method: 'PUT',
          body: formData.avatar,
        });

        if (!uploadResponse.ok) throw new Error('Failed to upload new avatar');
        metadata.avatarKey = `uploads/artist-avatars/${avatarName}`;
      }

      const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/updateartistpremium', {
        method: "PUT",
        body: JSON.stringify(metadata),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error('Failed to update artist');

      fetchArtistData(userEmail);
      closeModal();
      toast.success("Artist updated successfully!");
    } catch (error) {
      toast.error(`Error updating artist: ${error.message}`);
    }
  };

  // Handle deleting an artist
  const handleDelete = async (artistId) => {
    try {
      const response = await fetch(`https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/deleteartistpremium?artistId=${artistId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Artist already available in Track');

      fetchArtistData(userEmail);
      toast.success("Artist deleted successfully!");
    } catch (error) {
      toast.error(`Sorry, you can't delete this artist: ${error.message}`);
    }
  };

  // Get presigned URL for avatar upload
  const getPresignedUrl = async (fileName, contentType) => {
    try {
      const response = await fetch(`https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/uploadfile/${fileName}?contentType=${contentType}`);
      if (!response.ok) throw new Error('Failed to fetch pre-signed URL');
      const data = await response.json();
      return data.url;
    } catch (err) {
      throw new Error('Failed to get pre-signed URL');
    }
  };

  return (
    <div className="list-artists">
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
                  <button onClick={() => handleEditClick(artist)}>Edit</button>
                  <button onClick={() => handleDelete(artist.artistId)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal for editing artist */}
      {isModalOpen && (
        <div className="modal open">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <form onSubmit={handleUpdateSubmit} className="edit-form">
              <h3>Edit Artist</h3>
              <label>
                Name:
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </label>
              <label>
                Bio:
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  required
                />
              </label>
              <label>
                Avatar:
                <input
                  type="file"
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.files[0] })}
                />
              </label>
              <button type="submit">Update</button>
              <button type="button" onClick={closeModal}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListPremiumArtist;
