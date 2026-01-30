import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";
import { AudioDescriptionPlayer } from "../../../components/accessibility/AudioDescriptionPlayer";
import { LibrasSection } from "../../../components/accessibility/LibrasPlayer";
import { NarrativeAudioGuide } from "../components/NarrativeAudioGuide";
import { useTTS } from "../../../hooks/useTTS";
import { useTranslation } from "react-i18next";
import { getFullUrl } from "../../../utils/url";
import { useGamification } from "../../gamification/context/GamificationContext";
import { WorkNote } from "../components/WorkNote";
import { ShareCard } from "../components/ShareCard";
import { AiChatWidget } from "../components/AiChatWidget";
import { NavigationModal } from "../../../components/navigation/NavigationModal";
import { useTerminology } from "../../../hooks/useTerminology";
import { Compass, Share2, Star, Volume2, VolumeX, PlayCircle } from "lucide-react";
import "./WorkDetail.css";

type WorkDetailData = {
  id: string;
  title: string;
  artist: string;
  year?: string;
  category?: string;
  description?: string;
  room?: string;
  floor?: string;
  imageUrl?: string | null;
  audioUrl?: string | null;
  librasUrl?: string | null;
  videoUrl?: string | null;
  latitude?: number;
  longitude?: number;
};

export const WorkDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tenantId, email } = useAuth();
  const { t, i18n } = useTranslation();

  const [relatedWorks, setRelatedWorks] = useState<WorkDetailData[]>([]);
  const [work, setWork] = useState<WorkDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [prevId, setPrevId] = useState(id);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const { speak, cancel, isSpeaking } = useTTS();
  const terms = useTerminology();

  if (id !== prevId) {
    setPrevId(id);
    setLoading(true);
    setError(false);
    setWork(null);
  }

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const fav = favorites.some((f: { id: string; type: string }) => f.id === id && f.type === "work");
    if (fav !== isFavorite) setIsFavorite(fav);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!id) return;

    api
      .get(`/works/${id}`)
      .then((res) => {
        const w = res.data;
        const mapped: WorkDetailData = {
          id: w.id,
          title: w.title,
          artist: w.artist ?? "Artista desconhecido",
          year: w.year ?? "",
          category: w.category?.name ?? w.category ?? "",
          description: w.description ?? "",
          room: w.room ?? "",
          floor: w.floor ?? "",
          imageUrl: getFullUrl(w.imageUrl),
          audioUrl: getFullUrl(w.audioUrl),
          librasUrl: getFullUrl(w.librasUrl),
          videoUrl: getFullUrl(w.videoUrl),
          latitude: w.latitude,
          longitude: w.longitude
        };
        setWork(mapped);
      })
      .catch((err) => {
        console.error("Failed to fetch work details", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const { visitWork, addXp } = useGamification();
  const [treasureFound, setTreasureFound] = useState<{ found: boolean; xp: number } | null>(null);

  useEffect(() => {
    if (work && work.id) {
      visitWork(work.id);

      const clues = JSON.parse(localStorage.getItem("treasure_clues") || "[]");
      const solved = JSON.parse(localStorage.getItem("treasure_solved") || "[]");

      const matchedClue = clues.find((c: { id: string; targetWorkId: string; isActive: boolean; xpReward: number }) =>
        c.isActive && c.targetWorkId === work.id && !solved.includes(c.id)
      );

      if (matchedClue) {
        solved.push(matchedClue.id);
        localStorage.setItem("treasure_solved", JSON.stringify(solved));
        addXp(matchedClue.xpReward);
        setTreasureFound({ found: true, xp: matchedClue.xpReward });
      }
    }
  }, [work, treasureFound?.found, addXp, visitWork]);

  useEffect(() => {
    if (tenantId && id) {
      const emailParam = email ? `&visitorEmail=${encodeURIComponent(email)}` : '';
      api.get(`/works/${id}/related?tenantId=${tenantId}${emailParam}`)
        .then((res) => {
          const works = Array.isArray(res.data) ? res.data : [];
          const mapped = works.map((w: any) => ({
            id: w.id,
            title: w.title,
            artist: w.artist ?? "Artista desconhecido",
            imageUrl: getFullUrl(w.imageUrl),
            audioUrl: getFullUrl(w.audioUrl),
            librasUrl: getFullUrl(w.librasUrl),
          } as WorkDetailData));
          setRelatedWorks(mapped);
        })
        .catch(console.error);
    }
  }, [tenantId, id, email]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

    if (isFavorite) {
      const updated = favorites.filter((f: { id: string; type: string }) => !(f.id === id && f.type === "work"));
      localStorage.setItem("favorites", JSON.stringify(updated));
      setIsFavorite(false);
    } else {
      favorites.push({
        id: work?.id,
        type: "work",
        title: work?.title,
        artist: work?.artist,
        imageUrl: work?.imageUrl
      });
      localStorage.setItem("favorites", JSON.stringify(favorites));
      setIsFavorite(true);
    }
  };

  if (loading) {
    return (
      <div className="work-loading">
        <div className="work-spinner"></div>
        <p>{t("common.loading")}</p>
      </div>
    );
  }

  if (error || !work) {
    return (
      <div className="work-error">
        <span className="error-icon">😕</span>
        <h1>{terms.work} não encontrada</h1>
        <p>
          {error ? t("common.errorConnection", "Houve um problema ao carregar os dados.") : `Não conseguimos encontrar a ${terms.work.toLowerCase()} que você está procurando.`}
        </p>
        <button className="back-btn" onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = "/obras"}>
          {t("common.back")}
        </button>
      </div>
    );
  }

  return (
    <div className="work-detail-container">
      {/* HEADER */}
      <header className="work-header">
        {treasureFound && (
          <div className="treasure-notification">
            <div className="treasure-content">
              <span className="treasure-icon">🏴‍☠️</span>
              <div className="treasure-text">
                <strong>{t("visitor.treasure.foundTitle", "Tesouro Encontrado!")}</strong>
                <span>{t("visitor.treasure.foundText", "Você resolveu uma pista!")}</span>
              </div>
            </div>
            <span className="treasure-xp">+{treasureFound.xp} XP</span>
          </div>
        )}

        <div className="work-header-top">
          <div className="work-header-info">
            <span className="work-badge">{terms.work}</span>
            <h1 className="work-main-title">{work.title}</h1>
            <p className="work-meta">
              {work.artist} • {work.year} • {work.category}
            </p>
            <p className="work-location">
              {t("visitor.artwork.location")}: {work.room || terms.room} • {work.floor || terms.floor}
            </p>
          </div>

          <div className="work-actions">
            {work.latitude && work.longitude && (
              <button
                onClick={() => setShowNavigation(true)}
                className="action-btn"
                title={t("visitor.navigation.howToGet", "Como Chegar")}
              >
                <Compass size={20} />
              </button>
            )}
            <button
              onClick={() => setShowShare(true)}
              className="action-btn"
              title={t("visitor.share.title", "Compartilhar")}
            >
              <Share2 size={20} />
            </button>
            <button
              onClick={toggleFavorite}
              className={`action-btn ${isFavorite ? 'active' : ''}`}
              title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <Star size={20} fill={isFavorite ? "#d4af37" : "none"} />
            </button>
          </div>
        </div>
      </header>

      {showShare && work && (
        <ShareCard
          work={{ title: work.title, artist: work.artist, imageUrl: work.imageUrl || null }}
          onClose={() => setShowShare(false)}
        />
      )}

      {showNavigation && work.latitude && work.longitude && (
        <NavigationModal
          isOpen={showNavigation}
          onClose={() => setShowNavigation(false)}
          destination={{
            lat: work.latitude,
            lng: work.longitude,
            name: work.title
          }}
        />
      )}

      {/* MAIN IMAGE */}
      <section className="work-image-section">
        {work.imageUrl ? (
          <img
            src={work.imageUrl}
            alt={work.title}
            className="work-main-image"
          />
        ) : (
          <div className="work-image-placeholder">
            {t("visitor.artwork.imagePlaceholder")}
          </div>
        )}
      </section>

      {/* DESCRIPTION */}
      <section className="work-description-section">
        <div className="description-header">
          <h2>{t("visitor.artwork.description")}</h2>
          <button
            onClick={() => isSpeaking ? cancel() : speak(work.description || t("visitor.artwork.noDescription"), i18n.language)}
            className={`tts-button ${isSpeaking ? 'speaking' : 'listening'}`}
          >
            {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
            {isSpeaking ? t("visitor.artwork.stopReading") : t("visitor.artwork.listenDescription")}
          </button>
        </div>
        <p className="work-description-text">
          {work.description || t("visitor.artwork.defaultDescription")}
        </p>
      </section>

      {/* AUDIO GUIDE - Premium Narrative Experience */}
      <NarrativeAudioGuide
        audioUrl={work.audioUrl}
        title={work.title}
        artist={work.artist}
      />

      {/* VIDEO SECTION */}
      {work.videoUrl && (
        <section className="video-section">
          <div className="video-header">
            <div className="video-icon">
              <PlayCircle size={28} />
            </div>
            <div>
              <h2>{t('visitor.artwork.videoTitle', 'Vídeo Explicativo')}</h2>
              <p>{t('visitor.artwork.videoSubtitle', 'Descubra curiosidades e contexto histórico')}</p>
            </div>
          </div>
          <div className="video-container">
            <video
              controls
              preload="metadata"
              poster={work.imageUrl || undefined}
              className="video-player"
            >
              <source src={work.videoUrl} type="video/mp4" />
              {t('visitor.artwork.videoNotSupported', 'Seu navegador não suporta vídeos.')}
            </video>
          </div>
        </section>
      )}

      {/* ACCESSIBILITY */}
      <section className="accessibility-section">
        <h2>{t("visitor.artwork.accessibility")}</h2>
        <div className="accessibility-grid">
          <article className="accessibility-card">
            <h3>{t("visitor.artwork.libras")}</h3>
            <p>{t("visitor.artwork.librasText")}</p>
            <LibrasSection videoUrl={work.librasUrl} contentTitle={work.title} />
          </article>
        </div>
      </section>

      {/* AI CHAT */}
      <section className="ai-section">
        <h2>{t("visitor.artwork.aiInteraction")}</h2>
        <p className="ai-section-subtitle">
          {t("visitor.artwork.aiInteractionText", "Converse com nossa Inteligência Artificial para descobrir mais detalhes fascinantes sobre esta obra.")}
        </p>
        <AiChatWidget
          workContext={{
            title: work.title,
            artist: work.artist,
            description: work.description || ""
          }}
        />
      </section>

      {/* NOTES */}
      <section className="notes-section">
        <WorkNote workId={work.id} />
      </section>

      {/* RELATED WORKS */}
      <section className="related-section">
        <h2>{t("visitor.artwork.relatedWorks")}</h2>
        {relatedWorks.length > 0 ? (
          <div className="related-grid">
            {relatedWorks.map((rw) => (
              <article key={rw.id} className="related-card">
                {rw.imageUrl && (
                  <img src={rw.imageUrl} alt={rw.title} className="related-image" />
                )}
                <div className="related-content">
                  <h3 className="related-title">{rw.title}</h3>
                  <p className="related-artist">{rw.artist}</p>
                  <button
                    className="related-btn"
                    type="button"
                    onClick={() => {
                      navigate(`/obras/${rw.id}`);
                      window.scrollTo(0, 0);
                    }}
                  >
                    {t("visitor.artwork.viewDetails")}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="no-related">{t("visitor.noResults")}</p>
        )}
      </section>
    </div>
  );
};
