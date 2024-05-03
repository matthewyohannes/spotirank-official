import React from "react";
import "../App.css";

const DisplayTopArtists = (topArtists) => {
  return (
    <div>
      <div className="artist-container">
        <article>
          <h1>
            Welcome to Spotirank!
            <br />
            Here are your Top Artists
          </h1>
          <h5>This data is from the last 4 weeks!</h5>
        </article>
      </div>
      {topArtists.map((artist) => (
        <li key={artist.id}>
          <div className="artist-card">
            <img
              src={artist.images[2].url}
              alt={artist.name}
              className="artist-image"
            />
            <div className="artist-info">
              <p className="artist-name">{artist.name}</p>
            </div>
          </div>
        </li>
      ))}
    </div>
  );
};

export default DisplayTopArtists;
