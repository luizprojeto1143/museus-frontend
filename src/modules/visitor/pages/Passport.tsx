import { logger } from "@/utils/logger";
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { useGamification } from "../../gamification/context/GamificationContext";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";
import { EditProfileModal } from "../components/EditProfileModal";
import { SettingsModal } from "../components/SettingsModal";
import { 
  Settings, Edit2, MapPin, Calendar, Award, 
  BookOpen, Star as StarIcon, Heart, History, CheckCircle2,
  Zap, Compass, Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./Passport.css";

const getFullUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

interface VisitedWork {
  id: string;
  title: string;
  artist?: string;
  imageUrl?: string;
  visitedAt?: string;
  lat?: number;
  lng?: number;
  isRelic?: boolean;
  raridade?: string;
  numeroCaptura?: number;
  city?: string;
}

export const Passport: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { stats, currentLevel, nextLevel, progressToNextLevel, refreshGamification } = useGamification();
  const { name, email, tenantId, isGuest, userId } = useAuth();
  const visitorId = isGuest ? null : userId; // L3 Fix: Avoid guest-id string in UUID fields
  
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"exploration" | "relics" | "feats">("exploration");

  const [stamps, setStamps] = useState<VisitedWork[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPassport = useCallback(async () => {
    if (!visitorId) return;
    setLoading(true);
    try {
      const res = await api.get(`/vestiges/passport/${visitorId}`);
      const data = res.data;
      if (Array.isArray(data)) {
        setStamps(data.map((s: any) => ({
          id: s.work.id,
          title: s.work.title,
          artist: s.work.artist,
          imageUrl: s.work.vestigeImageUrl || s.work.imageUrl,
          visitedAt: s.stampedAt,
          isRelic: s.isRelic,
          raridade: s.raridade,
          numeroCaptura: s.numeroCaptura,
          city: s.work.tenant?.address?.city || s.work.tenant?.city || "Geral"
        })));
      }
    } catch (error: any) { logger.error(error); }
    finally { setLoading(false); }
  }, [visitorId]);

  useEffect(() => {
    fetchPassport();
  }, [fetchPassport]);

  const getInitials = (n: string) => n.split(" ").map(p => p[0]).join("").toUpperCase().substring(0, 2);

  const groupedStamps = stamps
    .filter(s => !s.isRelic)
    .reduce((acc: Record<string, VisitedWork[]>, stamp) => {
      const city = stamp.city || "Outros";
      if (!acc[city]) acc[city] = [];
      acc[city].push(stamp);
      return acc;
    }, {});

  const relics = stamps.filter(s => s.isRelic);

  return (
    <motion.div 
      className="passport-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* HEADER LUXO */}
      <div className="passport-header">
        <div className="profile-main">
           <div className="avatar-gold">
              {name ? getInitials(name) : "V"}
              <div className="avatar-ring" />
           </div>
           <div className="profile-info">
              <h1 className="name">{name || t('common.visitor', 'Viajante')}</h1>
              <div className="xp-badge">
                 <Zap size={12} /> {t('gamification.xpAccumulated', { xp: stats.xp })}
              </div>
           </div>
        </div>
        <div className="header-actions">
           <button onClick={() => setIsSettingsOpen(true)}><Settings size={20} /></button>
        </div>
      </div>

      <div className="passport-navigation">
         {[
           { id: "exploration", label: t('vestige.passport.exploration', 'Exploração'), icon: <Compass size={18} /> },
           { id: "relics", label: t('vestige.passport.relics', 'Relíquias'), icon: <History size={18} /> },
           { id: "feats", label: t('vestige.passport.feats', 'Conquistas'), icon: <Award size={18} /> },
         ].map(tab => (
           <button 
             key={tab.id}
             className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
             onClick={() => setActiveTab(tab.id as any)}
           >
              {tab.icon}
              <span>{tab.label}</span>
           </button>
         ))}
      </div>

      <div className="passport-content">
         <AnimatePresence mode="wait">
            {activeTab === "exploration" && (
               <motion.div key="exp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  {Object.keys(groupedStamps).length === 0 ? (
                    <div className="empty-state">
                       <MapPin size={48} />
                       <p>{t('vestige.passport.emptyVestiges', 'Nenhum vestígio capturado ainda.')}</p>
                       <Link to="/visitor/map" className="btn-explore">{t('visitor.passport.exploreMap', 'Explorar Mapa')}</Link>
                    </div>
                  ) : (
                    Object.entries(groupedStamps).map(([city, cityStamps]) => (
                      <div key={city} className="city-group">
                         <h3 className="city-title">{city}</h3>
                         <div className="stamps-grid">
                            {cityStamps.map(s => (
                               <div key={s.id} className={`stamp-card ${s.raridade?.toLowerCase()}`}>
                                  <div className="stamp-frame">
                                     <img src={getFullUrl(s.imageUrl)} alt={s.title} />
                                     <div className="rarity-dot" />
                                  </div>
                                  <div className="stamp-info">
                                     <span className="s-title">{s.title}</span>
                                     <span className="s-order">#{s.numeroCaptura}</span>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                    ))
                  )}
               </motion.div>
            )}

            {activeTab === "relics" && (
                <motion.div key="relics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                   <div className="relics-list">
                      {relics.length === 0 ? (
                        <div className="empty-state">
                           <Shield size={48} className="opacity-20" />
                           <p>{t("visitor.passport.relics_desc", "Relíquias são vestígios que não estão mais em exposição.")}</p>
                        </div>
                      ) : (
                        relics.map(r => (
                          <div key={r.id} className="relic-item">
                             <img src={getFullUrl(r.imageUrl)} alt={r.title} />
                             <div className="relic-info">
                                <h4>{r.title}</h4>
                                <p>{r.artist}</p>
                                <span className="relic-tag">{t("visitor.passport.historical_relic", "RELÍQUIA HISTÓRICA")}</span>
                             </div>
                          </div>
                        ))
                      )}
                   </div>
                </motion.div>
            )}

            {activeTab === "feats" && (
                <motion.div key="feats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                   <div className="progress-section">
                      <div className="lvl-card">
                         <span className="lvl-num">LVL {currentLevel.level}</span>
                         <h2 className="lvl-title">{currentLevel.title}</h2>
                         <div className="lvl-bar">
                            <motion.div 
                               className="active-bar" 
                               initial={{ width: 0 }} 
                               animate={{ width: `${progressToNextLevel}%` }} 
                            />
                         </div>
                         <p className="lvl-footer">{Math.round(progressToNextLevel)}% {t("visitor.passport.to_next_level", "para")} {nextLevel?.title}</p>
                      </div>
                      
                      <div className="stats-mini-grid">
                         <div className="stat-box">
                            <span className="val">{stamps.length}</span>
                            <span className="lab">{t("visitor.passport.captures", "Capturas")}</span>
                         </div>
                         <div className="stat-box">
                            <span className="val">{relics.length}</span>
                            <span className="lab">{t("visitor.passport.relics_label", "Relíquias")}</span>
                         </div>
                      </div>
                   </div>
                </motion.div>
            )}
         </AnimatePresence>
      </div>

      <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </motion.div>
  );
};

export default Passport;
