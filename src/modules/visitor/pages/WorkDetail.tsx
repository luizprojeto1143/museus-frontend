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
  ChevronRight, MapPin, Map, MessageCircle, Heart, Sparkles 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Badge, Button, MagneticButton, Card, AnimateIn, PageLoader, ModelViewer } from "@/components/ui";
import { pageVariants, staggerContainer, staggerItem } from "@/lib/motion";
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
  modelUrl?: string | null;
  latitude?: number;
  longitude?: number;
  collectibleCards?: any[];
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
          modelUrl: getFullUrl(w.modelUrl),
          latitude: w.latitude,
          longitude: w.longitude,
          collectibleCards: w.collectibleCards || []
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

  if (loading) return <PageLoader message="Preparando curadoria..." />;

  if (error || !work) return (
    <div className="work-error">
      <h1>Obra não encontrada</h1>
      <Link to="/obras" className="back-btn">Explorar Galeria</Link>
    </div>
  );

  return (
    <motion.div 
      className="work-detail-container"
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      role="main"
      aria-busy={loading}
    >
      <Helmet>
        <title>{work.title} | {work.artist} | Cultura Viva</title>
        <meta name="description" content={work.description?.substring(0, 160) || `Explore a obra ${work.title} de ${work.artist} no portal Cultura Viva.`} />
        <meta property="og:title" content={`${work.title} - ${work.artist}`} />
        <meta property="og:image" content={work.imageUrl || ""} />
        <meta property="og:type" content="article" />
      </Helmet>

      <header className="work-header-premium">
        <Badge variant="glass" size="lg" className="mb-6">{work.category || 'Obra de Arte'}</Badge>
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

      {/* Hero Image / 3D Model */}
      <section className="work-visual-section-premium relative">
        {work.modelUrl ? (
          <ModelViewer url={work.modelUrl} className="w-full h-[60vh] min-h-[400px] object-cover rounded-2xl overflow-hidden bg-black/50" />
        ) : (
          <img src={work.imageUrl || ''} alt={work.title} className="work-hero-img-premium" />
        )}
        
        {work.latitude && (
          <button className="gallery-cta !absolute bottom-8 right-8 z-10" onClick={() => navigate(`/mapa?workId=${work.id}`)}>
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
               <Button 
                 variant="glass"
                 size="sm"
                 onClick={() => prevWorkId && navigateToWork(prevWorkId)}
                 className={`${prevWorkId ? '' : 'opacity-20 pointer-events-none'}`}
                 disabled={!prevWorkId}
                 leftIcon={<ChevronLeft size={16} />}
               >
                 Anterior
               </Button>
               <div className="text-center">
                  <span className="text-[10px] font-fm uppercase text-gold block">{trailTitle}</span>
                  <span className="text-lg font-fd">{currentIndex + 1} <small className="opacity-40">de</small> {trailWorks.length}</span>
               </div>
               <Button 
                 variant="glass"
                 size="sm"
                 onClick={() => nextWorkId && navigateToWork(nextWorkId)}
                 className={`${nextWorkId ? '' : 'opacity-20 pointer-events-none'}`}
                 disabled={!nextWorkId}
                 rightIcon={<ChevronRight size={16} />}
               >
                 Próxima
               </Button>
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
            {work.collectibleCards && work.collectibleCards.length > 0 && (
                <div className="sidebar-card-premium !bg-gold/5 !border-gold/20">
                   <div className="flex items-center gap-2 mb-2">
                       <Sparkles size={14} className="text-gold" />
                       <span className="sidebar-label-premium !text-gold !mb-0">Card Colecionável</span>
                   </div>
                   {work.collectibleCards.map((card: any) => (
                       <div key={card.id} className="mt-4 p-4 rounded-xl bg-black/40 border border-white/5 text-center">
                           <div className="w-20 h-24 mx-auto mb-3 rounded-lg overflow-hidden border-2 border-gold/30">
                               <img src={getFullUrl(card.imageUrl || work.imageUrl)} alt={card.title} className="w-full h-full object-cover" />
                           </div>
                           <h4 className="text-white text-xs font-black uppercase tracking-widest">{card.title}</h4>
                           <div className="flex items-center justify-center gap-2 mt-2">
                               <span className="text-[8px] font-black text-gold bg-gold/10 px-2 py-0.5 rounded uppercase">{card.rarity}</span>
                               <span className="text-[8px] font-black text-white/40 uppercase">+{card.xpReward} XP</span>
                           </div>
                           <p className="text-[9px] text-muted mt-3 leading-relaxed">Escanei o QR Code desta obra para adicionar este card ao seu Grimório!</p>
                       </div>
                   ))}
                </div>
            )}

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
