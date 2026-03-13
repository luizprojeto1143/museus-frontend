import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";
import { LibrasSection } from "../../../components/accessibility/LibrasPlayer";
import { NarrativeAudioGuide } from "../components/NarrativeAudioGuide";
import { VideoPlayer } from "../../../components/common/VideoPlayer";
import { useTTS } from "../../../hooks/useTTS";
import { useTranslation } from "react-i18next";
import { getFullUrl } from "../../../utils/url";
import { useGamification } from "../../gamification/context/GamificationContext";
import { WorkNote } from "../components/WorkNote";
import { ShareCard } from "../components/ShareCard";
import { AiChatWidget } from "../components/AiChatWidget";
import { NavigationModal } from "../../../components/navigation/NavigationModal";
import { useTerminology } from "../../../hooks/useTerminology";
import { 
  Compass, Share2, Star, Volume2, VolumeX, ChevronLeft, 
  ChevronRight, MapPin, Map, MessageCircle, Heart 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./WorkDetail.css";

type WorkDetailData = {
  id: string;
  title: string;
  artist: string;
  year?: string;
  category?: string;
  description?: string;
  room?: string;
  floor?: string;
  imageUrl?: string | null;
  audioUrl?: string | null;
  librasUrl?: string | null;
  videoUrl?: string | null;
  latitude?: number;
  longitude?: number;
};

export const WorkDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tenantId, equipamentoId, email, isGuest } = useAuth();
  const { t, i18n } = useTranslation();

  const [relatedWorks, setRelatedWorks] = useState<WorkDetailData[]>([]);
  const [work, setWork] = useState<WorkDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const { speak, cancel, isSpeaking } = useTTS();
  const terms = useTerminology();
  const [searchParams] = useSearchParams();
  const trailId = searchParams.get("trailId");
  const [trailWorks, setTrailWorks] = useState<string[]>([]);
  const [trailTitle, setTrailTitle] = useState("");

  const { visitWork, addXp } = useGamification();
  const [treasureFound, setTreasureFound] = useState<{ found: boolean; xp: number } | null>(null);

  useEffect(() => {
    if (trailId) {
      api.get(`/trails/${trailId}`)
        .then(res => {
          if (res.data.works) {
            setTrailWorks(res.data.works.map((w: { id: string }) => w.id));
            setTrailTitle(res.data.title);
          }
        })
        .catch(console.error);
    }
  }, [trailId]);

  const currentIndex = trailWorks.indexOf(id || "");
  const prevWorkId = currentIndex > 0 ? trailWorks[currentIndex - 1] : null;
  const nextWorkId = currentIndex >= 0 && currentIndex < trailWorks.length - 1 ? trailWorks[currentIndex + 1] : null;

  const navigateToWork = (targetId: string) => {
    navigate(`/obras/${targetId}?trailId=${trailId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    
    api.get(`/works/${id}`)
      .then((res) => {
        const w = res.data;
        const mapped: WorkDetailData = {
          id: w.id,
          title: w.title,
          artist: w.artist ?? "Artista desconhecido",
          year: w.year ?? "",
          category: w.category?.name ?? w.category ?? "",
          description: w.description ?? "",
          room: w.room ?? "",
          floor: w.floor ?? "",
          imageUrl: getFullUrl(w.imageUrl),
          audioUrl: getFullUrl(w.audioUrl),
          librasUrl: getFullUrl(w.librasUrl),
          videoUrl: getFullUrl(w.videoUrl),
          latitude: w.latitude,
          longitude: w.longitude
        };
        setWork(mapped);
        
        // Gamification visit
        visitWork(w.id);

        // Treasure logic
        const clues = JSON.parse(localStorage.getItem("treasure_clues") || "[]");
        const solved = JSON.parse(localStorage.getItem("treasure_solved") || "[]");
        const matchedClue = clues.find((c: any) => c.isActive && c.targetWorkId === w.id && !solved.includes(c.id));
        if (matchedClue) {
          solved.push(matchedClue.id);
          localStorage.setItem("treasure_solved", JSON.stringify(solved));
          addXp(matchedClue.xpReward);
          setTreasureFound({ found: true, xp: matchedClue.xpReward });
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));

    if (!isGuest) {
      api.get(`/favorites/check?type=work&id=${id}`)
        .then(res => setIsFavorite(res.data.isFavorite))
        .catch(console.error);
    }
  }, [id, tenantId, isGuest, visitWork, addXp]);

  useEffect(() => {
    if (tenantId && id) {
      api.get(`/works/${id}/related?tenantId=${tenantId}&equipamentoId=${equipamentoId}`)
        .then((res) => {
          const works = Array.isArray(res.data) ? res.data : [];
          setRelatedWorks(works.map((w: any) => ({
             ...w,
             imageUrl: getFullUrl(w.imageUrl)
          })));
        })
        .catch(console.error);
    }
  }, [tenantId, id]);

  const toggleFavorite = async () => {
    if (isGuest) return;
    try {
      if (isFavorite) {
        await api.delete(`/favorites/work/${id}`);
        setIsFavorite(false);
      } else {
        await api.post('/favorites', { type: "work", itemId: id });
        setIsFavorite(true);
      }
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="work-loading"><div className="work-spinner" /></div>;

  if (error || !work) return (
    <div className="work-error">
      <h1>Obra não encontrada</h1>
      <Link to="/obras" className="back-btn">Explorar Galeria</Link>
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
        <span className="work-badge-premium">{work.category || 'Obra de Arte'}</span>
        <h1 className="work-title-premium">{work.title}</h1>
        <div className="work-meta-premium">
           <span className="text-gold-hi">{work.artist}</span>
           {work.year && <span className="opacity-40">• {work.year}</span>}
        </div>
        
        <div className="flex items-center gap-6 mt-4">
           <div className="flex items-center gap-2 text-[10px] font-fm uppercase text-muted">
              <MapPin size={12} className="text-gold" />
              {work.room || 'Auditório'} • {work.floor || 'Térreo'}
           </div>
           
           <div className="work-actions-premium !mt-0">
              <button 
                onClick={toggleFavorite} 
                className={`action-btn-premium ${isFavorite ? 'active' : ''}`}
              >
                <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
              </button>
              <button onClick={() => setShowShare(true)} className="action-btn-premium">
                <Share2 size={18} />
              </button>
           </div>
        </div>
      </header>

      {/* Hero Image */}
      <section className="work-visual-section-premium">
        <img src={work.imageUrl || ''} alt={work.title} className="work-hero-img-premium" />
        {work.latitude && (
          <button className="gallery-cta !absolute bottom-8 right-8" onClick={() => navigate(`/mapa?workId=${work.id}`)}>
            <Map size={16} /> Ver no Mapa
          </button>
        )}
      </section>

      {treasureFound && (
        <motion.div 
          className="treasure-notification"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex items-center gap-4">
             <span className="text-2xl">✨</span>
             <div className="flex flex-col">
                <strong className="text-sm font-fd text-white">Relíquia Descoberta</strong>
                <span className="text-[10px] font-fm uppercase text-gold">+{treasureFound.xp} XP de Legado</span>
             </div>
          </div>
        </motion.div>
      )}

      {/* Trail Navigation */}
      {trailId && trailWorks.length > 0 && (
        <div className="progress-section-premium">
            <div className="flex justify-between items-center mb-4">
               <button 
                 onClick={() => prevWorkId && navigateToWork(prevWorkId)}
                 className={`action-btn-premium !rounded-xl !w-auto !px-4 gap-2 ${prevWorkId ? '' : 'opacity-20'}`}
                 disabled={!prevWorkId}
               >
                 <ChevronLeft size={16} /> <span className="text-[10px] font-fm uppercase">Anterior</span>
               </button>
               <div className="text-center">
                  <span className="text-[10px] font-fm uppercase text-gold block">{trailTitle}</span>
                  <span className="text-lg font-fd">{currentIndex + 1} <small className="opacity-40">de</small> {trailWorks.length}</span>
               </div>
               <button 
                 onClick={() => nextWorkId && navigateToWork(nextWorkId)}
                 className={`action-btn-premium !rounded-xl !w-auto !px-4 gap-2 ${nextWorkId ? '' : 'opacity-20'}`}
                 disabled={!nextWorkId}
               >
                 <span className="text-[10px] font-fm uppercase">Próxima</span> <ChevronRight size={16} />
               </button>
            </div>
        </div>
      )}

      {/* Editorial Content */}
      <div className="work-editorial-content">
         <main className="work-body-premium">
            <div className="mb-12">
               {work.description || t("visitor.artwork.defaultDescription")}
            </div>

            <button 
              onClick={() => isSpeaking ? cancel() : speak(work.description || '', i18n.language)}
              className="gallery-cta !w-auto !px-8"
            >
              {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
              {isSpeaking ? 'Silenciar Curadoria' : 'Ouvir Curadoria'}
            </button>

            {/* AI Widget */}
            <div className="mt-20 border-t border-border pt-20">
               <div className="flex items-center gap-3 mb-6">
                  <MessageCircle className="text-gold" />
                  <h2 className="text-2xl font-fd text-white">Diálogo com o Acervo</h2>
               </div>
               <p className="text-muted text-sm mb-10">Dúvidas sobre a técnica ou simbolismo? Nossa IA está pronta para aprofundar seu conhecimento sobre esta obra.</p>
               <AiChatWidget workContext={{ title: work.title, artist: work.artist, description: work.description || "" }} />
            </div>
         </main>

         <aside className="work-sidebar-premium">
            <div className="sidebar-card-premium">
               <span className="sidebar-label-premium">Audioguia Imersivo</span>
               <NarrativeAudioGuide audioUrl={work.audioUrl} title={work.title} artist={work.artist} />
            </div>

            <div className="sidebar-card-premium">
               <span className="sidebar-label-premium">Acessibilidade Estrita</span>
               <LibrasSection videoUrl={work.librasUrl} contentTitle={work.title} />
            </div>

            {work.videoUrl && (
               <div className="sidebar-card-premium">
                  <span className="sidebar-label-premium">Multimídia</span>
                  <VideoPlayer url={work.videoUrl} title="Documentário" />
               </div>
            )}
         </aside>
      </div>

      {/* Related Works */}
      {relatedWorks.length > 0 && (
        <section className="related-section-premium">
           <span className="sidebar-label-premium">Obras de Ressonância</span>
           <div className="related-grid-premium">
              {relatedWorks.slice(0, 4).map(rw => (
                <Link to={`/obras/${rw.id}`} key={rw.id} className="related-card-premium group">
                   <div className="overflow-hidden aspect-square">
                      <img src={rw.imageUrl || ''} alt={rw.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   </div>
                   <div className="p-4">
                      <h3 className="font-fd text-white text-sm line-clamp-1">{rw.title}</h3>
                      <p className="text-[10px] font-fm uppercase text-muted line-clamp-1">{rw.artist}</p>
                   </div>
                </Link>
              ))}
           </div>
        </section>
      )}

      {/* Notes Section */}
      <section className="border-t border-border pt-20">
         <WorkNote workId={work.id} />
      </section>

      {/* Modals */}
      <AnimatePresence>
         {showShare && (
           <ShareCard 
             work={{ title: work.title, artist: work.artist, imageUrl: work.imageUrl || null }} 
             onClose={() => setShowShare(false)} 
           />
         )}
      </AnimatePresence>
      
      {showNavigation && work.latitude && work.longitude && (
        <NavigationModal 
          isOpen={showNavigation} 
          onClose={() => setShowNavigation(false)} 
          destination={{ lat: work.latitude, lng: work.longitude, name: work.title }}
        />
      )}
    </motion.div>
  );
};
