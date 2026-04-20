import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./modules/auth/AuthContext";
import { TenantProvider } from "./modules/auth/TenantContext";
import i18n from "./i18n/config";
import { I18nextProvider } from "react-i18next";
import "./styles.css";
import "leaflet/dist/leaflet.css";

import { ErrorBoundary } from "./components/ErrorBoundary";
import { HelmetProvider } from "react-helmet-async";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <I18nextProvider i18n={i18n}>
          <BrowserRouter>
            <AuthProvider>
              <TenantProvider>
                <App />
              </TenantProvider>
            </AuthProvider>
          </BrowserRouter>
        </I18nextProvider>
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);

// PWA Cleanup & Cache Busting (Ensuring new design appears)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      console.log('🗑️ Purging legacy Service Worker:', registration.scope);
      registration.unregister();
    }
  });
}

// Clear legacy caches to force fresh branding load
if ('caches' in window) {
  caches.keys().then((names) => {
    for (const name of names) caches.delete(name);
  });
}
