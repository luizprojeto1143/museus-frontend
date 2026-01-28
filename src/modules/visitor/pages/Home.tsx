import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";
import { getFullUrl } from "../../../utils/url";
import { useTerminology } from "../../../hooks/useTerminology";
import { useIsCityMode } from "../../auth/TenantContext";
import { Camera, Map, Compass, ArrowRight } from "lucide-react";
import "./Home.css";

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
  const term = useTerminology();
  const isCityMode = useIsCityMode();
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
    <div className="home-container">

      {/* HERO SECTION */}
      <section className="home-hero">
        <div className="hero-content">
          <span className="hero-badge">
            ✨ {t("visitor.home.badge", "Modo Visitante")}
          </span>

          <h1 className="hero-title">
            {t("visitor.home.title", { name: name || t("common.visitor", "Visitante") })}
          </h1>

          <p className="hero-subtitle">
            {isCityMode
              ? t("visitor.home.subtitleCity", "Explore os pontos turísticos e a história da cidade com guias inteligentes.")
              : t("visitor.home.subtitle", "Explore a história e a cultura dos nossos museus com suporte a acessibilidade e guias inteligentes.")}
          </p>

          <div className="hero-actions">
            <Link to="/scanner" className="hero-btn hero-btn-primary">
              <Camera size={18} />
              Scanner
            </Link>
            {isCityMode ? (
              <Link to="/mapa" className="hero-btn hero-btn-primary">
                <Map size={18} />
                {t("visitor.home.exploreMap", "Explorar Mapa")}
              </Link>
            ) : (
              <Link to="/trilhas" className="hero-btn hero-btn-primary">
                <Compass size={18} />
                {t("visitor.home.startTrail")}
              </Link>
            )}
            <Link to={isCityMode ? "/trilhas" : "/mapa"} className="hero-btn hero-btn-secondary">
              {isCityMode ? term.trails : t("visitor.home.viewMap")}
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED WORKS */}
      <section className="works-section">
        <div className="section-header">
          <h2>{term.featuredWorks}</h2>
          <p>{t("visitor.home.featuredSubtitle")}</p>
        </div>

        {loading ? (
          <div className="skeleton-grid">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton-card"></div>
            ))}
          </div>
        ) : featuredWorks.length > 0 ? (
          <div className="works-grid">
            {featuredWorks.map(work => (
              <article key={work.id} className="work-card">
                {work.imageUrl && (
                  <div
                    className="work-image"
                    style={{ backgroundImage: `url(${getFullUrl(work.imageUrl)})` }}
                  />
                )}
                <div className="work-content">
                  <h3 className="work-title">{work.title}</h3>
                  <p className="work-artist">
                    {work.artist} {work.year ? `• ${work.year}` : ''}
                  </p>
                  <div className="work-chips">
                    {work.category && (
                      <span className="work-chip">
                        {typeof work.category === 'string' ? work.category : work.category?.name}
                      </span>
                    )}
                    <span className="work-chip">
                      {t("visitor.home.accessible", "Acessível")}
                    </span>
                  </div>
                  <Link to={`/obras/${work.id}`} className="work-btn">
                    {t("visitor.home.viewDetails")} <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">🎨</span>
            <p>{t("common.noResults", "Nenhuma obra em destaque no momento.")}</p>
          </div>
        )}
      </section>

      {/* RECOMMENDED TRAILS */}
      <section className="trails-section">
        <div className="section-header">
          <h2>{t("visitor.home.recommendedTrails")}</h2>
        </div>

        {loading ? (
          <div className="skeleton-grid">
            {[1, 2].map(i => (
              <div key={i} className="skeleton-card skeleton-card-small"></div>
            ))}
          </div>
        ) : featuredTrails.length > 0 ? (
          <div className="trails-grid">
            {featuredTrails.map(trail => (
              <article key={trail.id} className="trail-card">
                <h3 className="trail-title">{trail.title}</h3>
                <p className="trail-description">{trail.description}</p>
                <Link to={`/trilhas/${trail.id}`} className="trail-btn">
                  {t("visitor.home.viewTrails")} <ArrowRight size={14} />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">🛤️</span>
            <p>{t("common.noResults", "Nenhuma trilha encontrada.")}</p>
          </div>
        )}
      </section>
    </div>
  );
};
