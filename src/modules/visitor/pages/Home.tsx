import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext";

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const { name } = useAuth();

  return (
    <div>
      <section style={{ marginBottom: "2rem" }}>
        <div className="badge">{t("visitor.home.badge")}</div>
        <h1 className="section-title">{t("visitor.home.title", { name: name || "Visitante" })}</h1>
        <p className="section-subtitle">
          {t("visitor.home.subtitle")}
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link to="/trilhas" className="btn">
            {t("visitor.home.startTrail")}
          </Link>
          <Link to="/mapa" className="btn btn-secondary">
            {t("visitor.home.viewMap")}
          </Link>
        </div>
      </section>

      <section style={{ marginBottom: "1.75rem" }}>
        <h2 className="section-title">{t("visitor.home.featuredArtworks")}</h2>
        <p className="section-subtitle">
          {t("visitor.home.featuredSubtitle")}
        </p>
        <div className="card-grid">
          {[1, 2, 3].map(i => (
            <article key={i} className="card">
              <h3 className="card-title">{t("visitor.home.exampleArtwork")} {i}</h3>
              <p className="card-subtitle">{t("visitor.home.guestArtist")} • 192{i}</p>
              <div className="card-meta">
                <span className="chip">{t("visitor.home.painting")}</span>
                <span className="chip">{t("visitor.home.accessible")}</span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#e5e7eb" }}>
                {t("visitor.home.exampleDisclaimer")}
              </p>
              <Link to="/obras" className="btn btn-secondary" style={{ marginTop: "0.75rem" }}>
                {t("visitor.home.viewDetails")}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">{t("visitor.home.recommendedTrails")}</h2>
        <p className="section-subtitle">
          {t("visitor.home.trailsSubtitle")}
        </p>
        <div className="card-grid">
          <article className="card">
            <h3 className="card-title">{t("visitor.home.quickTrail")}</h3>
            <p className="card-subtitle">{t("visitor.home.quickTrailDesc")}</p>
            <div className="card-meta">
              <span className="chip">8 {t("visitor.sidebar.artworks")}</span>
              <span className="chip">{t("visitor.home.museumSuggestion")}</span>
            </div>
            <Link to="/trilhas" className="btn" style={{ marginTop: "0.75rem" }}>
              {t("visitor.home.viewTrails")}
            </Link>
          </article>
          <article className="card">
            <h3 className="card-title">{t("visitor.home.completeTrail")}</h3>
            <p className="card-subtitle">{t("visitor.home.completeTrailDesc")}</p>
            <div className="card-meta">
              <span className="chip">25+ {t("visitor.sidebar.artworks")}</span>
              <span className="chip">{t("visitor.artwork.audioDescription")}</span>
            </div>
            <Link to="/trilhas" className="btn btn-secondary" style={{ marginTop: "0.75rem" }}>
              {t("visitor.home.chooseTrail")}
            </Link>
          </article>
        </div>
      </section>
    </div>
  );
};
