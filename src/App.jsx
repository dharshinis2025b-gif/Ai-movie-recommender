import { useState } from "react";
import axios from "axios";

function App() {

  const [mood, setMood] = useState("");
  const [industry, setIndustry] = useState("kollywood");
  const [movies, setMovies] = useState([]);
  const [genre, setGenre] = useState("");
  const [loading, setLoading] = useState(false);

  const API =
    "https://ai-movie-recommender-2-nb3t.onrender.com"; // your backend

  /* =========================
     GET RECOMMENDATIONS
  ========================= */
  const getRecommendations = async () => {

    if (!mood) {
      alert("Enter mood first");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API}/recommend`, {
        mood,
        industry,
      });

      setGenre(res.data.genre);
      setMovies(res.data.movies);

    } catch (error) {
      if (error.response?.data?.error)
        alert(error.response.data.error);
      else
        alert("Server error");
    }

    setLoading(false);
  };

  /* =========================
     SAVE MOVIE
  ========================= */
  const saveMovie = async (movie) => {
    try {
      await axios.post(`${API}/save`, {
        title: movie.title,
        poster: movie.poster_path,
        genre,
        mood,
      });

      alert("Movie Saved ❤️");

    } catch {
      alert("Save failed");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#141414",
        color: "white",
        padding: "30px",
        fontFamily: "Arial",
      }}
    >

      {/* TITLE */}
      <h1 style={{ color: "#e50914" }}>
        🎬 AI Indian Movie Recommender
      </h1>

      {/* NAVIGATION */}
      <div style={{ marginBottom: "20px" }}>
        <a href="/saved" style={navBtn}>
          ❤️ Saved Movies
        </a>

        <a href="/history" style={navBtn}>
          🧠 History
        </a>
      </div>

      {/* INPUT AREA */}
      <div style={{ marginBottom: "20px" }}>

        {/* MOOD */}
        <input
          type="text"
          placeholder="Enter your mood..."
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          style={inputStyle}
        />

        {/* INDUSTRY */}
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          style={inputStyle}
        >
          <option value="kollywood">Kollywood 🎬</option>
          <option value="bollywood">Bollywood 🎥</option>
          <option value="tollywood">Tollywood 🍿</option>
          <option value="mollywood">Mollywood 🎞️</option>
        </select>

        <button onClick={getRecommendations} style={btn}>
          Recommend
        </button>

      </div>

      {loading && <h3>Finding movies 🤖...</h3>}

      {genre && (
        <h2>
          Genre: {genre} | Industry: {industry}
        </h2>
      )}

      {/* MOVIES */}
      <div style={movieGrid}>

        {movies.map((movie) => (

          <div key={movie.id} style={card}>

            {movie.poster_path && (
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                style={{ width: "100%" }}
              />
            )}

            <div style={{ padding: "10px" }}>
              <h4>{movie.title}</h4>

              ⭐ Rating: {movie.vote_average}

              <br /><br />

              <a
                href={`https://www.youtube.com/results?search_query=${movie.title} trailer`}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#e50914" }}
              >
                ▶ Watch Trailer
              </a>

              <br />

              <button
                onClick={() => saveMovie(movie)}
                style={saveBtn}
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

/* ================= STYLES ================= */

const navBtn = {
  background: "#333",
  padding: "8px 12px",
  marginRight: "10px",
  textDecoration: "none",
  color: "white",
  borderRadius: "6px",
};

const inputStyle = {
  padding: "10px",
  marginRight: "10px",
  borderRadius: "6px",
  border: "none",
};

const btn = {
  padding: "10px 18px",
  background: "#e50914",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const saveBtn = {
  marginTop: "10px",
  padding: "8px",
  background: "#e50914",
  border: "none",
  color: "white",
  borderRadius: "6px",
  cursor: "pointer",
};

const movieGrid = {
  display: "flex",
  flexWrap: "wrap",
  gap: "20px",
  marginTop: "20px",
};

const card = {
  width: "200px",
  background: "#222",
  borderRadius: "10px",
  overflow: "hidden",
};

export default App;