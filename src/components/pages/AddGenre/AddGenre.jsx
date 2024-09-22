// AddGenre.jsx
import React, { useState } from 'react';
import './AddGenre.css';

const AddGenre = () => {
  const [genreName, setGenreName] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setGenreName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/add-genre', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ genre_name: genreName }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setGenreName('');
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-genre-container">
      <h1>Add Genre</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="genreName">Genre Name:</label>
        <input
          type="text"
          id="genreName"
          value={genreName}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add Genre'}
        </button>
      </form>
      {message && <p className={`message ${isLoading ? 'loading' : ''}`}>{message}</p>}
    </div>
  );
};

export default AddGenre;
