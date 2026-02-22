app.post("/recommend", async (req, res) => {
  try {
    const { mood } = req.body;

    if (!mood) {
      return res
        .status(400)
        .json({ error: "Enter mood like happy, sad, fun..." });
    }

    const text = mood.toLowerCase();

    /* =====================
       MOOD → GENRE
    ====================== */
    let genre = null;

    if (text.includes("happy") || text.includes("fun"))
      genre = "Comedy";

    else if (text.includes("sad") || text.includes("emotional"))
      genre = "Drama";

    else if (text.includes("love") || text.includes("romantic"))
      genre = "Romance";

    else if (text.includes("scared") || text.includes("horror"))
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
          "Use moods like happy, sad, fun, romantic, scared, adventurous",
      });
    }

    /* =====================
       INDUSTRY DETECTION
    ====================== */

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

    /* SAVE HISTORY */
    db.run(
      "INSERT INTO searches(mood,industry) VALUES(?,?)",
      [mood, industry]
    );

    /* =====================
       TMDB CALL
    ====================== */

    const response = await axios.get(
      "https://api.themoviedb.org/3/discover/movie",
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          with_original_language: language,
          region: "IN",
          sort_by: "popularity.desc",
          include_adult: false,
          vote_count_gte: 50,
        },
      }
    );

    res.json({
      genre,
      industry,
      movies: response.data.results.slice(0, 30),
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});