import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, isDemoMode } from "../../../api/client";
import { NarrativeAudioGuide } from "../components/NarrativeAudioGuide";
import { getFullUrl } from "../../../utils/url";
import "./Trails.css";

type TrailDetailData = {
  id: string;
  name: string;
  title?: string;
  description?: string;
  duration?: string;
  audioUrl?: string | null;
  works: { id: string; title: string }[];
};

export const TrailDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const [apiTrail, setApiTrail] = useState<TrailDetailData | null>(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [error, setError] = useState(false);

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

    setApiLoading(true);
    setError(false);
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
          name: t.title || t.name,
          title: t.title || t.name,
          description: t.description ?? mock.description,
          duration: t.durationLabel ?? t.duration ?? mock.duration,
          audioUrl: getFullUrl(t.audioUrl),
          works
        };
        setApiTrail(mapped);
      })
      .catch((err) => {
        console.error("Failed to fetch trail details", err);
        setError(true);
      })
      .finally(() => setApiLoading(false));
  }, [id, isDemo, mock]);

  const trail = isDemo ? mock : apiTrail;
  const loading = isDemo ? false : apiLoading;

  if (loading) {
    return (
      <div className="trail-detail-loading">
        <div className="trail-detail-spinner"></div>
        <p>{t("common.loading")}</p>
      </div>
    );
  }

  if (error || !trail) {
    return (
      <div className="trail-detail-error">
        <span className="trail-detail-error-icon">🗺️</span>
        <h1>{t("visitor.trailDetail.notFound", "Trilha não encontrada")}</h1>
        <p>
          {error ? t("common.errorConnection", "Houve um problema ao carregar os dados.") : t("visitor.trailDetail.notFoundDesc", "A trilha que você procura não existe ou foi removida.")}
        </p>
        <button className="trail-back-btn" onClick={() => window.history.back()}>
          {t("common.back")}
        </button>
      </div>
    );
  }

  return (
    <div className="trail-detail-container">
      <header className="trail-detail-header">
        <span className="trail-detail-badge">{t("visitor.trails.badge")}</span>
        <h1 className="trail-detail-title">{trail.name}</h1>
        <p className="trail-detail-meta">
          {trail.duration} • {trail.works.length} {t("visitor.sidebar.artworks")}
        </p>
      </header>

      <section className="trail-about-section">
        <h2>{t("visitor.trailDetail.about")}</h2>
        <p className="trail-about-text">{trail.description}</p>
      </section>

      {/* AUDIO GUIDE */}
      <NarrativeAudioGuide
        audioUrl={trail.audioUrl}
        title={trail.name}
      />

      <section className="trail-works-section">
        <h2>{t("visitor.trailDetail.artworks")}</h2>
        {trail.works.length > 0 ? (
          <div className="trail-works-grid">
            {trail.works.map((work, index) => (
              <article key={work.id} className="trail-work-card">
                <div className="trail-work-number">{index + 1}</div>
                <h3 className="trail-work-title">{work.title}</h3>
                <p className="trail-work-subtitle">{t("visitor.trailDetail.clickDetails")}</p>
                <button
                  className="trail-work-btn"
                  onClick={() => window.location.href = `/obras/${work.id}`}
                >
                  {t("visitor.home.viewDetails")}
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p className="trail-no-works">{t("visitor.trailDetail.noWorks", "Esta trilha ainda não possui obras.")}</p>
        )}
      </section>
    </div>
  );
};
