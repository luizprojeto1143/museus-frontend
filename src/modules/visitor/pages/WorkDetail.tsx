import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, isDemoMode } from "../../../api/client";
import { AudioDescriptionPlayer } from "../../../components/accessibility/AudioDescriptionPlayer";
import { LibrasPlayer } from "../../../components/accessibility/LibrasPlayer";
import { useTTS } from "../../../hooks/useTTS";
import { useTranslation } from "react-i18next";
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
  audioUrl?: string | null;
  librasUrl?: string | null;
};

export const WorkDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();

  const [apiWork, setApiWork] = useState<WorkDetailData | null>(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const { speak, cancel, isSpeaking } = useTTS();

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsFavorite(favorites.some((f: { id: string; type: string }) => f.id === id && f.type === "work"));
  }, [id]);

  const mock: WorkDetailData = {
    id: id || "1",
    title: "Obra de exemplo",
    artist: "Artista A",
    year: "1920",
    category: "Pintura",
    description:
      "Descrição completa da obra, incluindo contexto histórico, técnica utilizada, curiosidades e relação com o acervo.",
    room: "Sala 2",
    floor: "2º andar",
    audioUrl: "/audios/exemplo.mp3",
    librasUrl: "/videos/libras-exemplo.mp4"
  };

  const isDemo = isDemoMode || !id;

  useEffect(() => {
    if (isDemo) return;

    // setApiLoading(true); // Initialized as true
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
          category: w.category ?? "",
          description: w.description ?? "",
          room: w.room ?? "",
          floor: w.floor ?? "",
          audioUrl: w.audioUrl ?? null,
          librasUrl: w.librasUrl ?? null
        };
        setApiWork(mapped);
      })
      .catch(() => {
        console.error("Failed to fetch work details");
      })
      .finally(() => setApiLoading(false));
  }, [id, isDemo]);

  const work = isDemo ? mock : apiWork;
  const loading = isDemo ? false : apiLoading;

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
  }, [work, treasureFound?.found, addXp]); // Add addXp to dependencies

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
        imageUrl: null
      });
      localStorage.setItem("favorites", JSON.stringify(favorites));
      setIsFavorite(true);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="section-title">{t("common.loading")}</h1>
      </div>
    );
  }

  if (!work) {
    return (
      <div>
        <h1 className="section-title">{t("visitor.artwork.notFound", "Obra não encontrada")}</h1>
        <button className="btn btn-secondary mt-4" onClick={() => window.history.back()}>
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
              style={{ fontSize: "1.2rem", padding: "0.5rem 0.75rem" }}
            >
              {isFavorite ? "★" : "☆"}
            </button>
          </div>
        </div>
      </header>

      {showShare && work && (
        <ShareCard
          work={{ title: work.title, artist: work.artist, imageUrl: null }}
          onClose={() => setShowShare(false)}
        />
      )}

      <section style={{ marginBottom: "1.75rem" }}>
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
          {[1, 2].map((r) => (
            <article key={r} className="card">
              <h3 className="card-title">{t("visitor.artwork.relatedWork")} {r}</h3>
              <p className="card-subtitle">{t("visitor.artwork.relatedArtist")}</p>
              <button className="btn btn-secondary" type="button" style={{ marginTop: "0.75rem" }}>
                {t("visitor.artwork.viewDetails")}
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
