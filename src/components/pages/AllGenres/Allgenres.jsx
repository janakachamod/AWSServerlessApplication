// src/components/AllGenres.jsx
import React, { useState, useEffect } from 'react';
import './AllGenres.css';

const AllGenres = () => {
  const [genres, setGenres] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [newGenreName, setNewGenreName] = useState('');

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/getallgenres');
      const data = await response.json();
      if (response.ok) {
        setGenres(data.genres);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/deletegenre', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        fetchGenres();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error deleting genre:', error);
    }
  };

  const handleEdit = (genre) => {
    setSelectedGenre(genre);
    setNewGenreName(genre.genre_name);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedGenre(null);
    setNewGenreName('');
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/updategenre', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedGenre.id, genre_name: newGenreName }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        handleModalClose();
        fetchGenres();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error updating genre:', error);
    }
  };

  return (
    <div className="all-genres">
      <h1>Genres List</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Genre Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {genres.map((genre) => (
            <tr key={genre.id}>
              <td>{genre.id}</td>
              <td>{genre.genre_name}</td>
              <td>
                <button onClick={() => handleEdit(genre)}>Edit</button>
                <button onClick={() => handleDelete(genre.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Genre</h2>
            <label>
              Genre Name:
              <input
                type="text"
                value={newGenreName}
                onChange={(e) => setNewGenreName(e.target.value)}
              />
            </label>
            <button onClick={handleUpdate}>Update</button>
            <button onClick={handleModalClose}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllGenres;
