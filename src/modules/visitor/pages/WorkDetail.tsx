import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";
import { AudioDescriptionPlayer } from "../../../components/accessibility/AudioDescriptionPlayer";
import { LibrasPlayer } from "../../../components/accessibility/LibrasPlayer";
import { useTTS } from "../../../hooks/useTTS";
import { useTranslation } from "react-i18next";
import { getFullUrl } from "../../../utils/url";
import { useGamification } from "../../gamification/context/GamificationContext";
import { WorkNote } from "../components/WorkNote";
import { ShareCard } from "../components/ShareCard";
import { AiChatWidget } from "../components/AiChatWidget";


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
};

export const WorkDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tenantId } = useAuth();
  const { t, i18n } = useTranslation();

  // Helper to format URLs
  // content removed - now using imported util

  const [relatedWorks, setRelatedWorks] = useState<WorkDetailData[]>([]);

  const [work, setWork] = useState<WorkDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const { speak, cancel, isSpeaking } = useTTS();

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favorites.some((f: { id: string; type: string }) => f.id === id && f.type === "work"));
  }, [id]);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(false);
    api
      .get(`/works/${id}`)
      .then((res) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = res.data as any;
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
          librasUrl: getFullUrl(w.librasUrl)
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

      // Treasure Hunt Logic
      const clues = JSON.parse(localStorage.getItem("treasure_clues") || "[]");
      const solved = JSON.parse(localStorage.getItem("treasure_solved") || "[]");

      const matchedClue = clues.find((c: { id: string; targetWorkId: string; isActive: boolean; xpReward: number }) =>
        c.isActive && c.targetWorkId === work.id && !solved.includes(c.id)
      );

      if (matchedClue) {
        // Mark as solved
        solved.push(matchedClue.id);
        localStorage.setItem("treasure_solved", JSON.stringify(solved));

        // Award XP
        addXp(matchedClue.xpReward);

        // Show notification
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTreasureFound({ found: true, xp: matchedClue.xpReward });
      }
    }
  }, [work, treasureFound?.found, addXp, visitWork]);

  useEffect(() => {
    if (tenantId && id) {
      api.get(`/works?tenantId=${tenantId}`)
        .then((res) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const allWorks = res.data as any[];
          const others = allWorks.filter((w) => w.id !== id);
          const shuffled = others.sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, 2).map((w) => ({
            id: w.id,
            title: w.title,
            artist: w.artist ?? "Artista desconhecido",
            imageUrl: getFullUrl(w.imageUrl),
            audioUrl: getFullUrl(w.audioUrl),
            librasUrl: getFullUrl(w.librasUrl),
            // minimal fields for card
          } as WorkDetailData));
          setRelatedWorks(selected);
        })
        .catch(console.error);
    }
  }, [tenantId, id]);

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
      <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
        <div className="spinner" style={{ width: "40px", height: "40px", border: "4px solid rgba(255,255,255,0.1)", borderTopColor: "var(--primary-color)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <p>{t("common.loading")}</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !work) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>😕</div>
        <h1 className="section-title">{t("visitor.artwork.notFound", "Obra não encontrada")}</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          {error ? t("common.errorConnection", "Houve um problema ao carregar os dados.") : t("visitor.artwork.notFoundDesc", "Não conseguimos encontrar a obra que você está procurando.")}
        </p>
        <button className="btn btn-secondary" onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = "/obras"}>
          {t("common.back")}
        </button>
      </div>
    );
  }

  return (
    <div>
      <header style={{ marginBottom: "1.75rem" }}>
        {treasureFound && (
          <div
            style={{
              backgroundColor: "#10b981",
              color: "white",
              padding: "1rem",
              borderRadius: "0.5rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              animation: "slideDown 0.5s ease-out"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.5rem" }}>🏴‍☠️</span>
              <div>
                <strong>{t("visitor.treasure.foundTitle", "Tesouro Encontrado!")}</strong>
                <div style={{ fontSize: "0.9rem" }}>{t("visitor.treasure.foundText", "Você resolveu uma pista!")}</div>
              </div>
            </div>
            <div className="badge" style={{ backgroundColor: "white", color: "#10b981" }}>+{treasureFound.xp} XP</div>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="badge">{t("visitor.artwork.badge")}</div>
            <h1 className="section-title">{work.title}</h1>
            <p className="section-subtitle">
              {work.artist} • {work.year} • {work.category}
            </p>
            <p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
              {t("visitor.artwork.location")}: {work.room || t("visitor.artwork.unknownRoom")} • {work.floor || t("visitor.artwork.unknownFloor")}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => setShowShare(true)}
              className="btn btn-secondary"
              style={{ fontSize: "1.2rem", padding: "0.5rem 0.75rem" }}
              title={t("visitor.share.title", "Compartilhar")}
            >
              📤
            </button>
            <button
              onClick={toggleFavorite}
              className="btn btn-secondary"
              style={{ fontSize: "1.2rem", padding: "0.5rem 0.75rem", color: isFavorite ? "var(--primary-color)" : "inherit" }}
            >
              {isFavorite ? "★" : "☆"}
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

      <section style={{ marginBottom: "1.75rem" }}>
        {work.imageUrl ? (
          <img
            src={work.imageUrl}
            alt={work.title}
            style={{
              width: "100%",
              maxHeight: "500px",
              objectFit: "contain",
              borderRadius: "1rem",
              backgroundColor: "rgba(0,0,0,0.2)"
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              aspectRatio: "16 / 9",
              borderRadius: "1rem",
              background:
                "linear-gradient(135deg, rgba(30,64,175,0.8), rgba(56,189,248,0.4))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#e5e7eb",
              fontSize: "0.95rem",
              textAlign: "center",
              padding: "1rem"
            }}
          >
            {t("visitor.artwork.imagePlaceholder")}
          </div>
        )}
      </section>

      <section style={{ marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 className="section-title" style={{ margin: 0 }}>{t("visitor.artwork.description")}</h2>
          <button
            onClick={() => isSpeaking ? cancel() : speak(work.description || t("visitor.artwork.noDescription"), i18n.language)}
            style={{
              background: isSpeaking ? "#ef4444" : "#d4af37",
              color: "#1a1108",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.9rem"
            }}
          >
            {isSpeaking ? `⏹ ${t("visitor.artwork.stopReading")}` : `🔊 ${t("visitor.artwork.listenDescription")}`}
          </button>
        </div>
        <p style={{ fontSize: "0.95rem", color: "#e5e7eb", lineHeight: 1.7 }}>
          {work.description ||
            t("visitor.artwork.defaultDescription")}
        </p>
      </section>

      <section style={{ marginBottom: "1.75rem" }}>
        <h2 className="section-title">{t("visitor.artwork.accessibility")}</h2>
        <div className="card-grid">
          <article className="card">
            <h3 className="card-title">{t("visitor.artwork.audioDescription")}</h3>
            <p className="card-subtitle">
              {t("visitor.artwork.audioDescriptionText")}
            </p>
            <AudioDescriptionPlayer src={work.audioUrl} />
          </article>

          <article className="card">
            <h3 className="card-title">{t("visitor.artwork.libras")}</h3>
            <p className="card-subtitle">
              {t("visitor.artwork.librasText")}
            </p>
            <LibrasPlayer src={work.librasUrl} />
          </article>
        </div>
      </section>


      <section style={{ marginBottom: "1.75rem" }}>
        <h2 className="section-title">{t("visitor.artwork.aiInteraction")}</h2>
        <p className="section-subtitle">
          {t("visitor.artwork.aiInteractionText")}
        </p>
        <AiChatWidget
          workContext={{
            title: work.title,
            artist: work.artist,
            description: work.description || ""
          }}
        />
      </section>

      <section style={{ marginBottom: "1.75rem" }}>
        <WorkNote workId={work.id} />
      </section>

      <section>
        <h2 className="section-title">{t("visitor.artwork.relatedWorks")}</h2>
        <div className="card-grid">
          {relatedWorks.map((rw) => (
            <article key={rw.id} className="card">
              {rw.imageUrl && (
                <div style={{ width: "100%", height: "150px", overflow: "hidden", borderRadius: "0.5rem", marginBottom: "0.5rem" }}>
                  <img src={rw.imageUrl} alt={rw.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              <h3 className="card-title">{rw.title}</h3>
              <p className="card-subtitle">{rw.artist}</p>
              <button
                className="btn btn-secondary"
                type="button"
                style={{ marginTop: "0.75rem" }}
                onClick={() => {
                  navigate(`/obras/${rw.id}`);
                  window.scrollTo(0, 0);
                }}
              >
                {t("visitor.artwork.viewDetails")}
              </button>
            </article>
          ))}
          {relatedWorks.length === 0 && (
            <p style={{ color: "#9ca3af", fontStyle: "italic" }}>{t("visitor.noResults")}</p>
          )}
        </div>
      </section>
    </div>
  );
};
