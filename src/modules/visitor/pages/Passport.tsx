import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useGamification } from "../../gamification/context/GamificationContext";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";
import { EditProfileModal } from "../components/EditProfileModal";
import { SettingsModal } from "../components/SettingsModal";
import { Settings, Edit2, MapPin, Calendar } from "lucide-react";
import "./Passport.css";

// Helper to get full image URL
const getFullUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

interface VisitedWork {
  id: string;
  title: string;
  imageUrl?: string;
  visitedAt?: string;
}

export const Passport: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { stats, currentLevel, nextLevel, progressToNextLevel, refreshGamification } = useGamification();
  const { name, email, tenantId } = useAuth();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"progress" | "collection" | "journal" | "stamps">("progress");

  // Works data with full info
  const [visitedWorks, setVisitedWorks] = useState<VisitedWork[]>([]);
  const [loadingWorks, setLoadingWorks] = useState(false);

  type FavoriteItem = {
    id: string;
    title: string;
    type: "work" | "artist" | "event";
    [key: string]: unknown;
  };

  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // Stamp Logic - now using work images
  const [stamped, setStamped] = useState<Set<string>>(new Set());

  // Fetch works data with titles and images
  const fetchVisitedWorks = useCallback(async () => {
    if (!email || !tenantId) return;

    setLoadingWorks(true);
    try {
      const res = await api.get(`/visitors/me/summary?email=${email}&tenantId=${tenantId}`);
      const data = res.data;

      // Extract visited works from the response
      if (data.stamps && Array.isArray(data.stamps)) {
        // Backend returns stamps with workTitle
        const works: VisitedWork[] = data.stamps.map((s: { workId?: string; workTitle: string; workImageUrl?: string; date: string }, i: number) => ({
          id: s.workId || `stamp-${i}`,
          title: s.workTitle || "Obra",
          imageUrl: s.workImageUrl,
          visitedAt: s.date
        }));
        setVisitedWorks(works);
      }

      // If backend returns visits with work details
      if (data.visits && Array.isArray(data.visits)) {
        const works: VisitedWork[] = data.visits
          .filter((v: { work?: { id: string; title: string; imageUrl?: string } }) => v.work)
          .map((v: { work: { id: string; title: string; imageUrl?: string }; createdAt?: string }) => ({
            id: v.work.id,
            title: v.work.title,
            imageUrl: v.work.imageUrl,
            visitedAt: v.createdAt
          }));

        // Deduplicate by id
        const uniqueWorks = Array.from(new Map(works.map(w => [w.id, w])).values());
        setVisitedWorks(uniqueWorks);
      }
    } catch (error) {
      console.error("Failed to fetch visited works", error);

      // Fallback: fetch works data from IDs
      if (stats.visitedWorks.length > 0 && tenantId) {
        try {
          const worksRes = await api.get("/works", { params: { tenantId } });
          const allWorks = worksRes.data.data || worksRes.data || [];

          const worksMap = new Map(allWorks.map((w: { id: string; title: string; imageUrl?: string }) => [w.id, w]));
          const works = stats.visitedWorks
            .map(id => {
              const work = worksMap.get(id);
              if (work) {
                return {
                  id: (work as { id: string }).id,
                  title: (work as { title: string }).title,
                  imageUrl: (work as { imageUrl?: string }).imageUrl
                } as VisitedWork;
              }
              return null;
            })
            .filter((w): w is VisitedWork => w !== null);

          setVisitedWorks(works);
        } catch (e) {
          console.error("Fallback fetch failed", e);
        }
      }
    } finally {
      setLoadingWorks(false);
    }
  }, [email, tenantId, stats.visitedWorks]);

  useEffect(() => {
    fetchVisitedWorks();

    const storedFavs = localStorage.getItem("favorites");
    if (storedFavs) {
      try {
        setFavorites(JSON.parse(storedFavs));
      } catch (e) {
        console.error(e);
      }
    }

    const storedStamped = localStorage.getItem("passport_stamped_ids");
    if (storedStamped) {
      setStamped(new Set(JSON.parse(storedStamped)));
    }
  }, [fetchVisitedWorks]);

  // Refresh gamification data when tab changes
  useEffect(() => {
    if (activeTab === "progress" && refreshGamification) {
      refreshGamification();
    }
  }, [activeTab, refreshGamification]);

  const handleStamp = (workId: string) => {
    const newStamped = new Set(stamped);
    newStamped.add(workId);
    setStamped(newStamped);
    localStorage.setItem("passport_stamped_ids", JSON.stringify([...newStamped]));
  };

  const getInitials = (n: string) => {
    return n
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short"
    });
  };

  return (
    <div className="passport-container">
      {/* Profile Header */}
      <div className="passport-header">
        <div className="passport-avatar">
          {name ? getInitials(name) : "V"}
        </div>
        <div>
          <h1 className="passport-title">{name || t("common.visitor")}</h1>
          <p className="passport-subtitle">{email}</p>
        </div>
        <div className="passport-actions">
          <button
            className="icon-btn"
            onClick={() => setIsEditProfileOpen(true)}
            title={t("visitor.profile.editTitle", "Editar Perfil")}
          >
            <Edit2 size={18} />
          </button>
          <button
            className="icon-btn"
            onClick={() => setIsSettingsOpen(true)}
            title={t("visitor.settings.title", "Configurações")}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Tabs */}
      <div className="passport-tabs">
        {[
          { id: "progress", label: t("visitor.passport.tabs.progress", "Progresso") },
          { id: "stamps", label: t("visitor.passport.tabs.stamps", "Carimbos") },
          { id: "collection", label: t("visitor.passport.tabs.collection", "Coleção") },
          { id: "journal", label: t("visitor.passport.tabs.journal", "Diário") },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`passport-tab-btn ${activeTab === tab.id ? "active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "progress" && (
        <div className="animate-fadeIn">
          <div className="progress-card">
            <div className="progress-header">
              <h2 className="level-title">{currentLevel.title}</h2>
              <span className="level-chip">{t("visitor.passport.level", "Nível")} {currentLevel.level}</span>
            </div>

            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${progressToNextLevel}%` }}
              />
            </div>

            <div className="xp-stats">
              <span>{stats.xp} XP</span>
              {nextLevel && <span>{t("visitor.passport.next", "Próximo")}: {nextLevel.minXp} XP</span>}
            </div>
          </div>

          <h3 className="section-title">{t("visitor.passport.historyTitle", "Histórico de Visitas")}</h3>

          {loadingWorks ? (
            <div className="empty-text" style={{ textAlign: "center", padding: "2rem" }}>
              <div className="spinner" style={{ margin: "0 auto 1rem" }}></div>
              <p>Carregando...</p>
            </div>
          ) : visitedWorks.length === 0 ? (
            <p className="empty-text">{t("visitor.passport.noHistory", "Você ainda não visitou nenhuma obra.")}</p>
          ) : (
            <div>
              {visitedWorks.map((work, i) => (
                <div
                  key={work.id + "-" + i}
                  className="history-item"
                  onClick={() => navigate(`/obras/${work.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  {work.imageUrl ? (
                    <img
                      src={getFullUrl(work.imageUrl)}
                      alt={work.title}
                      className="history-img"
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 8,
                        objectFit: "cover",
                        border: "2px solid #d4af37"
                      }}
                    />
                  ) : (
                    <span className="history-icon" role="img" aria-label="art">🖼️</span>
                  )}
                  <div className="history-details">
                    <p style={{ fontWeight: "bold", color: "#d4af37", margin: 0 }}>{work.title}</p>
                    <p style={{ fontSize: "0.8rem", color: "#8b7355", margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
                      <Calendar size={12} />
                      {work.visitedAt ? formatDate(work.visitedAt) : t("visitor.passport.visited", "Visitada")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "stamps" && (
        <div className="animate-fadeIn">
          <h3 className="section-title">{t("visitor.passport.stampsTitle", "Meus Carimbos")}</h3>

          <div className="passport-book-bg">
            <div className="passport-book-grid">
              {visitedWorks.map((work) => (
                <div key={work.id} style={{ textAlign: "center" }}>
                  <div className={`stamp-slot ${stamped.has(work.id) ? 'filled' : ''}`}>
                    {stamped.has(work.id) ? (
                      <div className="stamp-container" style={{ position: "relative" }}>
                        {work.imageUrl ? (
                          <img
                            src={getFullUrl(work.imageUrl)}
                            alt={work.title}
                            className="stamp-img"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: 8,
                              filter: "sepia(0.3) contrast(1.1)",
                              border: "3px solid #8b4513"
                            }}
                          />
                        ) : (
                          <div style={{
                            width: "100%",
                            height: "100%",
                            background: "linear-gradient(135deg, #8b4513, #654321)",
                            borderRadius: 8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#d4af37",
                            fontSize: "2rem"
                          }}>
                            🏛️
                          </div>
                        )}
                        <div style={{
                          position: "absolute",
                          bottom: -8,
                          right: -8,
                          background: "#d4af37",
                          borderRadius: "50%",
                          width: 24,
                          height: 24,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
                        }}>
                          ✓
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStamp(work.id)}
                        className="generate-btn"
                      >
                        {t("visitor.passport.generate", "Carimbar")}
                      </button>
                    )}
                  </div>
                  <div className="stamp-label" style={{
                    marginTop: 8,
                    fontSize: "0.75rem",
                    color: "#463420",
                    fontWeight: 600,
                    maxWidth: 100,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}>
                    {work.title}
                  </div>
                </div>
              ))}

              {visitedWorks.length === 0 && (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "#666", padding: "2rem" }}>
                  <MapPin size={48} style={{ color: "#d4af37", marginBottom: "1rem" }} />
                  <p style={{ fontFamily: 'Georgia, serif', color: '#463420', fontWeight: 'bold' }}>
                    {t("visitor.passport.empty", "Visite obras para colecionar carimbos!")}
                  </p>
                  <button
                    className="generate-btn"
                    onClick={() => navigate("/obras")}
                    style={{ marginTop: "1rem" }}
                  >
                    Ver Obras
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "collection" && (
        <div className="animate-fadeIn">
          <h3 className="section-title">{t("visitor.passport.favoritesTitle", "Meus Favoritos")}</h3>
          {favorites.length === 0 ? (
            <p className="empty-text">{t("visitor.passport.noFavorites", "Sua coleção está vazia.")}</p>
          ) : (
            <div className="card-grid">
              {favorites.map((item) => (
                <div key={item.id} className="simple-card">
                  <h4>{item.title}</h4>
                  <p>{item.type === "work" ? t("visitor.sidebar.artworks") : "Item"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "journal" && (
        <div className="animate-fadeIn">
          <h3 className="section-title">{t("visitor.passport.journalTitle", "Meu Diário de Bordo")}</h3>
          {Object.keys(JSON.parse(localStorage.getItem("visitor_notes") || "{}")).length === 0 ? (
            <p className="empty-text">{t("visitor.passport.noNotes", "Seu diário de bordo está vazio. Visite obras para adicionar anotações.")}</p>
          ) : (
            <div className="card-grid">
              {Object.entries(JSON.parse(localStorage.getItem("visitor_notes") || "{}")).map(([workId, note]) => {
                const work = visitedWorks.find(w => w.id === workId);
                return (
                  <div key={workId} className="simple-card">
                    <h4>{work?.title || t("visitor.artwork.badge")}</h4>
                    <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{note as string}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Passport;
