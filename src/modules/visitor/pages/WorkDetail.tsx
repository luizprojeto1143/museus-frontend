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
  const { tenantId, email, isGuest } = useAuth();
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
      api.get(`/works/${id}/related?tenantId=${tenantId}`)
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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <header className="work-header">
        <div className="flex justify-between items-start">
           <div className="flex-1">
              <span className="text-gold-400 font-black text-[10px] uppercase tracking-widest mb-4 block">
                 {work.category}
              </span>
              <h1 className="work-main-title">{work.title}</h1>
              <p className="work-meta">{work.artist} {work.year ? `• ${work.year}` : ''}</p>
              <div className="work-location">
                 <MapPin size={14} /> {work.room || 'Galeria Principal'} • {work.floor || 'Piso Térreo'}
              </div>
           </div>

           <div className="work-actions">
              <button 
                onClick={toggleFavorite} 
                className={`action-btn ${isFavorite ? 'active' : ''}`}
              >
                <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
              </button>
              <button onClick={() => setShowShare(true)} className="action-btn">
                <Share2 size={20} />
              </button>
              {work.latitude && (
                <button onClick={() => setShowNavigation(true)} className="action-btn">
                   <Compass size={20} />
                </button>
              )}
           </div>
        </div>
      </header>

      {/* TRAIL NAV */}
      {trailId && trailWorks.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-12 flex items-center justify-between">
            <button 
              onClick={() => prevWorkId && navigateToWork(prevWorkId)}
              className={`flex items-center gap-2 text-sm font-bold ${prevWorkId ? 'text-white' : 'text-white/20'}`}
              disabled={!prevWorkId}
            >
              <ChevronLeft size={20} /> Obra Anterior
            </button>
            <div className="text-center">
               <span className="block text-[10px] uppercase tracking-widest text-gold-400/60 mb-1">{trailTitle}</span>
               <span className="text-sm font-black">{currentIndex + 1} / {trailWorks.length}</span>
            </div>
            <button 
              onClick={() => nextWorkId && navigateToWork(nextWorkId)}
              className={`flex items-center gap-2 text-sm font-bold ${nextWorkId ? 'text-white' : 'text-white/20'}`}
              disabled={!nextWorkId}
            >
              Próxima Obra <ChevronRight size={20} />
            </button>
        </div>
      )}

      {treasureFound && (
        <motion.div 
          className="treasure-notification"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="flex items-center gap-4">
             <span className="text-2xl">🏴‍☠️</span>
             <div>
                <strong className="block text-sm">Tesouro Revelado!</strong>
                <span className="text-xs opacity-80">Você resolveu um enigma desta obra.</span>
             </div>
          </div>
          <span className="bg-white text-emerald-600 px-4 py-1 rounded-full text-xs font-black">+{treasureFound.xp} XP</span>
        </motion.div>
      )}

      {/* IMAGE */}
      <section className="work-image-section">
        <img src={work.imageUrl || ''} alt={work.title} className="work-main-image" />
        {work.latitude && (
          <button className="view-on-map-btn" onClick={() => navigate(`/mapa?workId=${work.id}`)}>
            <Map size={18} /> Ver Localização
          </button>
        )}
      </section>

      {/* CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
         <div className="lg:col-span-8">
            <section className="work-description-section">
               <div className="work-description-text">
                  {work.description || t("visitor.artwork.defaultDescription")}
               </div>
               <button 
                 onClick={() => isSpeaking ? cancel() : speak(work.description || '', i18n.language)}
                 className={`tts-button ${isSpeaking ? 'speaking' : 'listening'}`}
               >
                 {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
                 {isSpeaking ? 'Parar Leitura' : 'Ouvir Descrição'}
               </button>
            </section>

            {/* AI INTERACTION */}
            <section className="premium-section mt-12">
               <h2 className="flex items-center gap-3">
                  <MessageCircle className="text-gold-400" />
                  Curadoria Inteligente
               </h2>
               <p className="text-slate-400 text-sm mb-8">Nossa IA conhece cada detalhe desta obra. Pergunte sobre a técnica, o contexto histórico ou curiosidades ocultas.</p>
               <AiChatWidget workContext={{ title: work.title, artist: work.artist, description: work.description || "" }} />
            </section>
         </div>

         <div className="lg:col-span-4">
            {/* ACCESSIBILITY & AUDIO */}
            <div className="sticky top-24 space-y-8">
               <NarrativeAudioGuide audioUrl={work.audioUrl} title={work.title} artist={work.artist} />
               
               <div className="premium-section !p-8">
                  <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                     <span className="h-2 w-2 bg-emerald-500 rounded-full" />
                     Acessibilidade
                  </h3>
                  <LibrasSection videoUrl={work.librasUrl} contentTitle={work.title} />
               </div>

               {work.videoUrl && (
                  <VideoPlayer url={work.videoUrl} title="Aprofundamento em Vídeo" />
               )}
            </div>
         </div>
      </div>

      {/* RELATED */}
      {relatedWorks.length > 0 && (
        <section className="mt-24">
           <h2 className="text-2xl font-black mb-12">Obras Semelhantes</h2>
           <div className="related-grid">
              {relatedWorks.slice(0, 4).map(rw => (
                <Link to={`/obras/${rw.id}`} key={rw.id} className="related-card group">
                   <div className="overflow-hidden">
                      <img src={rw.imageUrl || ''} alt={rw.title} className="related-image group-hover:scale-105 transition-transform duration-500" />
                   </div>
                   <div className="related-content">
                      <h3 className="related-title text-white">{rw.title}</h3>
                      <p className="related-artist text-slate-400">{rw.artist}</p>
                   </div>
                </Link>
              ))}
           </div>
        </section>
      )}

      {/* NOTES */}
      <section className="mt-24">
         <WorkNote workId={work.id} />
      </section>

      {/* MODALS */}
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
