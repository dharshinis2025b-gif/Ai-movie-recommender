require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const sqlite3 = require("sqlite3").verbose();

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE"],
  })
);

app.use(express.json());

// ---------------------
// SQLITE DATABASE
// ---------------------
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

// ---------------------
// TEST ROUTE
// ---------------------
app.get("/", (req, res) => {
  res.json({ message: "Backend running ✅" });
});

// ---------------------
// RECOMMEND ROUTE
// ---------------------
app.post("/recommend", async (req, res) => {
  try {
    const { mood } = req.body;

    if (!mood) {
      return res
        .status(400)
        .json({ error: "Use moods like sad, fun, love, happy..." });
    }

    // Save search history
    db.run("INSERT INTO searches(mood) VALUES(?)", [mood]);

    const text = mood.toLowerCase();
    let genre = null;

    // Mood → Genre mapping
    if (text.includes("happy") || text.includes("fun") || text.includes("joy"))
      genre = "Comedy";
    else if (
      text.includes("sad") ||
      text.includes("emotional") ||
      text.includes("cry")
    )
      genre = "Drama";
    else if (
      text.includes("scared") ||
      text.includes("dark") ||
      text.includes("fear")
    )
      genre = "Horror";
    else if (
      text.includes("love") ||
      text.includes("romantic") ||
      text.includes("crush")
    )
      genre = "Romance";
    else if (
      text.includes("adventurous") ||
      text.includes("excited") ||
      text.includes("thrill")
    )
      genre = "Action";
    else if (
      text.includes("space") ||
      text.includes("future") ||
      text.includes("sci")
    )
      genre = "Sci-Fi";
    else if (
      text.includes("relaxed") ||
      text.includes("calm") ||
      text.includes("peace")
    )
      genre = "Animation";
    else if (text.includes("mystery") || text.includes("detective"))
      genre = "Thriller";

    if (!genre) {
      return res.status(400).json({
        error:
          "Use moods like sad, fun, love, happy, adventurous, scared...",
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

    // Add mood match percentage
    const movies = tmdbRes.data.results.slice(0, 30).map((movie) => {
      return {
        ...movie,
        moodMatch: Math.min(
          100,
          Math.floor(
            movie.vote_average * 10 * 0.7 +
              Math.min(movie.popularity, 100) * 0.3
          )
        ),
      };
    });

    res.json({
      mood,
      genre,
      movies,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ---------------------
// SAVE FAVOURITE
// ---------------------
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

// ---------------------
// GET FAVOURITES
// ---------------------
app.get("/favourites", (req, res) => {
  db.all("SELECT * FROM favourites", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ---------------------
// DELETE FAVOURITE
// ---------------------
app.delete("/favourites/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM favourites WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: "Movie removed ❌" });
  });
});

// ---------------------
// GET HISTORY
// ---------------------
app.get("/history", (req, res) => {
  db.all("SELECT * FROM searches ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json(rows);
  });
});

// ---------------------
// DELETE HISTORY
// ---------------------
app.delete("/history/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM searches WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: "History removed ❌" });
  });
});

// ---------------------
// START SERVER
// ---------------------
app.listen(5000, () => {
  console.log("Backend running on port 5000");
});
