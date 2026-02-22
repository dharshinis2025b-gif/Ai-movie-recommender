require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const sqlite3 = require("sqlite3").verbose();

const app = express();

app.use(cors());
app.use(express.json());

/* ===============================
   SQLITE DATABASE
=================================*/
const db = new sqlite3.Database("./movies.db", (err) => {
  if (err) console.log(err);
  else console.log("SQLite connected ✅");
});

/* ---------- FAVOURITES TABLE ---------- */
db.run(`
CREATE TABLE IF NOT EXISTS favourites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  poster TEXT,
  genre TEXT,
  mood TEXT,
  industry TEXT
)
`);

/* ---------- SEARCH HISTORY TABLE ---------- */
db.run(`
CREATE TABLE IF NOT EXISTS searches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mood TEXT,
  industry TEXT
)
`);

/* ✅ FIX OLD DATABASE (Render issue) */
db.run(`ALTER TABLE searches ADD COLUMN industry TEXT`, () => {});
db.run(`ALTER TABLE favourites ADD COLUMN industry TEXT`, () => {});

/* ===============================
   TEST ROUTE
=================================*/
app.get("/", (req, res) => {
  res.json({ message: "Backend running ✅" });
});

/* ===============================
   MOOD → GENRE + INDUSTRY
=================================*/
function detectMood(mood) {
  const text = mood.toLowerCase();

  if (text.includes("happy") || text.includes("fun"))
    return { genre: "Comedy" };

  if (text.includes("sad") || text.includes("emotional"))
    return { genre: "Drama" };

  if (text.includes("love") || text.includes("romantic"))
    return { genre: "Romance" };

  if (text.includes("scared") || text.includes("fear"))
    return { genre: "Horror" };

  if (text.includes("excited") || text.includes("adventure"))
    return { genre: "Action" };

  if (text.includes("space") || text.includes("future"))
    return { genre: "Science Fiction" };

  return null;
}

function detectIndustry(mood) {
  const text = mood.toLowerCase();

  if (text.includes("kollywood")) return "ta";
  if (text.includes("bollywood")) return "hi";
  if (text.includes("tollywood")) return "te";
  if (text.includes("mollywood")) return "ml";

  return "hi"; // default Indian movies
}

/* ===============================
   RECOMMEND MOVIES
=================================*/
app.post("/recommend", async (req, res) => {
  try {
    const { mood } = req.body;

    if (!mood)
      return res
        .status(400)
        .json({ error: "Enter mood like happy, sad, fun..." });

    const moodResult = detectMood(mood);

    if (!moodResult)
      return res.status(400).json({
        error:
          "Use moods like happy, sad, romantic, fun, scared, adventurous",
      });

    const genre = moodResult.genre;
    const language = detectIndustry(mood);

    console.log("Genre:", genre);
    console.log("Language:", language);

    /* Save history */
    db.run(
      "INSERT INTO searches(mood,industry) VALUES(?,?)",
      [mood, language]
    );

    /* TMDB CALL */
    const response = await axios.get(
      "https://api.themoviedb.org/3/discover/movie",
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          with_original_language: language,
          sort_by: "popularity.desc",
        },
      }
    );

    res.json({
      genre,
      movies: response.data.results.slice(0, 30),
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* ===============================
   SAVE MOVIE
=================================*/
app.post("/save", (req, res) => {
  const { title, poster, genre, mood, industry } = req.body;

  db.run(
    `INSERT INTO favourites(title,poster,genre,mood,industry)
     VALUES(?,?,?,?,?)`,
    [title, poster, genre, mood, industry],
    (err) => {
      if (err)
        return res.status(500).json({ error: err.message });

      res.json({ message: "Movie saved ❤️" });
    }
  );
});

/* ===============================
   GET SAVED MOVIES
=================================*/
app.get("/favourites", (req, res) => {
  db.all("SELECT * FROM favourites", [], (err, rows) => {
    if (err)
      return res.status(500).json({ error: err.message });

    res.json(rows);
  });
});

/* ===============================
   DELETE SAVED MOVIE
=================================*/
app.delete("/favourites/:id", (req, res) => {
  db.run(
    "DELETE FROM favourites WHERE id=?",
    [req.params.id],
    function (err) {
      if (err)
        return res.status(500).json({ error: err.message });

      res.json({ message: "Removed ✅" });
    }
  );
});

/* ===============================
   GET HISTORY
=================================*/
app.get("/history", (req, res) => {
  db.all(
    "SELECT * FROM searches ORDER BY id DESC",
    [],
    (err, rows) => {
      if (err)
        return res.status(500).json({ error: err.message });

      res.json(rows);
    }
  );
});

/* ===============================
   DELETE HISTORY
=================================*/
app.delete("/history/:id", (req, res) => {
  db.run(
    "DELETE FROM searches WHERE id=?",
    [req.params.id],
    function (err) {
      if (err)
        return res.status(500).json({ error: err.message });

      res.json({ message: "History removed ✅" });
    }
  );
});

/* ===============================
   START SERVER
=================================*/
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT} 🚀`);
});