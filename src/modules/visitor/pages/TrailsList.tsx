import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, isDemoMode } from "../../../api/client";

export const TrailsList: React.FC = () => {
  const { t } = useTranslation();
  type TrailItem = {
    id: string;
    name: string;
    duration?: string;
    worksCount?: number;
    type?: string;
  };

  const mock: TrailItem[] = [
    {
      id: "fast",
      name: t("visitor.home.quickTrail"),
      duration: "45 min",
      worksCount: 8,
      type: "Rápida"
    },
    {
      id: "complete",
      name: t("visitor.home.completeTrail"),
      duration: "2h",
      worksCount: 20,
      type: "Completa"
    }
  ];

  const [apiTrails, setApiTrails] = useState<TrailItem[] | null>(null);
  const tenantId = import.meta.env.VITE_DEFAULT_TENANT_ID as string | undefined;
  const isDemo = isDemoMode || !tenantId;

  useEffect(() => {
    if (isDemo) return;

    api
      .get("/trails", { params: { tenantId } })
      .then((res) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiTrails = (res.data as any[]).map((t) => ({
          id: t.id,
          name: t.name,
          duration: t.durationLabel ?? t.duration ?? "",
          worksCount: Array.isArray(t.works) ? t.works.length : undefined,
          type: t.type ?? "Trilha"
        }));
        setApiTrails(apiTrails);
      })
      .catch(() => {
        console.error("Failed to fetch trails");
      });
  }, [isDemo, tenantId]);

  const trails = isDemo ? mock : (apiTrails || []);

  return (
    <div>
      <h1 className="section-title">{t("visitor.trails.title")}</h1>
      <p className="section-subtitle">
        {t("visitor.trails.subtitle")}
      </p>
      <div className="card-grid">
        {trails.map(trail => (
          <article key={trail.id} className="card">
            <h2 className="card-title">{trail.name}</h2>
            <p className="card-subtitle">
              {trail.duration} • {trail.worksCount} {t("visitor.sidebar.artworks")}
            </p>
            <div className="card-meta">
              <span className="chip">{trail.type}</span>
              <span className="chip">{t("visitor.trails.mapTracking")}</span>
            </div>
            <Link
              to={`/trilhas/${trail.id}`}
              className="btn btn-secondary"
              style={{ marginTop: "0.75rem" }}
            >
              {t("visitor.trails.viewDetails")}
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
};
