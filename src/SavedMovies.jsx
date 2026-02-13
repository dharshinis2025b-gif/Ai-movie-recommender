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
    <div style={{ padding: "30px", color: "white", background: "#141414", minHeight: "100vh" }}>
      <Link to="/" style={{ color: "red" }}>⬅ Back</Link>

      <h2>❤️ Saved Movies</h2>

      {movies.length === 0 && <p>No saved movies yet.</p>}

      {movies.map((movie) => (
        <div key={movie.id} style={{ marginBottom: "15px" }}>
          <p>{movie.title}</p>
          <button onClick={() => removeMovie(movie.id)}>❌ Remove</button>
        </div>
      ))}
    </div>
  );
}

export default SavedMovies;
