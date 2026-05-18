import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { AppSettingsProvider } from "./contexts/AppSettingsContext";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppSettingsProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </AppSettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
