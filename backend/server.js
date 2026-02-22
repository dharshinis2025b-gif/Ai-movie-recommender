require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const sqlite3 = require("sqlite3").verbose();

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   SQLITE DATABASE
========================= */
const db = new sqlite3.Database("./movies.db", (err) => {
  if (err) console.log(err);
  else console.log("SQLite connected ✅");
});

// Create tables
db.run(`
CREATE TABLE IF NOT EXISTS favourites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  poster TEXT,
  genre TEXT,
  mood TEXT
)
`);

db.run(`
CREATE TABLE IF NOT EXISTS searches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mood TEXT
)
`);

/* =========================
   TEST ROUTE
========================= */
app.get("/", (req, res) => {
  res.json({ message: "Backend running ✅" });
});

/* =========================
   MOOD → GENRE MAPPING
========================= */
function detectGenre(mood) {
  const text = mood.toLowerCase();

  // HAPPY / FUN
  if (
    text.includes("happy") ||
    text.includes("fun") ||
    text.includes("excited") ||
    text.includes("party") ||
    text.includes("joy") ||
    text.includes("energetic") ||
    text.includes("cheerful")
  ) return "Comedy";

  // SAD / EMOTIONAL
  if (
    text.includes("sad") ||
    text.includes("cry") ||
    text.includes("heartbroken") ||
    text.includes("alone") ||
    text.includes("emotional") ||
    text.includes("depressed") ||
    text.includes("lonely")
  ) return "Drama";

  // LOVE / ROMANCE
  if (
    text.includes("love") ||
    text.includes("romantic") ||
    text.includes("relationship") ||
    text.includes("date") ||
    text.includes("crush")
  ) return "Romance";

  // HORROR / DARK
  if (
    text.includes("scared") ||
    text.includes("horror") ||
    text.includes("dark") ||
    text.includes("ghost") ||
    text.includes("thrill") ||
    text.includes("fear")
  ) return "Horror";

  // ACTION / ADVENTURE
  if (
    text.includes("adventure") ||
    text.includes("adventurous") ||
    text.includes("fight") ||
    text.includes("hero") ||
    text.includes("power") ||
    text.includes("fast") ||
    text.includes("wild")
  ) return "Action";

  // SCI-FI / FUTURE
  if (
    text.includes("space") ||
    text.includes("future") ||
    text.includes("technology") ||
    text.includes("robot") ||
    text.includes("alien") ||
    text.includes("science")
  ) return "Sci-Fi";

  // MYSTERY / THRILLER
  if (
    text.includes("mystery") ||
    text.includes("suspense") ||
    text.includes("detective") ||
    text.includes("crime") ||
    text.includes("investigation")
  ) return "Thriller";

  // ANIME / FANTASY
  if (
    text.includes("fantasy") ||
    text.includes("magic") ||
    text.includes("anime") ||
    text.includes("dream")
  ) return "Fantasy";

  // MOTIVATION / INSPIRING
  if (
    text.includes("motivation") ||
    text.includes("inspire") ||
    text.includes("success") ||
    text.includes("focus")
  ) return "Adventure";

  return null;
}

/* =========================
   RECOMMEND ROUTE
========================= */
app.post("/recommend", async (req, res) => {
  try {
    const { mood } = req.body;

    if (!mood) {
      return res.status(400).json({
        error: "Use moods like happy, sad, fun, love, scared, adventurous..."
      });
    }

    // Save search history
    db.run("INSERT INTO searches(mood) VALUES(?)", [mood]);

    const genre = detectGenre(mood);

    if (!genre) {
      return res.status(400).json({
        error:
          "Use moods like sad, fun, love, happy, adventurous, scared, romantic, emotional..."
      });
    }

    console.log("Selected genre:", genre);

    const tmdbRes = await axios.get(
      "https://api.themoviedb.org/3/search/movie",
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          query: genre,
        },
      }
    );

    res.json({
      mood,
      genre,
      movies: tmdbRes.data.results.slice(0, 10), // 10 movies
    });

  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* =========================
   SAVE MOVIE
========================= */
app.post("/save", (req, res) => {
  const { title, poster, genre, mood } = req.body;

  db.run(
    "INSERT INTO favourites(title, poster, genre, mood) VALUES(?,?,?,?)",
    [title, poster, genre, mood],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ message: "Movie saved ❤️" });
    }
  );
});

/* =========================
   GET FAVOURITES
========================= */
app.get("/favourites", (req, res) => {
  db.all("SELECT * FROM favourites", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

/* =========================
   GET HISTORY
========================= */
app.get("/history", (req, res) => {
  db.all("SELECT * FROM searches ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
// DELETE SINGLE HISTORY ITEM
app.delete("/history/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM searches WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: "History removed ❌" });
  });
});

/* =========================
   DELETE FAVOURITE
========================= */
app.delete("/favourites/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM favourites WHERE id=?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: "Movie removed ❌" });
  });
});

/* =========================
   START SERVER
========================= */
app.listen(5000, () => {
  console.log("Backend running on port 5000");
});
