import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, isDemoMode } from "../../../api/client";

type TrailDetailData = {
  id: string;
  name: string;
  description?: string;
  duration?: string;
  works: { id: string; title: string }[];
};

export const TrailDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const [apiTrail, setApiTrail] = useState<TrailDetailData | null>(null);
  const [apiLoading, setApiLoading] = useState(true);

  const mock: TrailDetailData = React.useMemo(() => ({
    id: id || "fast",
    name: id === "fast" ? t("visitor.home.quickTrail") : t("visitor.home.completeTrail"),
    description:
      "Descrição da trilha, objetivo, perfil de visitante recomendado e orientações gerais.",
    duration: id === "fast" ? "45 min" : "2h",
    works: [
      { id: "1", title: t("visitor.home.exampleArtwork") + " 1" },
      { id: "2", title: t("visitor.home.exampleArtwork") + " 2" }
    ]
  }), [id, t]);

  const isDemo = isDemoMode || !id;

  useEffect(() => {
    if (isDemo) return;

    // setApiLoading(true); // Initialized as true
    api
      .get(`/trails/${id}`)
      .then((res) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const t = res.data as any;
        const works =
          Array.isArray(t.works) && t.works.length
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? t.works.map((tw: any) => ({
              id: tw.work?.id ?? tw.id,
              title: tw.work?.title ?? tw.title ?? "Obra da trilha"
            }))
            : mock.works;

        const mapped: TrailDetailData = {
          id: t.id,
          name: t.name,
          description: t.description ?? mock.description,
          duration: t.durationLabel ?? t.duration ?? mock.duration,
          works
        };
        setApiTrail(mapped);
      })
      .catch(() => {
        console.error("Failed to fetch trail details");
      })
      .finally(() => setApiLoading(false));
  }, [id, isDemo, mock]);

  const trail = isDemo ? mock : apiTrail;
  const loading = isDemo ? false : apiLoading;

  if (loading) {
    return (
      <div>
        <h1 className="section-title">{t("visitor.trailDetail.loading")}</h1>
      </div>
    );
  }

  if (!trail) {
    return (
      <div>
        <h1 className="section-title">{t("visitor.trailDetail.notFound", "Trilha não encontrada")}</h1>
        <button className="btn btn-secondary mt-4" onClick={() => window.history.back()}>
          {t("common.back")}
        </button>
      </div>
    );
  }

  return (
    <div>
      <header style={{ marginBottom: "1.5rem" }}>
        <div className="badge">{t("visitor.trails.badge")}</div>
        <h1 className="section-title">{trail.name}</h1>
        <p className="section-subtitle">
          {trail.duration} • {trail.works.length} {t("visitor.sidebar.artworks")}
        </p>
      </header>

      <section style={{ marginBottom: "1.75rem" }}>
        <h2 className="section-title">{t("visitor.trailDetail.about")}</h2>
        <p style={{ fontSize: "0.95rem", color: "#e5e7eb", lineHeight: 1.7 }}>
          {trail.description}
        </p>
      </section>

      <section>
        <h2 className="section-title">{t("visitor.trailDetail.artworks")}</h2>
        <div className="card-grid">
          {trail.works.map((work) => (
            <article key={work.id} className="card">
              <h3 className="card-title">{work.title}</h3>
              <p className="card-subtitle">{t("visitor.trailDetail.clickDetails")}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
