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

/* ===============================
   TABLES
=================================*/

// favourites
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

// searches
db.run(`
CREATE TABLE IF NOT EXISTS searches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mood TEXT,
  industry TEXT
)
`);

/* ✅ Fix old Render database */
db.run(`ALTER TABLE searches ADD COLUMN industry TEXT`, () => {});
db.run(`ALTER TABLE favourites ADD COLUMN industry TEXT`, () => {});

/* ===============================
   TEST ROUTE
=================================*/
app.get("/", (req, res) => {
  res.json({ message: "Backend running ✅" });
});

/* ===============================
   RECOMMEND MOVIES
=================================*/
app.post("/recommend", async (req, res) => {
  try {
    const { mood } = req.body;

    if (!mood) {
      return res
        .status(400)
        .json({ error: "Use moods like happy, sad, fun..." });
    }

    const text = mood.toLowerCase();

    /* ========= MOOD → GENRE ========= */
    let genre = null;

    if (text.includes("happy") || text.includes("fun"))
      genre = "Comedy";

    else if (text.includes("sad") || text.includes("emotional"))
      genre = "Drama";

    else if (text.includes("love") || text.includes("romantic"))
      genre = "Romance";

    else if (text.includes("scared") || text.includes("fear"))
      genre = "Horror";

    else if (text.includes("excited") || text.includes("adventure"))
      genre = "Action";

    else if (text.includes("thrill"))
      genre = "Thriller";

    else if (text.includes("space") || text.includes("future"))
      genre = "Science Fiction";

    if (!genre) {
      return res.status(400).json({
        error:
          "Use moods like happy, sad, romantic, fun, scared, adventurous",
      });
    }

    /* ========= INDUSTRY ========= */
    let language = "hi";
    let industry = "Bollywood";

    if (text.includes("kollywood")) {
      language = "ta";
      industry = "Kollywood";
    } 
    else if (text.includes("tollywood")) {
      language = "te";
      industry = "Tollywood";
    } 
    else if (text.includes("mollywood")) {
      language = "ml";
      industry = "Mollywood";
    }

    console.log("Genre:", genre);
    console.log("Industry:", industry);

    /* SAVE SEARCH HISTORY */
    db.run(
      "INSERT INTO searches(mood,industry) VALUES(?,?)",
      [mood, industry]
    );

    /* ========= TMDB API ========= */
    const response = await axios.get(
      "https://api.themoviedb.org/3/discover/movie",
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          with_original_language: language,
          region: "IN",
          sort_by: "popularity.desc",
          include_adult: false,
          vote_count_gte: 100,
        },
      }
    );

    res.json({
      genre,
      industry,
      movies: response.data.results.slice(0, 30),
    });

  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Server error" });
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