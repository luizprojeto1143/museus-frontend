import { logger } from "@/utils/logger";
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { useGamification } from "../../gamification/context/GamificationContext";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";
import { EditProfileModal } from "../components/EditProfileModal";
import { SettingsModal } from "../components/SettingsModal";
import { Settings, MapPin, Award, History, Zap, Compass, Shield, Sparkles } from "lucide-react";
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
  equipmentId?: string;
  equipmentName?: string;
  equipmentType?: string;
  equipmentImageUrl?: string;
  equipmentLogoUrl?: string;
  state?: string;
}

type PassportEquipment = {
  id?: string;
  nome?: string;
  slug?: string;
  tipo?: string;
  cidade?: string;
  estado?: string;
  fotoCapaUrl?: string | null;
  logoUrl?: string | null;
};

type PassportStamp = {
  workId?: string;
  stampedAt?: string;
  isRelic?: boolean;
  raridade?: string;
  numeroCaptura?: number;
  work?: {
    id?: string;
    title?: string;
    artist?: string;
    imageUrl?: string;
    tenant?: { address?: { city?: string }; city?: string };
    equipamentoCultural?: PassportEquipment | null;
  };
};

type PassportResponse = {
  stamps?: PassportStamp[];
  fragments?: PassportFragment[];
};

type PassportFragment = {
  id: string;
  cardId: string;
  earnedAt: string;
  collectibleCard?: {
    id: string;
    title: string;
    description?: string | null;
    imageUrl?: string | null;
    rarity?: string | null;
    xpReward?: number | null;
    work?: {
      title?: string | null;
      artist?: string | null;
      imageUrl?: string | null;
      tenant?: { city?: string | null };
      equipamentoCultural?: PassportEquipment | null;
    } | null;
  };
};

type DisplayFragment = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string;
  rarity: string;
  xpReward: number;
  workTitle?: string;
  earnedAt: string;
  equipmentId?: string;
  equipmentName?: string;
};

type PassportTab = "exploration" | "fragments" | "relics" | "feats";

