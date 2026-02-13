import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API = "https://ai-movie-recommender-2-nb3t.onrender.com";

function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios.get(`${API}/history`).then((res) => {
      setHistory(res.data);
    });
  }, []);

  return (
    <div style={{ padding: "30px", color: "white", background: "#141414", minHeight: "100vh" }}>
      <Link to="/" style={{ color: "red" }}>⬅ Back</Link>

      <h2>🧠 Search History</h2>

      {history.length === 0 && <p>No searches yet.</p>}

      {history.map((h) => (
        <p key={h.id}>{h.mood}</p>
      ))}
    </div>
  );
}

export default History;
