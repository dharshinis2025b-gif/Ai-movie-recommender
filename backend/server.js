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
================================ */
const db = new sqlite3.Database("./movies.db", (err) => {
  if (err) console.log(err);
  else console.log("SQLite connected ✅");
});

db.run(`
CREATE TABLE IF NOT EXISTS favourites(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 title TEXT,
 poster TEXT,
 genre TEXT,
 mood TEXT
)
`);

db.run(`
CREATE TABLE IF NOT EXISTS searches(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 mood TEXT,
 industry TEXT
)
`);

/* ===============================
   LANGUAGE MAP (INDUSTRIES)
================================ */
const languageMap = {
  kollywood: "ta",
  bollywood: "hi",
  tollywood: "te",
  mollywood: "ml",
};

/* ===============================
   GENRE MAP
================================ */
const genreMap = {
  Action: 28,
  Comedy: 35,
  Drama: 18,
  Horror: 27,
  Romance: 10749,
  Thriller: 53,
  Adventure: 12,
  "Sci-Fi": 878,
};

/* ===============================
   MOOD → GENRE
================================ */
function getGenreFromMood(mood) {
  const text = mood.toLowerCase();

  if (text.includes("happy") || text.includes("fun"))
    return "Comedy";

  if (text.includes("sad") || text.includes("emotional"))
    return "Drama";

  if (text.includes("love") || text.includes("romantic"))
    return "Romance";

  if (text.includes("fear") || text.includes("scared"))
    return "Horror";

  if (text.includes("excited") || text.includes("adventure"))
    return "Action";

  if (text.includes("thrill"))
    return "Thriller";

  if (text.includes("future") || text.includes("space"))
    return "Sci-Fi";

  return null;
}

/* ===============================
   TEST ROUTE
================================ */
app.get("/", (req, res) => {
  res.json({ message: "Backend running ✅" });
});

/* ===============================
   RECOMMEND MOVIES
================================ */
app.post("/recommend", async (req, res) => {
  try {
    const { mood, industry } = req.body;

    if (!mood || !industry)
      return res.status(400).json({
        error:
          "Provide mood and industry (kollywood/bollywood/tollywood/mollywood)",
      });

    const genre = getGenreFromMood(mood);

    if (!genre)
      return res.status(400).json({
        error:
          "Use moods like happy, sad, love, excited, scared...",
      });

    const genreId = genreMap[genre];
    const language = languageMap[industry.toLowerCase()];

    if (!language)
      return res.status(400).json({
        error:
          "Industry must be kollywood, bollywood, tollywood or mollywood",
      });

    console.log("Genre:", genre);
    console.log("Language:", language);

    // save search
    db.run(
      "INSERT INTO searches(mood,industry) VALUES(?,?)",
      [mood, industry]
    );

    const tmdbRes = await axios.get(
      "https://api.themoviedb.org/3/discover/movie",
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          with_original_language: language,
          with_genres: genreId,
          sort_by: "popularity.desc",
          page: 1,
        },
      }
    );

    res.json({
      mood,
      genre,
      industry,
      movies: tmdbRes.data.results.slice(0, 20),
    });

  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* ===============================
   SAVE MOVIE
================================ */
app.post("/save", (req, res) => {
  const { title, poster, genre, mood } = req.body;

  db.run(
    "INSERT INTO favourites(title,poster,genre,mood) VALUES(?,?,?,?)",
    [title, poster, genre, mood],
    function (err) {
      if (err)
        return res.status(500).json({ error: err.message });

      res.json({ message: "Saved ❤️" });
    }
  );
});

/* ===============================
   GET SAVED
================================ */
app.get("/favourites", (req, res) => {
  db.all("SELECT * FROM favourites", [], (err, rows) => {
    if (err)
      return res.status(500).json({ error: err.message });

    res.json(rows);
  });
});

/* ===============================
   DELETE SAVED
================================ */
app.delete("/favourites/:id", (req, res) => {
  db.run(
    "DELETE FROM favourites WHERE id=?",
    [req.params.id],
    function (err) {
      if (err)
        return res.status(500).json({ error: err.message });

      res.json({ message: "Removed ❌" });
    }
  );
});

/* ===============================
   HISTORY
================================ */
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
   START SERVER
================================ */
app.listen(5000, () => {
  console.log("Backend running on port 5000 🚀");
});