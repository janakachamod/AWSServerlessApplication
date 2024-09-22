import React from "react";
import './MusicModel.css';

const MusicModal = ({ item, onClose }) => {
  if (!item) return null;

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={handleClose}>X</button>
        <h3>{item.albumName}</h3>
        <img
          src={item.albumArtUrl}
          alt={item.albumName}
          className="modal-album-art"
        />
        <p><strong>Artist:</strong> {item.artistName}</p>
        <p><strong>Album:</strong> {item.albumName}</p>
        <p><strong>Genre:</strong> {item.genre}</p>
        <p><strong>Studio:</strong> {item.studio}</p>
        <p><strong>Number of Tracks:</strong> {item.numberOfTracks}</p>
        <p><strong>Artist Bio:</strong> {item.bio}</p>
      </div>
    </div>
  );
};

export default MusicModal;
