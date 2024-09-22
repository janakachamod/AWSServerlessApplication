import React from 'react';
import './TrackModel.css';

const TrackModal = ({ item, onClose }) => {
  return (
    <div className="track-modal-overlay">
      <div className="track-modal-content">
        <button className="track-modal-close" onClick={onClose}>X</button>
        
        <h3>{item.trackName}</h3>
        <p><strong>Artist:</strong> {item.artistName}</p>
        <img
          src={`https://uploadmagenew.s3.eu-north-1.amazonaws.com/${item.artistAvatar}`} // URL for artist image
          alt={item.artistName}
          className="artist-avatar"
        />
        
        <p><strong>Duration:</strong> {formatDuration(item.duration)}</p> {/* Format the duration */}
        <div className="track-modal-audio">
          <audio controls>
            <source src={`https://uploadmagenew.s3.eu-north-1.amazonaws.com/${item.fileKey}`} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>
    </div>
  );
};

// Helper function to format the duration
const formatDuration = (duration) => {
  if (!duration) return 'N/A'; // Handle missing duration

  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export default TrackModal;
