import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useGamification } from "../../gamification/context/GamificationContext";
import { useAuth } from "../../auth/AuthContext";
import { EditProfileModal } from "../components/EditProfileModal";
import { SettingsModal } from "../components/SettingsModal";
import { generateStamp } from "../services/StampService";
import { Settings, Edit2 } from "lucide-react";
import "./Passport.css";

export const Passport: React.FC = () => {
  const { t } = useTranslation();
  const { stats, currentLevel, nextLevel, progressToNextLevel } = useGamification();
  const { name, email } = useAuth();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"progress" | "collection" | "journal" | "stamps">("progress");

  type FavoriteItem = {
    id: string;
    title: string;
    type: "work" | "artist" | "event";
    [key: string]: unknown;
  };

  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // Stamp Logic
  const [stamps, setStamps] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    const storedFavs = localStorage.getItem("favorites");
    if (storedFavs) {
      try {
        setFavorites(JSON.parse(storedFavs));
      } catch (e) {
        console.error(e);
      }
    }

    const storedStamps = localStorage.getItem("passport_stamps");
    if (storedStamps) {
      setStamps(JSON.parse(storedStamps));
    }
  }, [activeTab]);

  const handleGenerateStamp = async (workId: string) => {
    setGenerating(workId);
    try {
      // Mock title/artist since we don't have the full work object here easily without fetching
      const stampUrl = await generateStamp(`${t("visitor.artwork.badge")} #${workId}`, t("visitor.artwork.unknownArtist"));
      const newStamps = { ...stamps, [workId]: stampUrl };
      setStamps(newStamps);
      localStorage.setItem("passport_stamps", JSON.stringify(newStamps));
    } catch (error) {
      console.error("Failed to generate stamp", error);
    } finally {
      setGenerating(null);
    }
  };

  const getInitials = (n: string) => {
    return n
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
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
            onClick={() => setActiveTab(tab.id as any)}
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

          {stats.visitedWorks.length === 0 ? (
            <p className="empty-text">{t("visitor.passport.noHistory", "Você ainda não visitou nenhuma obra.")}</p>
          ) : (
            <div>
              {stats.visitedWorks.map((workId, i) => (
                <div key={i} className="history-item">
                  <span className="history-icon" role="img" aria-label="art">🖼️</span>
                  <div className="history-details">
                    <p style={{ fontWeight: "bold", color: "#d4af37" }}>{t("visitor.artwork.badge")} #{workId}</p>
                    <p style={{ fontSize: "0.8rem", color: "#8b7355" }}>{t("visitor.passport.visited", "Visitada")}</p>
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
              {stats.visitedWorks.map((workId) => (
                <div key={workId} style={{ textAlign: "center" }}>
                  <div className={`stamp-slot ${stamps[workId] ? 'filled' : ''}`}>
                    {stamps[workId] ? (
                      <img src={stamps[workId]} alt="Stamp" className="stamp-img" />
                    ) : (
                      generating === workId ? (
                        <div className="spinner"></div>
                      ) : (
                        <button
                          onClick={() => handleGenerateStamp(workId)}
                          className="generate-btn"
                        >
                          {t("visitor.passport.generate", "Carimbar")}
                        </button>
                      )
                    )}
                  </div>
                  <div className="stamp-label">
                    {t("visitor.artwork.badge")} #{workId}
                  </div>
                </div>
              ))}

              {stats.visitedWorks.length === 0 && (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "#666", padding: "2rem" }}>
                  <p style={{ fontFamily: 'Courier New', color: '#463420', fontWeight: 'bold' }}>
                    {t("visitor.passport.empty", "Visite obras para colecionar carimbos!")}
                  </p>
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
              {Object.entries(JSON.parse(localStorage.getItem("visitor_notes") || "{}")).map(([workId, note]) => (
                <div key={workId} className="simple-card">
                  <h4>{t("visitor.artwork.badge")} #{workId}</h4>
                  <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{note as string}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Passport;
