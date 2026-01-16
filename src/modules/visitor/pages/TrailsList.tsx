import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";

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

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    api
      .get("/trails", { params: { tenantId } })
      .then((res) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiTrails = (res.data as any[]).map((t) => ({
          id: t.id,
          name: t.title, // Backend returns title
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
    <div>
      <h1 className="section-title">{t("visitor.trails.title")}</h1>
      <p className="section-subtitle">
        {t("visitor.trails.subtitle")}
      </p>

      {loading ? (
        <div className="card-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="card" style={{ height: "200px", animation: "pulse 1.5s infinite", background: "rgba(255,255,255,0.05)" }}></div>
          ))}
        </div>
      ) : trails.length > 0 ? (
        <div className="card-grid">
          {trails.map(trail => (
            <article key={trail.id} className="card" style={{ display: "flex", flexDirection: "column" }}>
              <h2 className="card-title">{trail.name}</h2>
              {trail.description && (
                <p className="card-subtitle" style={{ marginBottom: "1rem", flex: 1 }}>
                  {trail.description.length > 100 ? trail.description.substring(0, 100) + "..." : trail.description}
                </p>
              )}
              <div className="card-meta" style={{ marginTop: "auto" }}>
                <span className="chip">⏱ {trail.duration || "Livre"}</span>
                <span className="chip">🖼 {trail.worksCount} {t("visitor.sidebar.artworks")}</span>
              </div>
              <Link
                to={`/trilhas/${trail.id}`}
                className="btn btn-secondary"
                style={{ marginTop: "1rem", width: "100%", textAlign: "center" }}
              >
                {t("visitor.trails.viewDetails")}
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🗺️</div>
          <h3>{t("visitor.trails.emptyTitle", "Nenhuma trilha disponível")}</h3>
          <p style={{ color: "#9ca3af" }}>{t("visitor.trails.emptyDesc", "O museu ainda não criou trilhas guiadas. Explore as obras individualmente!")}</p>
          <Link to="/obras" className="btn btn-primary" style={{ marginTop: "1rem", display: "inline-block" }}>
            {t("visitor.home.viewArtworks", "Ver Obras")}
          </Link>
        </div>
      )}
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
