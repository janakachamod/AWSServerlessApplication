import React, { useEffect, useState } from 'react';
import './MainDashboard.css';

const MainDashboard = () => {
  const [popularAlbum, setPopularAlbum] = useState(null);
  const [popularTrack, setPopularTrack] = useState(null);
  const [popularArtist, setPopularArtist] = useState(null);
  const [popularGenre, setPopularGenre] = useState(null);
  const [userCount, setUserCount] = useState(null);
  const [totalTracks, setTotalTracks] = useState(null);
  const [totalAlbums, setTotalAlbums] = useState(null);
  const [totalArtists, setTotalArtists] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch popular album
        const albumResponse = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/popularalbumgetfordashboard');
        if (!albumResponse.ok) throw new Error('Failed to fetch album data');
        const albumData = await albumResponse.json();
        setPopularAlbum(albumData);

        // Fetch popular track
        const trackResponse = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/populartrackgetfordashboard');
        if (!trackResponse.ok) throw new Error('Failed to fetch track data');
        const trackData = await trackResponse.json();
        setPopularTrack(trackData);

        // Fetch popular artist
        const artistResponse = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/popularartistgetfordashboard');
        if (!artistResponse.ok) throw new Error('Failed to fetch artist data');
        const artistData = await artistResponse.json();
        setPopularArtist(artistData);

        // Fetch popular genre
        const genreResponse = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/populargenresgetfordashboard');
        if (!genreResponse.ok) throw new Error('Failed to fetch genre data');
        const genreData = await genreResponse.json();
        setPopularGenre(genreData);

        // Fetch user count
        const userCountResponse = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/getuserscount');
        if (!userCountResponse.ok) throw new Error('Failed to fetch user count');
        const userCountData = await userCountResponse.json();
        setUserCount(userCountData.userCount);

        // Fetch total tracks count
        const totalTracksResponse = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/counttotaltracks');
        if (!totalTracksResponse.ok) throw new Error('Failed to fetch total tracks count');
        const totalTracksData = await totalTracksResponse.json();
        setTotalTracks(totalTracksData.totalTracks);

        // Fetch total albums count
        const totalAlbumsResponse = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/counttotalalbums');
        if (!totalAlbumsResponse.ok) throw new Error('Failed to fetch total albums count');
        const totalAlbumsData = await totalAlbumsResponse.json();
        setTotalAlbums(totalAlbumsData.totalAlbums);

        // Fetch total artists count
        const totalArtistsResponse = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/counttotalartists');
        if (!totalArtistsResponse.ok) throw new Error('Failed to fetch total artists count');
        const totalArtistsData = await totalArtistsResponse.json();
        setTotalArtists(totalArtistsData.totalArtists);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard-container">
      {error && <div className="error">Error: {error}</div>}

      <div className="box">
        <h2>Most Popular Album</h2>
        {popularAlbum ? (
          <div>
            <img src={`https://uploadmagenew.s3.eu-north-1.amazonaws.com/${popularAlbum.albumArtKey}`} alt="Album Art" />
            <p>{popularAlbum.name}</p>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <div className="box">
        <h2>Most Popular Track</h2>
        {popularTrack ? (
          <div>
            <audio controls>
              <source src={`https://uploadmagenew.s3.eu-north-1.amazonaws.com/${popularTrack.fileKey}`} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <p>{popularTrack.trackName}</p>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <div className="box">
        <h2>Most Popular Artist</h2>
        {popularArtist ? (
          <div>
            <img src={`https://uploadmagenew.s3.eu-north-1.amazonaws.com/${popularArtist.artistAvatar}`} alt="Artist Avatar" />
            <p>{popularArtist.artistName}</p>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <div className="box">
        <h2>Most Popular Genre</h2>
        {popularGenre ? (
          <p>{popularGenre.genre} (Popularity: {popularGenre.popularity})</p>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <div className="box">
        <h2>Total Users</h2>
        {userCount !== null ? (
          <p>{userCount}</p>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <div className="box">
        <h2>Total Tracks</h2>
        {totalTracks !== null ? (
          <p>{totalTracks}</p>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <div className="box">
        <h2>Total Albums</h2>
        {totalAlbums !== null ? (
          <p>{totalAlbums}</p>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <div className="box">
        <h2>Total Artists</h2>
        {totalArtists !== null ? (
          <p>{totalArtists}</p>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      {/* New Info Box */}
      <div className="info-box">
        <h2>Music Analytics Dashboard</h2>
        <p>Welcome to the music analytics dashboard. Here you can find key metrics and insights into your music library, helping you make data-driven decisions and enhance user experience.</p>
      </div>
    </div>
  );
};

export default MainDashboard;
