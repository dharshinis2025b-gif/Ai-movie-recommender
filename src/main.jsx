import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App";
import SavedMovies from "./SavedMovies";
import History from "./History";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/saved" element={<SavedMovies />} />
      <Route path="/history" element={<History />} />
    </Routes>
  </BrowserRouter>
);
