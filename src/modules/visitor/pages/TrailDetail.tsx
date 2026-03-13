import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { NarrativeAudioGuide } from "../components/NarrativeAudioGuide";
import { VideoPlayer } from "../../../components/common/VideoPlayer";
import { getFullUrl } from "../../../utils/url";
import { Heart, Clock, List, Share2, ChevronRight } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { motion } from "framer-motion";
import "./Trails.css";

type TrailDetailData = {
  id: string;
  name: string;
  title?: string;
  description?: string;
  duration?: string;
  audioUrl?: string | null;
  videoUrl?: string | null;
  works: { id: string; title: string }[];
};

export const TrailDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { isGuest } = useAuth();

  const [apiTrail, setApiTrail] = useState<TrailDetailData | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [apiLoading, setApiLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id || isGuest) return;
    api.get(`/favorites/check?type=trail&id=${id}`)
      .then(res => setIsFavorite(res.data.isFavorite))
      .catch(err => console.error("Error checking favorite status", err));
  }, [id, isGuest]);

  useEffect(() => {
    if (!id) return;
    setApiLoading(true);
    api.get(`/trails/${id}`)
      .then((res) => {
        const t = res.data;
        const works = Array.isArray(t.works) ? t.works.map((tw: any) => ({
          id: tw.work?.id ?? tw.id,
          title: tw.work?.title ?? tw.title ?? "Obra da trilha"
        })) : [];

        setApiTrail({
          id: t.id,
          name: t.title || t.name,
          title: t.title || t.name,
          description: t.description ?? "",
          duration: t.durationLabel || t.duration || "45 min",
          audioUrl: getFullUrl(t.audioUrl),
          videoUrl: getFullUrl(t.videoUrl),
          works
        });
      })
      .catch(() => setError(true))
      .finally(() => setApiLoading(false));
  }, [id]);

  const toggleFavorite = async () => {
    if (isGuest) return;
    try {
      if (isFavorite) {
        await api.delete(`/favorites/trail/${id}`);
        setIsFavorite(false);
      } else {
        await api.post('/favorites', { type: "trail", itemId: id });
        setIsFavorite(true);
      }
    } catch (err) { console.error(err); }
  };

  if (apiLoading) return (
    <div className="flex justify-center p-40">
       <div className="splash-loader-fill h-1 w-40"></div>
    </div>
  );

  if (error || !apiTrail) return (
    <div className="work-error">
      <h1 className="font-fd text-4xl mb-6">Jornada Extraviada</h1>
      <button className="gallery-cta" onClick={() => window.history.back()}>Retornar às Trilhas</button>
    </div>
  );

  return (
    <motion.div 
      className="work-detail-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <header className="work-header-premium">
        <span className="work-badge-premium">Jornada Cultural</span>
        <h1 className="work-title-premium">{apiTrail.name}</h1>
        <div className="work-meta-premium">
           <div className="flex items-center gap-2"><Clock size={16} className="text-gold" /> {apiTrail.duration}</div>
           <div className="flex items-center gap-2"><List size={16} className="text-gold" /> {apiTrail.works.length} Estações</div>
        </div>
        
        <div className="work-actions-premium">
           <button 
             onClick={toggleFavorite} 
             className={`action-btn-premium ${isFavorite ? 'active' : ''}`}
           >
             <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
           </button>
           <button className="action-btn-premium">
             <Share2 size={18} />
           </button>
        </div>
      </header>

      <div className="work-editorial-content">
         <main className="work-body-premium">
            <div className="mb-12">
               <h2 className="text-sm font-fm uppercase text-gold mb-4">Sobre esta Experiência</h2>
               {apiTrail.description}
            </div>

            <section className="mt-20">
               <h2 className="text-2xl font-fd text-white mb-8">Estações da Jornada</h2>
               <div className="ranking-list-premium">
                  {apiTrail.works.map((w, idx) => (
                    <Link to={`/obras/${w.id}?trailId=${id}`} key={w.id} className="ranking-row-premium !grid-cols-[50px_1fr_40px] hover:border-gold transition-colors">
                       <span className="ranking-pos-premium !text-gold">0{idx + 1}</span>
                       <span className="ranking-name-premium">{w.title}</span>
                       <ChevronRight className="text-muted" size={16} />
                    </Link>
                  ))}
               </div>
            </section>
         </main>

         <aside className="work-sidebar-premium">
            <div className="sidebar-card-premium">
               <span className="sidebar-label-premium">Audioguia da Trilha</span>
               <NarrativeAudioGuide audioUrl={apiTrail.audioUrl} title={apiTrail.name} />
            </div>

            {apiTrail.videoUrl && (
               <div className="sidebar-card-premium">
                  <span className="sidebar-label-premium">Introdução Visual</span>
                  <VideoPlayer url={apiTrail.videoUrl} title="Apresentação" />
               </div>
            )}
            
            <button 
              className="gallery-cta w-full"
              onClick={() => window.location.href = `/obras/${apiTrail.works[0].id}?trailId=${id}`}
            >
              Iniciar Jornada
            </button>
         </aside>
      </div>
    </motion.div>
  );
};
