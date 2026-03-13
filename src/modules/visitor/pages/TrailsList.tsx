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
  const { tenantId, equipamentoId } = useAuth();

  useEffect(() => {
    if (!tenantId) return;

    let mounted = true;
    setLoading(true);

    api.get("/trails", { params: { tenantId, equipamentoId } })
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
  }, [tenantId, equipamentoId]);

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
      <header className="trails-header-premium">
        <span className="trails-badge">Expedições Guiadas</span>
        <h1 className="trails-title-premium">Jornadas Culturais</h1>
        <p className="hero-subtitle-premium">
          Siga caminhos temáticos desenhados por especialistas para uma compreensão profunda e transcendente do nosso acervo.
        </p>
      </header>

      {/* SMART GENERATOR - PREMIUM INTEGRATION */}
      <section className="mb-10">
         <SmartRouteGenerator />
      </section>

      <section>
        <div className="flex items-center gap-4 mb-12">
           <div className="h-px flex-1 bg-white/5" />
           <span className="text-[10px] uppercase font-mono tracking-widest text-gold-hi/40">Roteiros Oficiais</span>
           <div className="h-px flex-1 bg-white/5" />
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
             <div className="splash-loader-fill h-1 w-40"></div>
          </div>
        ) : trails.length > 0 ? (
          <div className="trails-grid-premium">
            {trails.map(trail => (
              <motion.div
                key={trail.id}
                variants={itemVariants}
              >
                <Link to={`/trilhas/${trail.id}`} className="trail-card-premium group">
                  <div className="trail-icon-premium">🧭</div>
                  
                  <div className="trail-info-premium">
                    <h2 className="trail-title-premium">{trail.name}</h2>
                    <p className="trail-desc-premium line-clamp-3">
                      {trail.description || "Inicie esta jornada para descobrir as histórias ocultas por trás do nosso acervo."}
                    </p>
                  </div>
                  
                  <div className="trail-meta-premium">
                    <div className="trail-meta-item">
                      <Clock size={12} /> {trail.duration || "Livre"}
                    </div>
                    <div className="trail-meta-item">
                      <ImageIcon size={12} /> {trail.worksCount} Obras
                    </div>
                  </div>
                  
                  <div className="trail-action-premium">
                    Iniciar Experiência <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="workslist-empty py-40">
            <span className="text-6xl mb-6 opacity-30">🧭</span>
            <h3 className="text-2xl font-fd text-white mb-4">Horizonte Vazio</h3>
            <p className="text-muted max-w-sm mx-auto mb-10">Nossa curadoria está preparando novas experiências guiadas para você.</p>
            <Link to="/obras" className="gallery-cta !justify-center">
              Explorar Obras <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </section>
    </motion.div>
  );
};
