import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API = "https://ai-movie-recommender-2-nb3t.onrender.com";

function SavedMovies() {
  const [movies, setMovies] = useState([]);

  const fetchMovies = async () => {
    const res = await axios.get(`${API}/favourites`);
    setMovies(res.data);
  };

  const removeMovie = async (id) => {
    await axios.delete(`${API}/favourites/${id}`);
    fetchMovies();
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#141414",
        color: "white",
        padding: "30px",
      }}
    >
      <Link to="/" style={{ color: "#e50914" }}>
        ⬅ Back
      </Link>

      <h2>❤️ Saved Movies</h2>

      {movies.length === 0 && <p>No saved movies yet.</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {movies.map((movie) => (
          <div
            key={movie.id}
            style={{
              width: "200px",
              backgroundColor: "#222",
              borderRadius: "10px",
              overflow: "hidden",
              paddingBottom: "10px",
            }}
          >
            {/* POSTER */}
            {movie.poster && (
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster}`}
                alt={movie.title}
                style={{ width: "100%" }}
              />
            )}

            <div style={{ padding: "10px" }}>
              <h4>{movie.title}</h4>

              <button
                onClick={() => removeMovie(movie.id)}
                style={{
                  padding: "6px 10px",
                  backgroundColor: "#e50914",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                ❌ Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SavedMovies;
