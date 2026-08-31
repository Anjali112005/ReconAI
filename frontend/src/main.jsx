import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";

import { ReconProvider } from "./context/ReconContext";
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>

    <AuthProvider>

      <ReconProvider>

        <App />

      </ReconProvider>

    </AuthProvider>

  </React.StrictMode>
);