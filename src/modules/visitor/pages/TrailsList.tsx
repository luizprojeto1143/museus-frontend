import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { ArrowRight, Compass, Clock, Image as ImageIcon, Map as MapIcon } from "lucide-react";
import { SmartRouteGenerator } from "../components/SmartRouteGenerator";
import { motion } from "framer-motion";
import "./Trails.css";

export const TrailsList: React.FC = () => {
  const { t } = useTranslation();
  
  type TrailItem = {
    id: string;
    name: string;
    description?: string;
    duration?: string;
    worksCount?: number;
    type?: string;
  };

  const [trails, setTrails] = useState<TrailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { tenantId } = useAuth();

  useEffect(() => {
    if (!tenantId) return;

    let mounted = true;
    setLoading(true);

    api.get("/trails", { params: { tenantId } })
      .then((res) => {
        if (!mounted) return;
        const apiTrails = (res.data as any[]).map((t) => ({
          id: t.id,
          name: t.title,
          description: t.description,
          duration: t.duration ? `${t.duration} min` : undefined,
          worksCount: Array.isArray(t.workIds) ? t.workIds.length : 0,
          type: "Trilha"
        }));
        setTrails(apiTrails);
      })
      .catch(console.error)
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [tenantId]);

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
      className="trails-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <header className="trails-header flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="trails-header-title italic">Jornadas Curadas</h1>
           <p className="trails-header-subtitle">
             Siga caminhos temáticos desenhados por especialistas para uma compreensão profunda do acervo.
           </p>
        </div>
        
        <div className="flex gap-2">
           <Link to="/mapa" className="h-12 px-6 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3 text-sm font-bold text-slate-400 hover:text-white transition-all">
              <MapIcon size={18} />
              Ver no Mapa
           </Link>
        </div>
      </header>

      {/* SMART GENERATOR - PREMIUM INTEGRATION */}
      <section className="mb-16">
         <SmartRouteGenerator />
      </section>

      <section>
        <div className="flex items-center gap-4 mb-8">
           <div className="h-px flex-1 bg-white/10" />
           <span className="text-[10px] uppercase font-black tracking-widest text-gold-400/60">Trilhas Oficiais</span>
           <div className="h-px flex-1 bg-white/10" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="trails-skeleton-card" />)}
          </div>
        ) : trails.length > 0 ? (
          <div className="trails-grid">
            {trails.map(trail => (
              <motion.article 
                key={trail.id} 
                className="trail-card group"
                variants={itemVariants}
                whileHover={{ y: -8 }}
              >
                <div className="absolute -top-4 -right-4 h-24 w-24 bg-gold-400/5 rounded-full blur-2xl group-hover:bg-gold-400/10 transition-colors" />
                
                <h2 className="trail-card-title">{trail.name}</h2>
                <p className="trail-card-description line-clamp-3">
                  {trail.description || "Inicie esta jornada para descobrir as histórias ocultas por trás do nosso acervo."}
                </p>
                
                <div className="trail-card-meta">
                  <span className="trail-chip"><Clock size={12} /> {trail.duration || "Livre"}</span>
                  <span className="trail-chip"><ImageIcon size={12} /> {trail.worksCount} Obras</span>
                </div>
                
                <Link to={`/trilhas/${trail.id}`} className="trail-card-btn group">
                  Iniciar Experiência
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="trails-empty">
            <span className="trails-empty-icon">🧭</span>
            <h3 className="text-xl font-bold text-white mb-2">Novas Trilhas em Breve</h3>
            <p className="text-slate-400 max-w-sm mx-auto mb-8">Nossa curadoria está preparando novas experiências guiadas para você.</p>
            <Link to="/obras" className="h-12 px-8 bg-gold-400 text-black rounded-xl font-black text-xs uppercase tracking-widest inline-flex items-center gap-3 hover:scale-105 transition-transform">
              <Compass size={18} />
              Explorar Obras
            </Link>
          </div>
        )}
      </section>
    </motion.div>
  );
};
