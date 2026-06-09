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

// O PWA Vite lida automaticamente com atualização de service workers via autoUpdate.
// Não é necessário (nem recomendado) expurgar o cache manualmente aqui, pois isso quebra a capacidade offline real.
