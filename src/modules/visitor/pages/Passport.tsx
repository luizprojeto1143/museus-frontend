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
  BookOpen, Star as StarIcon, Heart, History, CheckCircle2 
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
  imageUrl?: string;
  visitedAt?: string;
}

export const Passport: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { stats, currentLevel, nextLevel, progressToNextLevel, refreshGamification } = useGamification();
  const { name, email, tenantId, isGuest } = useAuth();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"progress" | "stamps" | "collection" | "journal">("progress");

  const [visitedWorks, setVisitedWorks] = useState<VisitedWork[]>([]);
  const [loadingWorks, setLoadingWorks] = useState(false);
  const [stamped, setStamped] = useState<Set<string>>(new Set());

  const fetchVisitedWorks = useCallback(async () => {
    if (!email || !tenantId) return;
    setLoadingWorks(true);
    try {
      const res = await api.get(`/visitors/me/summary?email=${email}&tenantId=${tenantId}`);
      const data = res.data;
      if (data.visits && Array.isArray(data.visits)) {
        const works = data.visits
          .filter((v: any) => v.work)
          .map((v: any) => ({
            id: v.work.id,
            title: v.work.title,
            imageUrl: v.work.imageUrl,
            visitedAt: v.createdAt
          }));
        setVisitedWorks(Array.from(new Map(works.map((w: any) => [w.id, w])).values()));
      }
    } catch (error) { console.error(error); }
    finally { setLoadingWorks(false); }
  }, [email, tenantId]);

  useEffect(() => {
    fetchVisitedWorks();
    const storedStamped = localStorage.getItem("passport_stamped_ids");
    if (storedStamped) setStamped(new Set(JSON.parse(storedStamped)));
  }, [fetchVisitedWorks]);

  const handleStamp = (workId: string) => {
    const newStamped = new Set(stamped);
    newStamped.add(workId);
    setStamped(newStamped);
    localStorage.setItem("passport_stamped_ids", JSON.stringify([...newStamped]));
  };

  const getInitials = (n: string) => n.split(" ").map(p => p[0]).join("").toUpperCase().substring(0, 2);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <motion.div 
      className="passport-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* PROFILE HEADER */}
      <div className="passport-header group">
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gold-400/5 blur-3xl rounded-full" />
        
        <div className="passport-avatar">
          {name ? getInitials(name) : "V"}
        </div>
        
        <div className="flex-1">
          <h1 className="passport-title">{name || "Viajante Cultural"}</h1>
          <p className="passport-subtitle">{email || "Visitante Anônimo"}</p>
          <div className="flex gap-4 mt-4">
             <div className="flex items-center gap-2 text-gold-400 text-xs font-black uppercase tracking-widest">
                <Award size={14} /> Explorer Premium
             </div>
             <div className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest">
                <MapPin size={14} /> Curitiba, PR
             </div>
          </div>
        </div>

        <div className="passport-actions">
          <button className="icon-btn" onClick={() => setIsEditProfileOpen(true)}>
            <Edit2 size={18} />
          </button>
          <button className="icon-btn" onClick={() => setIsSettingsOpen(true)}>
            <Settings size={18} />
          </button>
        </div>
      </div>

      {isGuest ? (
        <div className="bg-white/5 border border-dashed border-gold-400/40 rounded-[40px] p-24 text-center">
            <div className="text-6xl mb-8 opacity-20">🧭</div>
            <h2 className="text-3xl font-black text-white mb-4">Crie sua Identidade</h2>
            <p className="text-slate-400 max-w-sm mx-auto mb-12">Salve seu progresso, colecione carimbos raros e torne-se um embaixador da nossa cultura.</p>
            <Link to="/register" className="h-14 px-12 bg-gold-400 text-black rounded-2xl font-black text-base uppercase tracking-widest inline-flex items-center hover:scale-105 transition-transform">
               Começar Jornada
            </Link>
        </div>
      ) : (
        <>
          <div className="passport-tabs">
            {[
              { id: "progress", label: "Meu Progresso", icon: <History size={16} /> },
              { id: "stamps", label: "Carimbos", icon: <Award size={16} /> },
              { id: "collection", label: "Minha Coleção", icon: <Heart size={16} /> },
              { id: "journal", label: "Diário de Bordo", icon: <BookOpen size={16} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`passport-tab-btn flex items-center justify-center gap-3 ${activeTab === tab.id ? "active" : ""}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
             <motion.div 
               key={activeTab}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.3 }}
             >
                {activeTab === "progress" && (
                  <div>
                    <div className="progress-card">
                      <div className="progress-header">
                        <div>
                           <span className="level-chip mb-2 block">{t("visitor.passport.level", "Nível")} {currentLevel.level}</span>
                           <h2 className="level-title italic">{currentLevel.title}</h2>
                        </div>
                        <div className="text-right">
                           <span className="text-2xl font-black text-white">{stats.xp}</span>
                           <span className="text-slate-400 text-xs font-black uppercase ml-2 tracking-widest">XP Total</span>
                        </div>
                      </div>

                      <div className="progress-bar-container">
                        <motion.div 
                          className="progress-bar-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${progressToNextLevel}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>

                      <div className="xp-stats">
                        <span className="font-bold">{progressToNextLevel}% concluído</span>
                        {nextLevel && <span className="text-gold-400">Próximo Marco: {nextLevel.title}</span>}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                       <History className="text-gold-400" /> Histórico de Exploração
                    </h3>

                    <div className="space-y-4">
                      {visitedWorks.length === 0 ? (
                        <div className="bg-white/2 p-20 rounded-3xl text-center text-slate-500 border border-white/5 italic">Nenhuma obra explorada ainda.</div>
                      ) : (
                        visitedWorks.map((work, i) => (
                          <div key={work.id + i} className="history-item group" onClick={() => navigate(`/obras/${work.id}`)}>
                             <img src={getFullUrl(work.imageUrl) || ''} alt={work.title} className="history-img" />
                             <div className="flex-1">
                                <h4 className="font-bold text-white group-hover:text-gold-400 transition-colors uppercase text-sm tracking-wide">{work.title}</h4>
                                <div className="flex items-center gap-2 text-slate-400 text-xs mt-1">
                                   <Calendar size={12} /> {work.visitedAt ? new Date(work.visitedAt).toLocaleDateString() : 'Recentemente'}
                                </div>
                             </div>
                             <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover:bg-gold-400 group-hover:text-black transition-all">
                                <CheckCircle2 size={18} />
                             </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "stamps" && (
                  <div className="passport-book-bg">
                    <div className="passport-book-grid">
                      {visitedWorks.map((work) => (
                        <div key={work.id} className="text-center group">
                          <div className={`stamp-slot ${stamped.has(work.id) ? 'filled' : ''}`}>
                            {stamped.has(work.id) ? (
                              <motion.div 
                                className="relative w-full h-full p-2"
                                initial={{ scale: 0, rotate: -30 }}
                                animate={{ scale: 1, rotate: -5 }}
                              >
                                {work.imageUrl ? (
                                  <img src={getFullUrl(work.imageUrl)} alt={work.title} className="stamp-img" />
                                ) : (
                                  <div className="w-full h-full bg-gold-400/20 rounded-full flex items-center justify-center text-gold-400">🏛️</div>
                                )}
                                <div className="absolute -bottom-2 -right-2 bg-emerald-500 h-6 w-6 rounded-full flex items-center justify-center text-[10px] text-white">✓</div>
                              </motion.div>
                            ) : (
                              <button onClick={() => handleStamp(work.id)} className="generate-btn">
                                Validar
                              </button>
                            )}
                          </div>
                          <p className="mt-4 text-[10px] uppercase font-black tracking-widest text-slate-600 line-clamp-1 group-hover:text-gold-400 transition-colors">{work.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
             </motion.div>
          </AnimatePresence>
        </>
      )}

      <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </motion.div>
  );
};

export default Passport;
