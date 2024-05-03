import React, { useState, useEffect } from "react";
import DisplayTopArtists from "./components/DisplayTopArtists";
import "./App.css";

const CLIENT_ID = "24b0c79e347c465fa026eab253ca42a5";
const redirectUri = "https://spotirank.netlify.app/callback";
//const redirectUri = "http://localhost:5173/callback";

const App = () => {
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [topArtists, setTopArtists] = useState([]);

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");

    if (accessToken) {
      setToken(accessToken);
      window.localStorage.setItem("accessToken", accessToken);
      const expiresIn = parseInt(params.get("expires_in"));
      const expiryTime = new Date().getTime() + expiresIn * 1000;
      window.localStorage.setItem("tokenExpiry", expiryTime);
    } else {
      const storedToken = window.localStorage.getItem("accessToken");
      const expiryTime = parseInt(window.localStorage.getItem("tokenExpiry"));
      if (storedToken && expiryTime && expiryTime > new Date().getTime()) {
        setToken(storedToken);
      }
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else if (response.status === 401) {
          console.error("Unauthorized");
          const refreshedToken = await refreshAccessToken();
          if (refreshedToken) {
            setToken(refreshedToken);
            fetchUserData();
          } else {
            console.error("Failed to refresh token");
          }
        } else {
          console.error("Error fetching user data");
          // Handle other errors
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchTopArtists = async () => {
      try {
        const response = await fetch(
          "https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=15",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setTopArtists(data.items);
          console.log(data.items);
        } else if (response.status === 401) {
          console.error("Unauthorized");
          const refreshedToken = await refreshAccessToken();
          if (refreshedToken) {
            setToken(refreshedToken);
            fetchTopArtists();
          } else {
            console.error("Failed to refresh token");
          }
        } else {
          console.error("Error fetching artist data");
          // Handle other errors
        }
      } catch (error) {
        console.error("Error fetching artist data:", error);
      }
    };

    if (token) {
      fetchUserData();
      fetchTopArtists();
    }
  }, [token]);

  const handleLogin = () => {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${redirectUri}&scope=user-read-private%20user-read-email%20user-top-read`;
    window.location.href = authUrl;
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = window.localStorage.getItem("refreshToken");
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: CLIENT_ID,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const newAccessToken = data.access_token;
        const expiresIn = data.expires_in;
        const expiryTime = new Date().getTime() + expiresIn * 1000;
        window.localStorage.setItem("accessToken", newAccessToken);
        window.localStorage.setItem("tokenExpiry", expiryTime);
        return newAccessToken;
      } else {
        console.error("Error refreshing access token:", data);
        return null;
      }
    } catch (error) {
      console.error("Error refreshing access token:", error);
      return null;
    }
  };

  return (
    <div>
      <div>
        {!token ? (
          <div className="button-container">
            <button className="login-button" onClick={handleLogin}>
              Login with Spotify
            </button>
          </div>
        ) : (
          topArtists && DisplayTopArtists(topArtists)
        )}
        {/* {topArtists && <h1>{topArtists[0]}</h1>} */}
      </div>
    </div>
  );
};

export default App;
