import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { useWorks } from "../hooks/useWorks";
import { motion, AnimatePresence } from "framer-motion";
import "./WorksList.css";

export const WorksList: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useAuth();
  const { data: works = [], isLoading: loading } = useWorks();

  if (!tenantId) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center p-8 bg-white/5 rounded-3xl backdrop-blur-xl border border-white/10">
          <p className="text-slate-400">{t("visitor.works.selectMuseum", "Selecione um museu para ver as obras.")}</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="workslist-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <header className="workslist-header flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="workslist-title">Acervo Digital</h1>
           <p className="workslist-subtitle">
             Explore uma curadoria exclusiva de obras que definem a nossa identidade cultural.
           </p>
        </div>
        
        {/* GALERY ACTIONS */}
        <div className="flex gap-2">
           <button className="h-12 w-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <Search size={20} />
           </button>
           <button className="h-12 px-6 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3 text-sm font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <SlidersHorizontal size={18} />
              Filtrar
           </button>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="workslist-skeleton-card"></div>
          ))}
        </div>
      ) : works.length === 0 ? (
        <div className="workslist-empty">
          <div className="text-6xl mb-6 opacity-30">🖼️</div>
          <h3 className="text-xl font-bold text-white mb-2">{t("visitor.works.emptyTitle", "Galeria em Curadoria")}</h3>
          <p className="text-slate-400 max-w-sm mx-auto">Em breve novas obras estarão disponíveis para sua exploração digital.</p>
        </div>
      ) : (
        <div className="workslist-grid">
          <AnimatePresence>
            {works.map((work: any) => (
              <motion.article 
                key={work.id} 
                className="workslist-card group"
                variants={itemVariants}
                whileHover={{ y: -10 }}
              >
                <div className="overflow-hidden relative">
                   {work.imageUrl ? (
                     <img
                       src={work.imageUrl}
                       alt={work.title}
                       className="workslist-card-image"
                     />
                   ) : (
                     <div className="workslist-card-placeholder">
                       <span className="opacity-20 text-4xl">🎨</span>
                     </div>
                   )}
                   <div className="absolute top-4 right-4 h-8 px-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center text-[10px] font-black uppercase tracking-widest text-white/80">
                      {work.category?.name || 'Geral'}
                   </div>
                </div>

                <div className="workslist-card-content">
                  <h2 className="workslist-card-title">{work.title}</h2>
                  <p className="workslist-card-artist">
                    {work.artist || 'Artista Desconhecido'} {work.year ? `• ${work.year}` : ''}
                  </p>
                  
                  <div className="workslist-card-meta">
                    <span className="workslist-chip">Destaque</span>
                    {work.accessible && <span className="workslist-chip">Acessível</span>}
                  </div>
                  
                  <Link to={`/obras/${work.id}`} className="workslist-card-btn group">
                    Explorar Obra
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};
