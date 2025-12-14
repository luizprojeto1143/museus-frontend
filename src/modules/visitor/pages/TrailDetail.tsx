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
          name: t.name,
          description: t.description ?? mock.description,
          duration: t.durationLabel ?? t.duration ?? mock.duration,
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
      <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
        <div className="spinner" style={{ width: "40px", height: "40px", border: "4px solid rgba(255,255,255,0.1)", borderTopColor: "var(--primary-color)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <p>{t("common.loading")}</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !trail) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🗺️</div>
        <h1 className="section-title">{t("visitor.trailDetail.notFound", "Trilha não encontrada")}</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          {error ? t("common.errorConnection", "Houve um problema ao carregar os dados.") : t("visitor.trailDetail.notFoundDesc", "A trilha que você procura não existe ou foi removida.")}
        </p>
        <button className="btn btn-secondary" onClick={() => window.history.back()}>
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
        {trail.works.length > 0 ? (
          <div className="card-grid">
            {trail.works.map((work, index) => (
              <article key={work.id} className="card" style={{ position: "relative" }}>
                <div style={{
                  position: "absolute",
                  top: "-0.75rem",
                  left: "-0.75rem",
                  width: "2rem",
                  height: "2rem",
                  background: "var(--primary-color)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  color: "#1a1108",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
                }}>
                  {index + 1}
                </div>
                <h3 className="card-title" style={{ marginTop: "0.5rem" }}>{work.title}</h3>
                <p className="card-subtitle">{t("visitor.trailDetail.clickDetails")}</p>
                <button
                  className="btn btn-secondary"
                  style={{ marginTop: "1rem", width: "100%" }}
                  onClick={() => window.location.href = `/obras/${work.id}`}
                >
                  {t("visitor.home.viewDetails")}
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p style={{ color: "#9ca3af", fontStyle: "italic" }}>{t("visitor.trailDetail.noWorks", "Esta trilha ainda não possui obras.")}</p>
        )}
      </section>
    </div>
  );
};
