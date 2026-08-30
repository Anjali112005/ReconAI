import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";

import { ReconProvider } from "./context/ReconContext";


ReactDOM.createRoot(
  document.getElementById("root")
).render(

  <React.StrictMode>

    <ReconProvider>

      <App />

    </ReconProvider>

  </React.StrictMode>

);