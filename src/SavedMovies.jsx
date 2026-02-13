import { useEffect, useState } from "react";
import axios from "axios";

function SavedMovies() {
  const [movies, setMovies] = useState([]);

  const fetchMovies = () => {
    axios
      .get("http://localhost:5000/favourites")
      .then((res) => setMovies(res.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const deleteMovie = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/favourites/${id}`);
      fetchMovies(); // refresh list
    } catch (err) {
      alert("Failed to remove movie");
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
      {/* Back Button */}
      <a
        href="/"
        style={{
          color: "white",
          textDecoration: "none",
          backgroundColor: "#333",
          padding: "8px 12px",
          borderRadius: "6px",
          display: "inline-block",
          marginBottom: "20px",
        }}
      >
        ⬅ Back to Home
      </a>

      <h1 style={{ color: "#e50914" }}>❤️ Saved Movies</h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {movies.map((movie) => (
          <div
            key={movie.id}
            style={{
              width: "200px",
              backgroundColor: "#222",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            {movie.poster && (
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster}`}
                alt={movie.title}
                style={{ width: "100%" }}
              />
            )}

            <div style={{ padding: "10px" }}>
              <h4>{movie.title}</h4>
              <p>{movie.genre}</p>

              <button
                onClick={() => deleteMovie(movie.id)}
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
                🗑 Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SavedMovies;
