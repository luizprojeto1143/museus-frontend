import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { ArrowRight, Compass } from "lucide-react";
import "./Trails.css";

export const TrailsList: React.FC = () => {
  const { t } = useTranslation();
  type TrailItem = {
    id: string;
    name: string;
    description?: string;
    duration?: string;
    worksCount?: number;
    type?: string;
  };

  const [trails, setTrails] = useState<TrailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { tenantId } = useAuth();

  useEffect(() => {
    if (!tenantId) return;

    setLoading(true);
    api
      .get("/trails", { params: { tenantId } })
      .then((res) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiTrails = (res.data as any[]).map((t) => ({
          id: t.id,
          name: t.title,
          description: t.description,
          duration: t.duration ? `${t.duration} min` : undefined,
          worksCount: Array.isArray(t.workIds) ? t.workIds.length : 0,
          type: "Trilha"
        }));
        setTrails(apiTrails);
      })
      .catch(() => {
        console.error("Failed to fetch trails");
      })
      .finally(() => setLoading(false));
  }, [tenantId]);

  return (
    <div className="trails-container">
      <header className="trails-header">
        <h1 className="trails-header-title">{t("visitor.trails.title")}</h1>
        <p className="trails-header-subtitle">
          {t("visitor.trails.subtitle")}
        </p>
      </header>

      {loading ? (
        <div className="trails-skeleton-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="trails-skeleton-card"></div>
          ))}
        </div>
      ) : trails.length > 0 ? (
        <div className="trails-grid">
          {trails.map(trail => (
            <article key={trail.id} className="trail-card">
              <h2 className="trail-card-title">{trail.name}</h2>
              {trail.description && (
                <p className="trail-card-description">
                  {trail.description.length > 100 ? trail.description.substring(0, 100) + "..." : trail.description}
                </p>
              )}
              <div className="trail-card-meta">
                <span className="trail-chip">⏱ {trail.duration || "Livre"}</span>
                <span className="trail-chip">🖼 {trail.worksCount} {t("visitor.sidebar.artworks")}</span>
              </div>
              <Link to={`/trilhas/${trail.id}`} className="trail-card-btn">
                {t("visitor.trails.viewDetails")} <ArrowRight size={14} />
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="trails-empty">
          <span className="trails-empty-icon">🗺️</span>
          <h3>{t("visitor.trails.emptyTitle", "Nenhuma trilha disponível")}</h3>
          <p>{t("visitor.trails.emptyDesc", "O museu ainda não criou trilhas guiadas. Explore as obras individualmente!")}</p>
          <Link to="/obras" className="trails-empty-btn">
            <Compass size={18} />
            {t("visitor.home.viewArtworks", "Ver Obras")}
          </Link>
        </div>
      )}
    </div>
  );
};
