import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, isDemoMode } from "../../../api/client";
import { NarrativeAudioGuide } from "../components/NarrativeAudioGuide";
import { VideoPlayer } from "../../../components/common/VideoPlayer";
import { getFullUrl } from "../../../utils/url";
import { Star } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import "./Trails.css";

type TrailDetailData = {
  id: string;
  name: string;
  title?: string;
  description?: string;
  duration?: string;
  audioUrl?: string | null;
  videoUrl?: string | null;
  works: { id: string; title: string }[];
};

export const TrailDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { isGuest } = useAuth();

  const [apiTrail, setApiTrail] = useState<TrailDetailData | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [apiLoading, setApiLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id || isGuest) return;
    api.get(`/favorites/check?type=trail&id=${id}`)
      .then(res => setIsFavorite(res.data.isFavorite))
      .catch(err => console.error("Error checking favorite status", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isGuest]);

  useEffect(() => {
    if (!id) return;

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
            : [];

        const mapped: TrailDetailData = {
          id: t.id,
          name: t.title || t.name,
          title: t.title || t.name,
          description: t.description ?? "",
          duration: t.durationLabel ?? t.duration ?? "",
          audioUrl: getFullUrl(t.audioUrl),
          videoUrl: getFullUrl(t.videoUrl),
          works
        };
        setApiTrail(mapped);
      })
      .catch((err) => {
        console.error("Failed to fetch trail details", err);
        setError(true);
      })
      .finally(() => setApiLoading(false));
  }, [id]);

  const trail = apiTrail;
  const loading = apiLoading;

  const toggleFavorite = async () => {
    if (isGuest) {
      alert(t("visitor.favorites.loginRequired", "Crie uma conta para salvar favoritos na nuvem."));
      return;
    }

    try {
      if (isFavorite) {
        await api.delete(`/favorites/trail/${id}`);
        setIsFavorite(false);
      } else {
        await api.post('/favorites', { type: "trail", itemId: id });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("Erro ao favoritar", err);
    }
  };

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
      <header className="trail-detail-header" style={{ position: 'relative' }}>
        <span className="trail-detail-badge">{t("visitor.trails.badge")}</span>
        <h1 className="trail-detail-title">{trail.name}</h1>
        <p className="trail-detail-meta">
          {trail.duration} • {trail.works.length} {t("visitor.sidebar.artworks")}
        </p>

        <button
          onClick={toggleFavorite}
          style={{
            position: 'absolute',
            top: '2rem',
            right: '2rem',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            borderRadius: '50%',
            width: '45px',
            height: '45px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <Star size={20} fill={isFavorite ? "#d4af37" : "none"} color={isFavorite ? "#d4af37" : "white"} />
        </button>
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

      {/* VIDEO SECTION */}
      <VideoPlayer
        url={trail.videoUrl}
        title={t('visitor.trailDetail.videoTitle', 'O que esperar desta trilha')}
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
