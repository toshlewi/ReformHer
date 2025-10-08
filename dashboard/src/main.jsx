// dashboard/src/main.jsx (or index.jsx depending on your setup)
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";

// Vite exposes BASE_URL for proper routing when app is served under a subpath.
// Fallback to "/" for local dev.
const basename = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "") || "/";

const el = document.getElementById("root");
if (!el) {
  throw new Error('Root element with id="root" not found');
}

createRoot(el).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
