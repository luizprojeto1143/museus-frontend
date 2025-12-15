import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const { name, tenantId, role } = useAuth();
  const navigate = useNavigate();
  const [featuredWorks, setFeaturedWorks] = useState<any[]>([]);
  const [featuredTrails, setFeaturedTrails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role === "master") {
      navigate("/master", { replace: true });
      return;
    }
    if (role === "admin") {
      navigate("/admin", { replace: true });
      return;
    }
  }, [role, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch works and trails (using public endpoints if available, or just list)
        // Since we don't have a specific "featured" endpoint, we'll fetch list and slice
        const [worksRes, trailsRes] = await Promise.all([
          api.get(`/works?tenantId=${tenantId}&limit=3`),
          api.get(`/trails?tenantId=${tenantId}&limit=2`)
        ]);
        setFeaturedWorks(worksRes.data);
        setFeaturedTrails(trailsRes.data);
      } catch (err) {
        console.error("Error fetching home data", err);
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) {
      fetchData();
    }
  }, [tenantId]);

  return (
    <div>
      <section style={{ marginBottom: "2rem" }}>
        <div className="badge">{t("visitor.home.badge")}</div>
        <h1 className="section-title">{t("visitor.home.title", { name: name || t("common.visitor", "Visitante") })}</h1>
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

        {loading ? (
          <div className="card-grid">
            {[1, 2, 3].map(i => (
              <div key={i} className="card" style={{ height: "200px", animation: "pulse 1.5s infinite", background: "rgba(255,255,255,0.05)" }}></div>
            ))}
          </div>
        ) : featuredWorks.length > 0 ? (
          <div className="card-grid">
            {featuredWorks.map(work => (
              <article key={work.id} className="card">
                {work.imageUrl && (
                  <div style={{
                    height: "150px",
                    marginBottom: "1rem",
                    borderRadius: "0.5rem",
                    background: `url(${work.imageUrl}) center/cover`,
                    backgroundColor: "rgba(0,0,0,0.2)"
                  }} />
                )}
                <h3 className="card-title">{work.title}</h3>
                <p className="card-subtitle">{work.artist} • {work.year}</p>
                <div className="card-meta">
                  <span className="chip">{work.category?.name || work.category || "Geral"}</span>
                </div>
                <Link to={`/obras/${work.id}`} className="btn btn-secondary" style={{ marginTop: "0.75rem" }}>
                  {t("visitor.home.viewDetails")}
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: "center", padding: "3rem", background: "rgba(0,0,0,0.2)", border: "1px dashed rgba(255,255,255,0.1)" }}>
            <span style={{ fontSize: "2rem", display: "block", marginBottom: "1rem", opacity: 0.5 }}>🎨</span>
            <p style={{ color: "#aaa" }}>{t("common.noResults", "Nenhuma obra em destaque no momento.")}</p>
          </div>
        )}
      </section>

      <section>
        <h2 className="section-title">{t("visitor.home.recommendedTrails")}</h2>
        <p className="section-subtitle">
          {t("visitor.home.trailsSubtitle")}
        </p>

        {loading ? (
          <div className="card-grid">
            {[1, 2].map(i => (
              <div key={i} className="card" style={{ height: "150px", animation: "pulse 1.5s infinite", background: "rgba(255,255,255,0.05)" }}></div>
            ))}
          </div>
        ) : featuredTrails.length > 0 ? (
          <div className="card-grid">
            {featuredTrails.map(trail => (
              <article key={trail.id} className="card">
                <h3 className="card-title">{trail.title}</h3>
                <p className="card-subtitle">{trail.description}</p>
                <div className="card-meta">
                  <span className="chip">{trail.workIds?.length || 0} {t("visitor.sidebar.artworks")}</span>
                  <span className="chip">{trail.duration ? `${trail.duration} min` : "Livre"}</span>
                </div>
                <Link to={`/trilhas/${trail.id}`} className="btn btn-secondary" style={{ marginTop: "0.75rem" }}>
                  {t("visitor.home.viewTrails")}
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: "center", padding: "3rem", background: "rgba(0,0,0,0.2)", border: "1px dashed rgba(255,255,255,0.1)" }}>
            <span style={{ fontSize: "2rem", display: "block", marginBottom: "1rem", opacity: 0.5 }}>🗺️</span>
            <p style={{ color: "#aaa" }}>{t("common.noResults", "Nenhuma trilha disponível.")}</p>
          </div>
        )}
      </section>
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};
