import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API = "https://ai-movie-recommender-2-nb3t.onrender.com";

function App() {
  const [mood, setMood] = useState("");
  const [movies, setMovies] = useState([]);
  const [genre, setGenre] = useState("");
  const [loading, setLoading] = useState(false);

  // ---------------------
  // GET RECOMMENDATIONS
  // ---------------------
  const getRecommendations = async () => {
    if (!mood) return;

    setLoading(true);

    try {
      const res = await axios.post(`${API}/recommend`, { mood });

      setGenre(res.data.genre);
      setMovies(res.data.movies);
    } catch (error) {
      alert("Server waking up... please try again 🙂");
    }

    setLoading(false);
  };

  // ---------------------
  // SAVE MOVIE
  // ---------------------
  const saveMovie = async (movie) => {
    try {
      await axios.post(`${API}/save`, {
        title: movie.title,
        poster: movie.poster_path,
        genre,
        mood,
      });

      alert("Movie saved ❤️");
    } catch {
      alert("Failed to save movie");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#141414",
        color: "white",
        padding: "30px",
        fontFamily: "Arial",
      }}
    >
      {/* TITLE */}
      <h1 style={{ color: "#e50914", marginBottom: "5px" }}>
        🎬 AI Movie Recommender
      </h1>

      <p style={{ color: "#aaa", marginTop: 0 }}>
        Find movies that match your mood instantly
      </p>

      {/* NAVIGATION */}
      <div style={{ marginBottom: "20px" }}>
        <Link
          to="/saved"
          style={{
            color: "white",
            textDecoration: "none",
            backgroundColor: "#333",
            padding: "8px 12px",
            borderRadius: "6px",
            marginRight: "10px",
          }}
        >
          ❤️ Saved Movies
        </Link>

        <Link
          to="/history"
          style={{
            color: "white",
            textDecoration: "none",
            backgroundColor: "#333",
            padding: "8px 12px",
            borderRadius: "6px",
          }}
        >
          🧠 History
        </Link>
      </div>

      {/* INPUT */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="How are you feeling today?"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          style={{
            padding: "12px",
            width: "300px",
            borderRadius: "8px",
            border: "none",
            marginRight: "10px",
          }}
        />

        <button
          onClick={getRecommendations}
          style={{
            padding: "12px 20px",
            backgroundColor: "#e50914",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Recommend Movies
        </button>
      </div>

      {/* LOADING */}
      {loading && <p>Finding perfect movies for your mood... 🎬✨</p>}

      {/* GENRE */}
      {genre && <h2>Suggested Genre: {genre}</h2>}

      {/* MOVIES */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {movies.map((movie) => (
          <div
            key={movie.id}
            style={{
              width: "200px",
              backgroundColor: "#1c1c1c",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 6px 14px rgba(0,0,0,0.6)",
              transition: "transform 0.3s, box-shadow 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow =
                "0 10px 20px rgba(0,0,0,0.8)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0 6px 14px rgba(0,0,0,0.6)";
            }}
          >
            {movie.poster_path && (
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                style={{ width: "100%" }}
              />
            )}

            <div style={{ padding: "10px" }}>
              <h4 style={{ margin: "0 0 10px 0" }}>{movie.title}</h4>

              <a
                href={`https://www.youtube.com/results?search_query=${movie.title} trailer`}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#e50914", textDecoration: "none" }}
              >
                ▶ Watch Trailer
              </a>

              <br />

              <button
                onClick={() => saveMovie(movie)}
                style={{
                  marginTop: "10px",
                  padding: "8px 12px",
                  backgroundColor: "#e50914",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                ❤️ Save
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
