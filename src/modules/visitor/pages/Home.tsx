import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";
import { getFullUrl } from "../../../utils/url";

interface FeaturedWork {
  id: string;
  title: string;
  artist?: string;
  year?: string;
  imageUrl?: string;
  category?: { name: string } | string;
}

interface FeaturedTrail {
  id: string;
  title: string;
  description?: string;
}

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const { name, tenantId, role } = useAuth();
  const navigate = useNavigate();
  const [featuredWorks, setFeaturedWorks] = useState<FeaturedWork[]>([]);
  const [featuredTrails, setFeaturedTrails] = useState<FeaturedTrail[]>([]);
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
        const [worksRes, trailsRes] = await Promise.all([
          api.get(`/works?tenantId=${tenantId}&limit=3`),
          api.get(`/trails?tenantId=${tenantId}&limit=2`)
        ]);
        // API returns { data: works[], pagination: {} }
        setFeaturedWorks(Array.isArray(worksRes.data) ? worksRes.data : (worksRes.data.data || []));
        setFeaturedTrails(Array.isArray(trailsRes.data) ? trailsRes.data : (trailsRes.data.data || trailsRes.data || []));
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
    <div style={{ maxWidth: '1200px' }}> {/* Limit width for readability but align left via layout */}

      {/* HERO SECTION - Premium Gold */}
      <section style={{
        marginBottom: "3rem",
        paddingBottom: "2rem",
        borderBottom: "1px solid var(--border-color)"
      }}>
        <div style={{
          display: "inline-block",
          padding: "0.25rem 0.75rem",
          borderRadius: "99px",
          background: "rgba(212, 175, 55, 0.1)",
          color: "var(--primary-color)",
          fontSize: "0.85rem",
          fontWeight: "bold",
          marginBottom: "1rem",
          border: "1px solid var(--primary-color)"
        }}>
          {t("visitor.home.badge", "Modo Visitante")}
        </div>

        <h1 className="section-title" style={{
          fontSize: "2.5rem",
          color: "var(--primary-color)",
          marginBottom: "0.5rem",
          fontFamily: "'Georgia', serif"
        }}>
          {t("visitor.home.title", { name: name || t("common.visitor", "Visitante") })}
        </h1>

        <p className="section-subtitle" style={{
          maxWidth: "800px",
          fontSize: "1.1rem",
          lineHeight: "1.6",
          color: "#B0A090",
          fontStyle: "italic"
        }}>
          {t("visitor.home.subtitle", "Explore a história e a cultura dos nossos museus com suporte a acessibilidade e guias inteligentes.")}
        </p>

        <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
          <Link to="/trilhas" className="btn btn-primary" style={{ padding: "0.8rem 2rem", fontSize: "1rem" }}>
            {t("visitor.home.startTrail")}
          </Link>
          <Link to="/mapa" className="btn btn-secondary" style={{ padding: "0.8rem 2rem", fontSize: "1rem" }}>
            {t("visitor.home.viewMap")}
          </Link>
        </div>
      </section>

      {/* FEATURED ARTWORKS */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 className="section-title" style={{
          fontSize: "2rem",
          color: "var(--primary-color)",
          fontFamily: "'Georgia', serif",
          marginBottom: "0.5rem"
        }}>
          {t("visitor.home.featuredArtworks")}
        </h2>
        <p className="section-subtitle" style={{ color: "#888", marginBottom: "1.5rem" }}>
          {t("visitor.home.featuredSubtitle")}
        </p>

        {loading ? (
          <div className="card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="card" style={{ height: "250px", animation: "pulse 1.5s infinite", background: "rgba(255,255,255,0.05)" }}></div>
            ))}
          </div>
        ) : featuredWorks.length > 0 ? (
          <div className="card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {featuredWorks.map(work => (
              <article key={work.id} className="card" style={{ display: "flex", flexDirection: "column" }}>
                {work.imageUrl && (
                  <div style={{
                    height: "180px",
                    width: "100%",
                    marginBottom: "1rem",
                    borderRadius: "4px",
                    background: `url(${getFullUrl(work.imageUrl)}) center/cover no-repeat`,
                    backgroundColor: "#000"
                  }} />
                )}
                <h3 className="card-title" style={{ fontSize: "1.4rem", marginBottom: "0.5rem" }}>{work.title}</h3>
                <p className="card-subtitle" style={{ fontSize: "0.9rem", color: "#ccc", fontStyle: "italic", marginBottom: "1rem" }}>
                  {work.artist} {work.year ? `• ${work.year}` : ''}
                </p>
                <div className="card-meta" style={{ display: "flex", gap: "0.5rem", marginBottom: "auto" }}>
                  {work.category && (
                    <span className="chip" style={{
                      fontSize: "0.75rem",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)"
                    }}>
                      {typeof work.category === 'string' ? work.category : work.category?.name}
                    </span>
                  )}
                  <span className="chip" style={{
                    fontSize: "0.75rem",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)"
                  }}>
                    Acessível
                  </span>
                </div>
                <Link to={`/obras/${work.id}`} className="btn btn-secondary" style={{ marginTop: "1rem", width: "100%", textAlign: "center" }}>
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

      {/* RECOMMENDED TRAILS */}
      <section>
        <h2 className="section-title" style={{
          fontSize: "2rem",
          color: "var(--primary-color)",
          fontFamily: "'Georgia', serif",
          marginBottom: "0.5rem"
        }}>
          {t("visitor.home.recommendedTrails")}
        </h2>

        {loading ? (
          <div style={{ height: "100px" }}>Loading...</div>
        ) : featuredTrails.length > 0 ? (
          <div className="card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem", marginTop: "1rem" }}>
            {featuredTrails.map(trail => (
              <article key={trail.id} className="card">
                <h3 className="card-title" style={{ fontSize: "1.3rem" }}>{trail.title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: "0.5rem 0" }}>{trail.description}</p>
                <Link to={`/trilhas/${trail.id}`} className="btn btn-secondary" style={{ marginTop: "1rem" }}>
                  {t("visitor.home.viewTrails")}
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p style={{ color: "#666" }}>{t("common.noResults", "Nenhuma trilha encontrada.")}</p>
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
