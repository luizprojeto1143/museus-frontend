import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { getFullUrl } from "../../../utils/url";
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

  const [filter, setFilter] = React.useState("all");
  const filteredWorks = filter === "all" 
    ? works 
    : works.filter((w: any) => {
        const catName = typeof w.category === 'object' ? w.category?.name : w.category;
        return catName?.toLowerCase() === filter.toLowerCase();
      });
  const categories = ["all", ...new Set(works.map((w: any) => typeof w.category === 'object' ? w.category?.name : w.category).filter(Boolean))];

  return (
    <motion.div 
      className="workslist-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <header className="workslist-header-premium">
        <span className="workslist-badge">Curadoria Digital</span>
        <h1 className="workslist-title-premium">Acervo de Relíquias</h1>
        <p className="hero-subtitle-premium">
          Explore uma jornada visual através das décadas, onde cada obra conta uma parte da nossa história sagrada.
        </p>
        
        <div className="workslist-controls">
          <div className="workslist-filter-pill">
            {categories.map((cat: any) => (
              <button 
                key={cat}
                onClick={() => setFilter(cat)}
                className={`filter-btn ${filter === cat ? 'active' : ''}`}
              >
                {cat === 'all' ? 'Tudo' : cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-20">
           <div className="splash-loader-fill h-1 w-full max-w-md mx-auto"></div>
        </div>
      ) : filteredWorks.length === 0 ? (
        <div className="workslist-empty py-40">
          <div className="text-6xl mb-6 opacity-30">🖼️</div>
          <h3 className="text-2xl font-fd text-white mb-2">Vazio Silencioso</h3>
          <p className="text-muted max-w-sm mx-auto">Nenhuma obra encontrada nesta categoria no momento.</p>
        </div>
      ) : (
        <div className="workslist-grid-premium">
          <AnimatePresence mode="popLayout">
            {filteredWorks.map((work: any) => (
              <motion.div
                key={work.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
              >
                <Link to={`/obras/${work.id}`} className="work-card-premium">
                  <div className="work-visual-premium">
                    <img
                      src={getFullUrl(work.imageUrl)}
                      alt={work.title}
                      className="work-img-premium"
                    />
                    <div className="work-category-tag">
                      {work.category?.name || 'Geral'}
                    </div>
                  </div>

                  <div className="work-content-premium">
                    <span className="work-artist-premium">{work.artist || 'Artista Desconhecido'}</span>
                    <h2 className="work-title-premium">{work.title}</h2>
                    <div className="work-footer-premium">
                       <span className="work-explore-btn">
                          Explorar Detalhes <ArrowRight size={14} />
                       </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};
