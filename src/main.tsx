import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./modules/auth/AuthContext";
import { TenantProvider } from "./modules/auth/TenantContext";
import "./i18n/config";
import "./styles.css";
import "leaflet/dist/leaflet.css";

import { ErrorBoundary } from "./components/ErrorBoundary";
import { HelmetProvider } from "react-helmet-async";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <TenantProvider>
              <App />
            </TenantProvider>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);

// PWA Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
