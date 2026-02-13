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

  const deleteHistory = async (id) => {
    await axios.delete(`${API}/history/${id}`);
    fetchHistory();
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div style={{ padding: 30, background:"#141414", color:"white", minHeight:"100vh" }}>
      <Link to="/" style={{ color:"red" }}>⬅ Back</Link>

      <h2>🧠 Search History</h2>

      {history.map((h) => (
        <div key={h.id} style={{ marginBottom:10 }}>
          <span>{h.mood}</span>
          <button
            onClick={() => deleteHistory(h.id)}
            style={{ marginLeft:10 }}
          >
            ❌ Remove
          </button>
        </div>
      ))}
    </div>
  );
}

export default History;