export const Passport: React.FC = () => {
  const { t } = useTranslation();
  const _navigate = useNavigate();
  const { stats, currentLevel, nextLevel, progressToNextLevel, refreshGamification: _refreshGamification } = useGamification();
  const { name, email: _email, tenantId: _tenantId, isGuest, userId } = useAuth();
  const _visitorId = isGuest ? null : userId; // L3 Fix: Avoid guest-id string in UUID fields
  
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<PassportTab>("exploration");

  const [stamps, setStamps] = useState<VisitedWork[]>([]);
  const [fragments, setFragments] = useState<DisplayFragment[]>([]);
  const [_loading, setLoading] = useState(false);

  const fetchPassport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<PassportResponse>("/visitors/me/passport");
      const data = res.data?.stamps;
      if (Array.isArray(data)) {
        setStamps(data.filter((s) => s.workId || s.work?.id).map((s) => ({
          id: (s.workId || s.work?.id) as string,
          title: s.work?.title || "Obra",
          artist: s.work?.artist || "",
          imageUrl: s.work?.imageUrl || undefined,
          visitedAt: s.stampedAt,
          isRelic: s.isRelic || false,
          raridade: s.raridade || "COMMON",
          numeroCaptura: s.numeroCaptura || 0,
          city: s.work?.equipamentoCultural?.cidade || s.work?.tenant?.address?.city || s.work?.tenant?.city || "Geral",
          state: s.work?.equipamentoCultural?.estado || undefined,
          equipmentId: s.work?.equipamentoCultural?.id || "sem-equipamento",
          equipmentName: s.work?.equipamentoCultural?.nome || "Acervo Geral",
          equipmentType: s.work?.equipamentoCultural?.tipo || "Equipamento Cultural",
          equipmentImageUrl: s.work?.equipamentoCultural?.fotoCapaUrl || undefined,
          equipmentLogoUrl: s.work?.equipamentoCultural?.logoUrl || undefined
        })));
      }
      const fragmentData = res.data?.fragments;
      if (Array.isArray(fragmentData)) {
        setFragments(fragmentData.map((fragment) => {
          const card = fragment.collectibleCard;
          return {
            id: fragment.id,
            title: card?.title || "Fragmento Cultural",
            description: card?.description,
            imageUrl: card?.imageUrl || card?.work?.imageUrl || undefined,
            rarity: card?.rarity || "COMMON",
            xpReward: card?.xpReward || 0,
            workTitle: card?.work?.title || undefined,
            earnedAt: fragment.earnedAt,
            equipmentId: card?.work?.equipamentoCultural?.id || "sem-equipamento",
            equipmentName: card?.work?.equipamentoCultural?.nome || "Acervo Geral"
          };
        }));
      }
    } catch (error) { logger.error(error); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchPassport();
  }, [fetchPassport]);

  const getInitials = (n: string) => n.split(" ").map(p => p[0]).join("").toUpperCase().substring(0, 2);

  const passportPages = stamps
    .filter(s => !s.isRelic)
    .reduce((acc: Record<string, { equipmentName: string; equipmentType: string; city: string; state?: string; imageUrl?: string; logoUrl?: string; stamps: VisitedWork[]; fragments: DisplayFragment[] }>, stamp) => {
      const key = stamp.equipmentId || stamp.equipmentName || "sem-equipamento";
      if (!acc[key]) {
        acc[key] = {
          equipmentName: stamp.equipmentName || "Acervo Geral",
          equipmentType: stamp.equipmentType || "Equipamento Cultural",
          city: stamp.city || "Geral",
          state: stamp.state,
          imageUrl: stamp.equipmentImageUrl,
          logoUrl: stamp.equipmentLogoUrl,
          stamps: [],
          fragments: []
        };
      }
      acc[key].stamps.push(stamp);
      return acc;
    }, {});

  fragments.forEach((fragment) => {
    const key = fragment.equipmentId || "sem-equipamento";
    if (passportPages[key]) {
      passportPages[key].fragments.push(fragment);
    }
  });

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

      <section className="passport-cover-showcase" aria-label="Capa do Passaporte Cultural">
        <div className="passport-cover-frame">
          <img src="/assets/passaporte-cultural-cover.png" alt="Passaporte Cultural Cultura Viva" />
        </div>
        <div className="passport-cover-copy">
          <span>Documento cultural do visitante</span>
          <h2>Seu Passaporte Cultural</h2>
          <p>Carimbos, fragmentos, reliquias e conquistas reunidos em uma identidade visual unica da sua jornada.</p>
          <div className="passport-cover-stats">
            <strong>{stamps.length}</strong>
            <small>capturas</small>
            <strong>{fragments.length}</strong>
            <small>fragmentos</small>
          </div>
        </div>
      </section>

      <div className="passport-navigation">
         {[
            { id: "exploration", label: t('vestige.passport.exploration', 'Exploração'), icon: <Compass size={18} /> },
            { id: "fragments", label: "Fragmentos", icon: <Sparkles size={18} /> },
           { id: "relics", label: t('vestige.passport.relics', 'Relíquias'), icon: <History size={18} /> },
           { id: "feats", label: t('vestige.passport.feats', 'Conquistas'), icon: <Award size={18} /> },
         ].map(tab => (
           <button 
             key={tab.id}
             className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
             onClick={() => setActiveTab(tab.id as PassportTab)}
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
                  {Object.keys(passportPages).length === 0 ? (
                    <div className="empty-state">
                       <MapPin size={48} />
                       <p>{t('vestige.passport.emptyVestiges', 'Nenhum vestígio capturado ainda.')}</p>
                       <Link to="/visitor/map" className="btn-explore">{t('visitor.passport.exploreMap', 'Explorar Mapa')}</Link>
                    </div>
                  ) : (
                    Object.entries(passportPages).map(([pageId, page]) => (
                      <article key={pageId} className="passport-place-page">
                        <div className="place-page-hero">
                          {page.imageUrl ? (
                            <img src={getFullUrl(page.imageUrl)} alt={page.equipmentName} />
                          ) : (
                            <img src="/assets/passaporte-cultural-cover.png" alt="" />
                          )}
                          <div className="place-page-shade" />
                          <div className="place-page-title">
                            {page.logoUrl && <img src={getFullUrl(page.logoUrl)} alt="" />}
                            <span>{page.equipmentType}</span>
                            <h3>{page.equipmentName}</h3>
                            <p>{page.city}{page.state ? `/${page.state}` : ""}</p>
                          </div>
                        </div>

                        <div className="place-page-body">
                          <div className="place-page-summary">
                            <strong>{page.stamps.length}</strong>
                            <small>obras capturadas</small>
                            <strong>{page.fragments.length}</strong>
                            <small>fragmentos anexados</small>
                          </div>
                          <div className="stamps-grid">
                             {page.stamps.map(s => (
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
                      </article>
                    ))
                  )}
               </motion.div>
             )}

             {activeTab === "fragments" && (
                <motion.div key="fragments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                   {fragments.length === 0 ? (
                     <div className="empty-state">
                        <Sparkles size={48} />
                        <p>Nenhum fragmento anexado ao passaporte ainda.</p>
                        <Link to="/colecionaveis" className="btn-explore">Explorar Fragmentos</Link>
                     </div>
                   ) : (
                     <div className="fragments-grid">
                       {fragments.map((fragment) => (
                         <div key={fragment.id} className={`fragment-card ${fragment.rarity.toLowerCase()}`}>
                           <div className="fragment-image">
                             {fragment.imageUrl ? (
                               <img src={getFullUrl(fragment.imageUrl)} alt={fragment.title} />
                             ) : (
                               <Sparkles size={36} />
                             )}
                           </div>
                           <div className="fragment-info">
                             <span className="fragment-rarity">{fragment.rarity}</span>
                             <h3>{fragment.title}</h3>
                             {fragment.workTitle && <p>{fragment.workTitle}</p>}
                             <small>+{fragment.xpReward} XP</small>
                           </div>
                         </div>
                       ))}
                     </div>
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
                             <span className="val">{fragments.length}</span>
                             <span className="lab">Fragmentos</span>
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
