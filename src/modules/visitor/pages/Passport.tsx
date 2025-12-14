import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useGamification } from "../../gamification/context/GamificationContext";
import { useAuth } from "../../auth/AuthContext";
import { EditProfileModal } from "../components/EditProfileModal";
import { SettingsModal } from "../components/SettingsModal";
import { generateStamp } from "../services/StampService";

export const Passport: React.FC = () => {
  const { t } = useTranslation();
  const { stats, currentLevel, nextLevel, progressToNextLevel } = useGamification();
  const { name, email } = useAuth();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"progress" | "collection" | "journal" | "stamps">("progress");
  const [favorites, setFavorites] = useState<any[]>([]);

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

  const renderTabs = () => (
    <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", borderBottom: "1px solid #e5e7eb", overflowX: "auto" }}>
      {[
        { id: "progress", label: t("visitor.passport.tabs.progress", "Progresso") },
        { id: "stamps", label: t("visitor.passport.tabs.stamps", "Carimbos") },
        { id: "collection", label: t("visitor.passport.tabs.collection", "Coleção") },
        { id: "journal", label: t("visitor.passport.tabs.journal", "Diário") },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as any)}
          style={{
            padding: "0.75rem 0",
            borderBottom: activeTab === tab.id ? "2px solid var(--primary)" : "none",
            color: activeTab === tab.id ? "var(--primary)" : "#6b7280",
            fontWeight: activeTab === tab.id ? "bold" : "normal",
            background: "none",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
            whiteSpace: "nowrap"
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="page-container">
      {/* Profile Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <div
          style={{
            width: "4rem",
            height: "4rem",
            borderRadius: "50%",
            background: "var(--primary)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            fontWeight: "bold"
          }}
        >
          {name ? getInitials(name) : "V"}
        </div>
        <div style={{ flex: 1 }}>
          <h1 className="section-title" style={{ marginBottom: "0.25rem" }}>{name || t("common.visitor")}</h1>
          <p style={{ margin: 0, color: "#6b7280", fontSize: "0.9rem" }}>{email}</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            className="btn btn-secondary"
            onClick={() => setIsEditProfileOpen(true)}
            style={{ padding: "0.5rem" }}
            title={t("visitor.profile.editTitle", "Editar Perfil")}
          >
            ✏️
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setIsSettingsOpen(true)}
            style={{ padding: "0.5rem" }}
            title={t("visitor.settings.title", "Configurações")}
          >
            ⚙️
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

      {renderTabs()}

      {activeTab === "progress" && (
        <>
          <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.25rem" }}>{currentLevel.title}</h2>
              <span className="chip" style={{ background: "var(--primary)", color: "white" }}>{t("visitor.passport.level", "Nível")} {currentLevel.level}</span>
            </div>

            <div style={{ background: "#e5e7eb", borderRadius: "999px", height: "0.75rem", overflow: "hidden", marginBottom: "0.5rem" }}>
              <div
                style={{
                  width: `${progressToNextLevel}%`,
                  background: "var(--primary)",
                  height: "100%",
                  transition: "width 0.5s ease-out"
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", color: "#6b7280" }}>
              <span>{stats.xp} XP</span>
              {nextLevel && <span>{t("visitor.passport.next", "Próximo")}: {nextLevel.minXp} XP</span>}
            </div>
          </div>

          <h3 className="section-title" style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>{t("visitor.passport.historyTitle", "Histórico de Visitas")}</h3>

          {stats.visitedWorks.length === 0 ? (
            <p style={{ color: "#6b7280", fontStyle: "italic" }}>{t("visitor.passport.noHistory", "Você ainda não visitou nenhuma obra.")}</p>
          ) : (
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {stats.visitedWorks.map((workId, i) => (
                <div key={i} className="card" style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span style={{ fontSize: "1.5rem" }}>🖼️</span>
                  <div>
                    <p style={{ fontWeight: "bold", margin: 0 }}>{t("visitor.artwork.badge")} #{workId}</p>
                    <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>{t("visitor.passport.visited", "Visitada")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "stamps" && (
        <div>
          <h3 className="section-title" style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>{t("visitor.passport.stampsTitle", "Meus Carimbos")}</h3>
          <div className="passport-book" style={{
            background: "#fdf6e3",
            border: "1px solid #d6d3d1",
            borderRadius: "8px",
            padding: "2rem",
            minHeight: "400px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "2rem" }}>
              {stats.visitedWorks.map((workId) => (
                <div key={workId} style={{ textAlign: "center" }}>
                  <div style={{
                    width: "140px",
                    height: "140px",
                    border: "2px dashed #a8a29e",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem auto",
                    overflow: "hidden",
                    position: "relative",
                    backgroundColor: stamps[workId] ? "transparent" : "rgba(0,0,0,0.05)"
                  }}>
                    {stamps[workId] ? (
                      <img src={stamps[workId]} alt="Stamp" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8, filter: "sepia(0.5)" }} />
                    ) : (
                      generating === workId ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span className="spinner" style={{ display: 'block', width: '20px', height: '20px', border: '2px solid #666', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleGenerateStamp(workId)}
                          className="btn btn-sm"
                          style={{ fontSize: "0.8rem", padding: "0.2rem 0.5rem" }}
                        >
                          {t("visitor.passport.generate", "Gerar")}
                        </button>
                      )
                    )}
                  </div>
                  <p style={{ fontSize: "0.9rem", fontWeight: "bold", color: "#444" }}>
                    {t("visitor.artwork.badge")} #{workId}
                  </p>
                </div>
              ))}

              {stats.visitedWorks.length === 0 && (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "#666", padding: "2rem" }}>
                  <p>{t("visitor.passport.empty", "Visite obras para colecionar carimbos!")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "collection" && (
        <div>
          <h3 className="section-title" style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>{t("visitor.passport.favoritesTitle", "Meus Favoritos")}</h3>
          {favorites.length === 0 ? (
            <p style={{ color: "#6b7280", fontStyle: "italic" }}>{t("visitor.passport.noFavorites", "Sua coleção está vazia.")}</p>
          ) : (
            <div className="card-grid">
              {favorites.map((item: any) => (
                <div key={item.id} className="card" style={{ padding: "1rem" }}>
                  <h4 className="card-title">{item.title}</h4>
                  <p className="card-subtitle">{item.type === "work" ? t("visitor.sidebar.artworks") : "Item"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "journal" && (
        <div>
          <h3 className="section-title" style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>{t("visitor.passport.journalTitle", "Meu Diário de Bordo")}</h3>
          {Object.keys(JSON.parse(localStorage.getItem("visitor_notes") || "{}")).length === 0 ? (
            <p style={{ color: "#6b7280", fontStyle: "italic" }}>{t("visitor.passport.noNotes", "Seu diário de bordo está vazio. Visite obras para adicionar anotações.")}</p>
          ) : (
            <div className="card-grid">
              {Object.entries(JSON.parse(localStorage.getItem("visitor_notes") || "{}")).map(([workId, note]) => (
                <div key={workId} className="card" style={{ padding: "1rem" }}>
                  <h4 className="card-title">{t("visitor.artwork.badge")} #{workId}</h4>
                  <p style={{ whiteSpace: "pre-wrap", fontSize: "0.9rem", color: "#4b5563" }}>{note as string}</p>
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
