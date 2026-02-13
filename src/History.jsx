import { useEffect, useState } from "react";
import axios from "axios";

function History() {
  const [history, setHistory] = useState([]);

  // Fetch search history from backend
  useEffect(() => {
    axios
      .get("http://localhost:5000/history")
      .then((res) => setHistory(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#141414",
        color: "white",
        padding: "30px",
        fontFamily: "Arial",
      }}
    >
      {/* Back Button */}
      <a
        href="/"
        style={{
          color: "white",
          textDecoration: "none",
          backgroundColor: "#333",
          padding: "8px 12px",
          borderRadius: "6px",
          display: "inline-block",
          marginBottom: "20px",
        }}
      >
        ⬅ Back to Home
      </a>

      <h1 style={{ color: "#e50914" }}>🧠 Search History</h1>

      {history.length === 0 ? (
        <p>No searches yet.</p>
      ) : (
        <ul style={{ marginTop: "20px", lineHeight: "2" }}>
          {history.map((item) => (
            <li key={item.id}>Mood: {item.mood}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default History;
