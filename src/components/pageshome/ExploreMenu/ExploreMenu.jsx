import React, { useEffect, useState, useRef } from "react";
import "./ExploreMenu.css";

const ExploreMenu = ({ category, setCategory, artist, setArtist }) => {
  const [genreList, setGenreList] = useState([]);
  const [artistList, setArtistList] = useState([]);
  const [genreSort, setGenreSort] = useState("asc");
  const [artistSort, setArtistSort] = useState("asc");

  const genreFilterRef = useRef(null);
  const artistFilterRef = useRef(null);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/getallgenres');
        if (!response.ok) throw new Error('Failed to fetch genres');
        const data = await response.json();
        setGenreList(data.genres || []);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    const fetchArtists = async () => {
      try {
        const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/getartists');
        if (!response.ok) throw new Error('Failed to fetch artists');
        const data = await response.json();
        if (Array.isArray(data)) {
          setArtistList(data);
        } else {
          console.error('Invalid artists data format:', data);
        }
      } catch (error) {
        console.error('Error fetching artists:', error);
      }
    };

    fetchGenres();
    fetchArtists();
  }, []);

  const sortedGenreList = [...genreList].sort((a, b) =>
    genreSort === "asc"
      ? a.genre_name.localeCompare(b.genre_name)
      : b.genre_name.localeCompare(a.genre_name)
  );

  const sortedArtistList = [...artistList].sort((a, b) =>
    artistSort === "asc"
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name)
  );

  const scrollLeft = (ref) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: -ref.current.offsetWidth / 5,
        behavior: 'smooth',
      });
    }
  };

  const scrollRight = (ref) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: ref.current.offsetWidth / 5,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="explore-menu" id="explore-menu">
      <h1>Explore Our Music</h1>
      <p className="explore-menu-text">
        Explore a vibrant world of music genres and find your next favorite tune. Dive into a diverse selection and let the rhythm guide you to new musical adventures.
      </p>

      {/* Genre Filter */}
      <div className="filter-section">
        <h2>Genres</h2>
        <div className="filter-container">
          <div className="sort-buttons">
            <button
              className={`sort-button ${genreSort === "asc" ? "active" : ""}`}
              onClick={() => setGenreSort("asc")}
            >
              A
            </button>
            <button
              className={`sort-button ${genreSort === "desc" ? "active" : ""}`}
              onClick={() => setGenreSort("desc")}
            >
              D
            </button>
          </div>
          <div className="explore-menu-list-container">
            <div className="arrow arrow-left" onClick={() => scrollLeft(genreFilterRef)}>&lt;</div>
            <div className="explore-menu-list" ref={genreFilterRef}>
              {sortedGenreList.length > 0 ? (
                sortedGenreList.map((item) => (
                  <div
                    onClick={() =>
                      setCategory((prev) =>
                        prev === item.genre_name ? "All" : item.genre_name
                      )
                    }
                    key={item.id}
                    className={`explore-menu-list-item ${
                      category === item.genre_name ? "active" : ""
                    }`}
                  >
                    <p>{item.genre_name}</p>
                  </div>
                ))
              ) : (
                <p>No genres available</p>
              )}
            </div>
            <div className="arrow arrow-right" onClick={() => scrollRight(genreFilterRef)}>&gt;</div>
          </div>
        </div>
      </div>

      <hr />

      {/* Artist Filter */}
      <div className="filter-section">
        <h2>Artists</h2>
        <div className="filter-container">
          <div className="sort-buttons">
            <button
              className={`sort-button ${artistSort === "asc" ? "active" : ""}`}
              onClick={() => setArtistSort("asc")}
            >
              A
            </button>
            <button
              className={`sort-button ${artistSort === "desc" ? "active" : ""}`}
              onClick={() => setArtistSort("desc")}
            >
              D
            </button>
          </div>
          <div className="explore-menu-list-container">
            <div className="arrow arrow-left" onClick={() => scrollLeft(artistFilterRef)}>&lt;</div>
            <div className="explore-menu-list" ref={artistFilterRef}>
              {sortedArtistList.length > 0 ? (
                sortedArtistList.map((item) => (
                  <div
                    onClick={() =>
                      setArtist((prev) =>
                        prev === item.name ? "All" : item.name
                      )
                    }
                    key={item.id}
                    className={`explore-menu-list-item ${
                      artist === item.name ? "active" : ""
                    }`}
                  >
                    <p>{item.name}</p>
                  </div>
                ))
              ) : (
                <p>No artists available</p>
              )}
            </div>
            <div className="arrow arrow-right" onClick={() => scrollRight(artistFilterRef)}>&gt;</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExploreMenu;
