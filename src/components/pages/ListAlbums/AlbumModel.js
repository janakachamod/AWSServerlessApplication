import React from 'react';
import './AlbumModel.css'; // Assuming you have this file for styling

const AlbumModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  genres,
  artists,
  onAddGenre,
  newGenre,
  setNewGenre,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Album</h2>
        <form onSubmit={onSubmit}>
          <label>
            Name:
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </label>
          <label>
            Number of Tracks:
            <input
              type="number"
              value={formData.numberOfTracks}
              onChange={(e) => setFormData({ ...formData, numberOfTracks: e.target.value })}
            />
          </label>
          <label>
            Studio:
            <input
              type="text"
              value={formData.studio}
              onChange={(e) => setFormData({ ...formData, studio: e.target.value })}
            />
          </label>
          <label>
            Genre:
            <select
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
            >
              {genres.map((genre) => (
                <option key={genre.id} value={genre.genre_name}>
                  {genre.genre_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status:
            <input
              type="checkbox"
              checked={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
            />
          </label>
          <label>
            Artist:
            <select
              value={formData.artistId}
              onChange={(e) => setFormData({ ...formData, artistId: e.target.value })}
            >
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Album Art:
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, albumArt: e.target.files[0] })}
            />
          </label>
          <label>
            Add Genre:
            <input
              type="text"
              value={newGenre}
              onChange={(e) => setNewGenre(e.target.value)}
            />
            <button type="button" onClick={onAddGenre}>
              Add Genre
            </button>
          </label>
          <button type="submit">Save Changes</button>
        </form>
        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default AlbumModal;
