import React, { useEffect, useState } from 'react';
import './ListAlbums.css';
import AlbumModal from './AlbumModel'; // Ensure this matches the file name exactly
import { toast } from 'react-toastify';

const ListAlbums = () => {
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editAlbum, setEditAlbum] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    numberOfTracks: '',
    albumArt: null,
    studio: '',
    genre: '',
    status: true,
    artistId: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGenre, setNewGenre] = useState('');

  useEffect(() => {
    const loadData = async () => {
      await fetchAlbumData();
      await fetchArtistData();
      await fetchGenreData();
    };

    loadData();
  }, []);

  const fetchAlbumData = async () => {
    try {
      const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/getalbums');
      if (!response.ok) throw new Error('Failed to fetch album data');
      const data = await response.json();
      console.log('Fetched albums:', data); // Debugging line
      setAlbums(data || []);
    } catch (err) {
      console.error('Error fetching albums:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchArtistData = async () => {
    try {
      const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/getartists');
      if (!response.ok) throw new Error('Failed to fetch artist data');
      const data = await response.json();
      console.log('Fetched artists:', data); // Debugging line
      setArtists(data || []);
    } catch (err) {
      console.error('Error fetching artists:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGenreData = async () => {
    try {
      const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/getallgenres');
      if (!response.ok) throw new Error('Failed to fetch genre data');
      const data = await response.json();
      console.log('Fetched genres:', data); // Debugging line
      setGenres(data.genres || []);
    } catch (err) {
      console.error('Error fetching genres:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (album) => {
    setEditAlbum(album);
    setFormData({
      name: album.name,
      numberOfTracks: album.numberOfTracks,
      albumArt: null,
      studio: album.studio || '',
      genre: album.genre || '',
      status: album.status,
      artistId: album.artistId || '',
    });
    setIsModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    if (!editAlbum) {
      setError('No album selected for editing.');
      return;
    }

    if (
      formData.name === editAlbum.name &&
      formData.numberOfTracks === editAlbum.numberOfTracks &&
      !formData.albumArt &&
      formData.studio === editAlbum.studio &&
      formData.genre === editAlbum.genre &&
      formData.status === editAlbum.status &&
      formData.artistId === editAlbum.artistId
    ) {
      setError('No changes detected.');
      return;
    }

    try {
      const metadata = {
        albumId: editAlbum.albumId,
        name: formData.name || editAlbum.name,
        numberOfTracks: formData.numberOfTracks || editAlbum.numberOfTracks,
        albumArtKey: editAlbum.albumArtKey || '',
        studio: formData.studio || editAlbum.studio,
        genre: formData.genre || editAlbum.genre,
        status: formData.status,
        artistId: formData.artistId || editAlbum.artistId,
      };

      if (formData.albumArt) {
        const avatarName = formData.albumArt.name;
        const avatarUrl = await getPresignedUrl(avatarName, formData.albumArt.type);

        const uploadResponse = await fetch(avatarUrl, {
          method: 'PUT',
          body: formData.albumArt,
        });

        if (!uploadResponse.ok) throw new Error('Failed to upload new album art');
        metadata.albumArtKey = `uploads/album-pics/${avatarName}`;
      } else {
        metadata.albumArtKey = editAlbum.albumArtKey;
      }

      const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/updatealbum', {
        method: 'PUT',
        body: JSON.stringify(metadata),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update album');
      }

      fetchAlbumData();
      setIsModalOpen(false);
      setEditAlbum(null);
      setFormData({
        name: '',
        numberOfTracks: '',
        albumArt: null,
        studio: '',
        genre: '',
        status: true,
        artistId: '',
      });
      setError(null);
    } catch (error) {
      console.error('Error updating album:', error);
      setError(error.message);
    }
  };

  const handleDelete = async (albumId) => {
    try {
      const response = await fetch(`https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/deletealbum?albumId=${albumId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete album');

      const result = await response.json();
      toast.success(result.message || 'Album deleted successfully!');
      fetchAlbumData();
    } catch (error) {
      toast.error(`An error occurred: ${error.message}`);
    }
  };

  const getPresignedUrl = async (fileName, contentType) => {
    try {
      const response = await fetch(`https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/presingedforalbum/${fileName}?contentType=${contentType}`);
      if (!response.ok) throw new Error('Failed to fetch pre-signed URL');
      const data = await response.json();
      return data.url;
    } catch (err) {
      throw new Error('Failed to get pre-signed URL');
    }
  };

  const handleAddGenre = (e) => {
    e.preventDefault();
    if (!newGenre.trim()) return;

    setGenres((prevGenres) => [...prevGenres, { id: Date.now(), genre_name: newGenre }]);
    setNewGenre('');
    toast.success('Genre added successfully!');
  };

  return (
    <div className="list-albums">
      <AlbumModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleUpdateSubmit}
        formData={formData}
        setFormData={setFormData}
        genres={genres}
        artists={artists}
        onAddGenre={handleAddGenre}
        newGenre={newGenre}
        setNewGenre={setNewGenre}
      />
  
      {loading && <p>Loading albums...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && !error && albums.length === 0 && <p>No albums available.</p>}
      {!loading && albums.length > 0 && (
        <table className="albums-table">
          <thead>
            <tr>
              <th>Album Art</th>
              <th>Name</th>
              <th>Number of Tracks</th>
              <th>Studio</th>
              <th>Genre</th>
              <th>Status</th>
              <th>Artist ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {albums.map((album) => (
              <tr key={album.albumId}>
                <td>
                  <img src={album.albumArtUrl} alt={album.name} className="album-art" />
                </td>
                <td>{album.name}</td>
                <td>{album.numberOfTracks}</td>
                <td>{album.studio}</td>
                <td>{album.genre}</td>
                <td>{album.status ? 'Active' : 'Inactive'}</td>
                <td>{album.artistId}</td>
                <td>
                  <button onClick={() => handleEditClick(album)}>Edit</button>
                  <button onClick={() => handleDelete(album.albumId)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ListAlbums;
