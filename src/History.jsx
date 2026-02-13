import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API = "https://ai-movie-recommender-2-nb3t.onrender.com";

function History() {
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    const res = await axios.get(`${API}/history`);
    setHistory(res.data);
  };

  const removeHistory = async (id) => {
    await axios.delete(`${API}/history/${id}`);
    fetchHistory(); // refresh list
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#141414",
        color: "white",
        padding: "30px",
      }}
    >
      <Link to="/" style={{ color: "#e50914" }}>
        ⬅ Back
      </Link>

      <h2>🧠 Search History</h2>

      {history.length === 0 && <p>No history yet.</p>}

      {history.map((item) => (
        <div
          key={item.id}
          style={{
            background: "#222",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        >
          <span>{item.mood}</span>

          <button
            onClick={() => removeHistory(item.id)}
            style={{
              marginLeft: "15px",
              background: "#e50914",
              color: "white",
              border: "none",
              padding: "5px 10px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            ❌ Remove
          </button>
        </div>
      ))}
    </div>
  );
}

export default History;
