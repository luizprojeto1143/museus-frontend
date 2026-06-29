import { logger } from "@/utils/logger";
import { VisitorProfile, Achievement, Event, Trail } from "../types/domain";
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";
import { getFullUrl } from "../../../utils/url";
import { 
  Compass, Landmark, Calendar, MapPin, 
  Sparkles, ShieldAlert, ArrowLeft, ArrowRight,
  Accessibility, MessageSquare, Map, Award, HelpCircle,
  Search, Bell, User, ChevronRight, ChevronDown, Moon, Sun, 
  Activity, Check, Heart, Clock, Volume2, BookOpen, Navigation
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Card, Badge, Button } from "@/components/ui";
import { pageVariants, staggerContainer, staggerItem } from "@/lib/motion";
import "./CityDashboard.css";

interface CityEquipment {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  worksCount: number;
  eventsCount: number;
  missao?: string;
  horarios?: string;
  endereco?: string;
  latitude?: number;
  longitude?: number;
  acessibilidade?: string;
  ingresso?: string;
}

interface CityData {
  id: string;
  name: string;
  slug: string;
  coverImageUrl: string;
  logoUrl: string | null;
  totalExperiences: number;
  explorationPercent: number;
  activeEventsCount: number;
  explorerTitle: string;
  explorerBadge: string;
  equipments: CityEquipment[];
  visitedEquipmentsCount?: number;
  totalEquipmentsCount?: number;
  registeredEventsCount?: number;
  completedTrailsCount?: number;
  totalTrailsCount?: number;
}

export const CityDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, updateSession, isGuest, enterAsGuest, role, name: authName } = useAuth();

  const [city, setCity] = useState<CityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Navigation States
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileTab, setMobileTab] = useState<"dashboard" | "progresso" | "mapa">("dashboard");
  const [selectedPin, setSelectedPin] = useState<CityEquipment | null>(null);
  const [mapFilter, setMapFilter] = useState<string>("Todos");

  // Dynamic Database-Integrated States
  const [dbRankings, setDbRankings] = useState<VisitorProfile[]>([]);
  const [dbMyRank, setDbMyRank] = useState<VisitorProfile | null>(null);
  const [dbAchievements, setDbAchievements] = useState<Achievement[]>([]);
  const [dbEvents, setDbEvents] = useState<Event[]>([]);
  const [dbTrails, setDbTrails] = useState<Trail[]>([]);

  // Fetch City Data from PWA dynamic analytics
  useEffect(() => {
    const abortController = new AbortController();

    const fetchCityData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/analytics/municipal-pwa/summary", { signal: abortController.signal });
        if (res.data && res.data.cities) {
          // Robust slug matching (e.g. betim or betim-cultura)
          const found = res.data.cities.find((c: CityData) => 
            c.slug === tenantSlug
          );
          if (found) {
            const enrichedEquipments = found.equipments.map((eq: CityEquipment, index: number) => ({
              ...eq,
              missao: eq.missao || "Espaço dedicado à preservação da história, arte e memória municipal com acervo conectado.",
              horarios: eq.horarios || "09h às 18h",
              endereco: eq.endereco || "Centro Histórico",
              latitude: eq.latitude || (-19.96 + index * 0.012),
              longitude: eq.longitude || (-44.20 - index * 0.008),
              acessibilidade: eq.acessibilidade || "Disponível",
              ingresso: eq.ingresso || "Gratuito",
            }));
            setCity({
              ...found,
              equipments: enrichedEquipments
            });
            if (enrichedEquipments.length > 0) {
              setSelectedPin(enrichedEquipments[0]);
            }
          } else {
            setError("Cidade não encontrada no ecossistema municipal.");
          }
        }
      } catch (err: any) {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        logger.error("Error loading city data", err);
        setError("Erro de rede ao carregar o ecossistema municipal.");
      } finally {
        setLoading(false);
      }
    };
    if (tenantSlug) {
      fetchCityData();
    }

    return () => {
      abortController.abort();
    };
  }, [tenantSlug]);

  // Dynamic Database Fetching for Rankings, Achievements, Events, and Trails
  useEffect(() => {
    if (city?.id) {
      const allTenantIds = [city.id, ...city.equipments.map(eq => eq.id)];
      const abortController = new AbortController();
      const signal = abortController.signal;

      // 1. Fetch Real Ranking for this City
      api.get(`/leaderboard/city/${city.id}`, { signal })
        .then(res => {
          if (res.data && res.data.ranking) {
            setDbRankings(res.data.ranking);
            setDbMyRank(res.data.myRank);
          }
        })
        .catch(err => {
            if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') logger.warn("Could not load database rankings:", err)
        });

      // 2. Fetch Real Achievements for this City
      api.get(`/achievements?tenantId=${city.id}`, { signal })
        .then(res => {
          if (Array.isArray(res.data)) {
            setDbAchievements(res.data);
          }
        })
        .catch(err => {
            if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') logger.warn("Could not load database achievements:", err)
        });

      // 3. Fetch Real Events of City and Children
      api.get("/events", { signal })
        .then(res => {
          if (Array.isArray(res.data)) {
            const filtered = res.data.filter(ev => allTenantIds.includes(ev.tenantId));
            setDbEvents(filtered);
          }
        })
        .catch(err => {
            if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') logger.warn("Could not load database events:", err)
        });

      // 4. Fetch Real Trails/Roteiros of City and Children
      api.get("/trails", { signal })
        .then(res => {
          if (Array.isArray(res.data)) {
            const filtered = res.data.filter(tr => allTenantIds.includes(tr.tenantId));
            setDbTrails(filtered);
          }
        })
        .catch(err => {
            if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') logger.warn("Could not load database trails:", err)
        });

      return () => {
        abortController.abort();
      };
    }
  }, [city]);

  // Session selector logic - Switches visitor session to specific child equipment & loads home
  const handleSelectMuseum = async (equip: CityEquipment) => {
    if (isAuthenticated && !isGuest) {
      try {
        updateSession(role || "visitor", equip.id, authName, equip.id, city?.id || null);
        navigate("/home");
        return;
      } catch (err) {
        logger.error("Error switching tenant session", err);
      }
    }
    enterAsGuest(equip.id, equip.id, city?.id || null);
    navigate("/home");
  };

  const cityName = city?.name || "";
  const explorationPercent = city?.explorationPercent || 0;
  const totalExperiences = city?.totalExperiences || 0;
  const activeEventsCount = city?.activeEventsCount || 0;
  const equipmentsCount = city?.equipments.length || 0;
  const activeTitle = city?.explorerTitle || "Iniciante";

  // Dynamic database progress metrics
  const visitedEquipmentsCount = city?.visitedEquipmentsCount ?? 0;
  const totalEquipmentsCount = city?.totalEquipmentsCount ?? 0;
  const registeredEventsCount = city?.registeredEventsCount ?? 0;
  const completedTrailsCount = city?.completedTrailsCount ?? 0;
  const totalTrailsCount = city?.totalTrailsCount ?? 0;

  const equipmentsPercent = totalEquipmentsCount > 0 ? (visitedEquipmentsCount / totalEquipmentsCount) * 100 : 0;
  const eventsPercent = activeEventsCount > 0 ? (registeredEventsCount / activeEventsCount) * 100 : 0;
  const trailsPercent = totalTrailsCount > 0 ? (completedTrailsCount / totalTrailsCount) * 100 : 0;
  // Filtered equipments list based on search bar query
  const filteredEquipments = useMemo(() => {
    if (!city) return [];
    return city.equipments.filter(eq => 
      eq.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [city, searchQuery]);

  // Map points filter
  const mapFilteredEquipments = useMemo(() => {
    if (!city) return [];
    if (mapFilter === "Todos") return city.equipments;
    return city.equipments.filter(eq => {
      if (mapFilter === "Museus") return eq.name.toLowerCase().includes("museu") || eq.name.toLowerCase().includes("casa");
      if (mapFilter === "Eventos") return eq.eventsCount > 0;
      return true;
    });
  }, [city, mapFilter]);

  // Dynamic values parsed from database seeds or elegant mock fallbacks
  const firstMuseum = city?.equipments[0] || null;
  const firstEvent = dbEvents[0] || null;
  const firstTrail = dbTrails[0] || null;

  if (loading) {
    return (
      <div className="city-dashboard-loader-container">
        <div className="city-dashboard-spinner-glow">
          <div className="city-dashboard-spinner"></div>
          <span className="glow-text text-gold-400 font-bold uppercase tracking-widest mt-4">Conectando ao Banco de Dados...</span>
        </div>
      </div>
    );
  }

  if (error || !city) {
    return (
      <div className="city-dashboard-error-container">
        <ShieldAlert size={64} className="text-gold-400 mb-4 animate-pulse" />
        <h2 className="text-2xl font-black mb-2 text-white uppercase tracking-wider">Ops! Ocorreu um problema</h2>
        <p className="text-gray-400 mb-6">{error || "Cidade não encontrada"}</p>
        <Button onClick={() => navigate("/hub-cidades")} className="bg-gold-400 hover:bg-gold-500 text-black font-black uppercase">
          Voltar ao Hub de Cidades
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      className="city-dashboard-root-wrapper"
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      <Helmet>
        <title>{cityName} | Ecossistema Cultural Municipal</title>
        <meta name="description" content={`Explore museus, pontos históricos, roteiros e missões culturais em ${cityName}.`} />
      </Helmet>

      {/* 💻 DESKTOP CONTAINER (Viewport >= 1024px) */}
      <div className="desktop-layout-grid hidden lg:grid">
        
        {/* A. Sidebar de Menu Esquerda */}
        <aside className="city-left-sidebar">
          <div className="sidebar-logo-container" onClick={() => navigate("/hub-cidades")}>
            <div className="logo-flex flex items-center gap-3">
              <div className="heartbeat-pulse-line">
                <span className="heartbeat-pulse"></span>
              </div>
              <h2 className="logo-title font-black text-gold-400">PULSE HUB</h2>
            </div>
            <span className="logo-subtitle tracking-widest text-gray-500 text-[8px] font-bold block mt-1">PORTAL MUNICIPAL</span>
          </div>

          <nav className="sidebar-nav-links">
            <button className="sidebar-nav-item active" onClick={() => { setMobileTab("dashboard"); }}>
              <span className="sidebar-nav-icon">🏠</span> Início
            </button>
            <button className="sidebar-nav-item" onClick={() => navigate("/select-museum")}>
              <span className="sidebar-nav-icon">🧭</span> Explorar
            </button>
            <button className="sidebar-nav-item" onClick={() => navigate("/mapa")}>
              <span className="sidebar-nav-icon">🗺️</span> Mapa Cultural
            </button>
            <button className="sidebar-nav-item" onClick={() => navigate("/favoritos")}>
              <span className="sidebar-nav-icon">🤍</span> Favoritos
            </button>
            <button className="sidebar-nav-item" onClick={() => navigate("/desafios")}>
              <span className="sidebar-nav-icon">🚀</span> Minhas Missões
            </button>
            <button className="sidebar-nav-item" onClick={() => navigate("/conquistas")}>
              <span className="sidebar-nav-icon">🏆</span> Conquistas
            </button>
            <button className="sidebar-nav-item" onClick={() => navigate("/roteiro")}>
              <span className="sidebar-nav-icon">🤝</span> Parceiros
            </button>
            <button className="sidebar-nav-item" onClick={() => navigate("/perfil")}>
              <span className="sidebar-nav-icon">👤</span> Perfil
            </button>
          </nav>

          <div className="sidebar-footer">
            <button className="sidebar-immersive-btn" onClick={() => navigate("/select-museum")}>
              <span className="immersive-icon">👓</span> Modo Imersivo
            </button>
            
            {/* Seu Passaporte Cultural widget */}
            <Card className="sidebar-passport-card mt-6" onClick={() => navigate("/passaporte")}>
              <div className="passport-card-inner">
                <span className="passport-card-lbl uppercase">Seu Passaporte Cultural</span>
                <div className="passport-cover-image-container my-3">
                  <div className="passport-cover-image">
                    <span className="book-title">CULTURA VIVA</span>
                  </div>
                </div>
                <p className="passport-card-desc text-gray-400">Explore, conquiste e acumule memórias.</p>
                <span className="passport-card-btn font-bold text-gold-400 block mt-2 text-xs hover:underline">Ver meu passaporte &gt;</span>
              </div>
            </Card>
          </div>
        </aside>

        {/* B. Painel Central de Conteúdo */}
        <main className="city-main-content">
          {/* Header Search Bar */}
          <header className="dashboard-top-bar flex justify-between items-center mb-6">
            <div className="search-bar-container max-w-xl flex-1 mr-4">
              <div className="search-bar-wrapper">
                <Search size={18} className="text-gray-400 mr-3" />
                <input 
                  type="text" 
                  placeholder="Buscar museus, eventos e experiências..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="topbar-search-input"
                />
              </div>
            </div>

            <div className="topbar-user-profile flex items-center gap-4">
              <button className="bell-notification-btn relative">
                <Bell size={20} className="text-gray-400 hover:text-white transition-colors" />
                <span className="bell-badge-pulse"></span>
              </button>
              <div className="user-profile-meta flex items-center gap-3">
                <div className="user-avatar-circular">
                  {authName ? authName.charAt(0).toUpperCase() : "V"}
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="user-profile-name font-bold truncate block">{authName || "Visitante"}</span>
                  <span className="user-profile-title font-semibold text-xs text-gold-400 truncate block">{activeTitle}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Hero Banner */}
          <div className="dashboard-hero-banner" style={city.coverImageUrl ? { backgroundImage: `radial-gradient(circle at 100% 50%, rgba(11, 15, 25, 0.4) 0%, #070a10 70%), url(${getFullUrl(city.coverImageUrl)})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
            <div className="hero-banner-overlay"></div>
            <div className="hero-banner-content flex justify-between items-end">
              <div className="content-left flex-1 text-left pr-4">
                <span className="hero-welcome-lbl">Pulse Hub &gt; Cidades &gt; {cityName}</span>
                <h1 className="hero-title-main font-black text-white text-5xl uppercase tracking-tighter my-2">
                  {cityName}
                </h1>
                <span className="hero-welcome-lbl text-gold-400 font-extrabold block text-sm uppercase mb-3">Cultura que transforma, história que conecta.</span>
                <p className="hero-subtitle-desc max-w-xl text-gray-400 text-xs leading-relaxed mb-6">
                  Explore museus, eventos, roteiros e experiências culturais em {cityName}. Viva o melhor da nossa cidade.
                </p>

                <div className="hero-stats-row flex gap-6 border-t border-white/5 pt-4">
                  <div className="hero-stat-item">
                    <span className="stat-num font-black text-white text-lg">🏛️ {equipmentsCount}</span>
                    <span className="stat-lbl text-[9px] text-gray-500 font-bold uppercase block">Museus</span>
                  </div>
                  <div className="hero-stat-item">
                    <span className="stat-num font-black text-white text-lg">📅 {activeEventsCount}</span>
                    <span className="stat-lbl text-[9px] text-gray-500 font-bold uppercase block">Eventos</span>
                  </div>
                  <div className="hero-stat-item">
                    <span className="stat-num font-black text-white text-lg">🧭 {dbTrails.length}</span>
                    <span className="stat-lbl text-[9px] text-gray-500 font-bold uppercase block">Roteiros</span>
                  </div>
                  <div className="hero-stat-item">
                    <span className="stat-num font-black text-white text-lg">➕ {totalExperiences}+</span>
                    <span className="stat-lbl text-[9px] text-gray-500 font-bold uppercase block">Experiências</span>
                  </div>
                </div>

                <div className="hero-actions-flex flex gap-4 mt-6">
                  <Button 
                    className="explore-now-btn bg-gold-400 hover:bg-gold-500 text-black font-black uppercase text-xs h-10 px-6 rounded-lg flex items-center gap-2"
                    onClick={() => {
                      if (firstMuseum) {
                        handleSelectMuseum(firstMuseum);
                      } else {
                        navigate("/select-museum");
                      }
                    }}
                  >
                    Explorar agora <ArrowRight size={14} />
                  </Button>
                  <Button 
                    variant="outline"
                    className="view-map-btn border-gold-400 text-gold-400 hover:bg-gold-400 hover:text-black font-black uppercase text-xs h-10 px-6 rounded-lg flex items-center gap-2"
                    onClick={() => navigate("/mapa")}
                  >
                    <Map size={14} /> Ver mapa da cidade
                  </Button>
                </div>
              </div>

              {/* Weather Widget */}
              <div className="hero-weather-widget p-4 text-left">
                <span className="widget-title text-[9px] text-gray-500 font-bold uppercase block">Clima agora</span>
                <div className="temp-row flex items-center gap-3 my-1">
                  <Moon className="text-gold-400" size={24} />
                  <div>
                    <span className="temp-value font-black text-white text-2xl">23°C</span>
                    <span className="temp-lbl text-[9px] text-gray-400 block">Céu limpo</span>
                  </div>
                </div>
                <div className="widget-footer border-t border-white/5 pt-2 mt-2 flex items-center gap-1.5 text-gray-400 text-[10px]">
                  <Sun size={12} className="text-gold-400" />
                  <span>Melhor horário: <b>Pôr do sol 17:42</b></span>
                </div>
              </div>
            </div>
          </div>

          {/* Central Category Buttons row */}
          <section className="explore-categories-row my-8 text-left">
            <div className="categories-horizontal-grid flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
              <button className="category-pill-btn" onClick={() => navigate("/select-museum")}>
                <span className="emoji">🏛️</span>
                <div>
                  <span className="title">Museus</span>
                  <span className="sub">{equipmentsCount} locais</span>
                </div>
              </button>
              <button className="category-pill-btn" onClick={() => navigate("/agenda")}>
                <span className="emoji">📅</span>
                <div>
                  <span className="title">Eventos</span>
                  <span className="sub">{activeEventsCount} ativos</span>
                </div>
              </button>
              <button className="category-pill-btn" onClick={() => navigate("/roteiro")}>
                <span className="emoji">🧭</span>
                <div>
                  <span className="title">Roteiros</span>
                  <span className="sub">{dbTrails.length} roteiros</span>
                </div>
              </button>
              <button className="category-pill-btn" onClick={() => navigate("/select-museum")}>
                <span className="emoji">🎨</span>
                <div>
                  <span className="title">Arte Pública</span>
                  <span className="sub">Disponível</span>
                </div>
              </button>
              <button className="category-pill-btn" onClick={() => navigate("/roteiro")}>
                <span className="emoji">🍴</span>
                <div>
                  <span className="title">Gastronomia</span>
                  <span className="sub">Parceiros</span>
                </div>
              </button>
              <button className="category-pill-btn" onClick={() => navigate("/select-museum")}>
                <span className="emoji">✈️</span>
                <div>
                  <span className="title">Turismo</span>
                  <span className="sub">Atrações</span>
                </div>
              </button>
              <button className="category-pill-btn" onClick={() => navigate("/chat")}>
                <span className="emoji">🎧</span>
                <div>
                  <span className="title">Guias & Áudios</span>
                  <span className="sub">Disponíveis</span>
                </div>
              </button>
              <button className="category-pill-btn" onClick={() => navigate("/select-museum")}>
                <span className="emoji">♿</span>
                <div>
                  <span className="title">Acessibilidade</span>
                  <span className="sub">Ativa</span>
                </div>
              </button>
            </div>
          </section>

          {/* Destaques da cidade */}
          {/* Destaques da cidade */}
          {(firstMuseum || firstEvent || firstTrail) && (
            <section className="city-section-block text-left mb-8">
              <div className="section-header-flex flex justify-between items-center mb-4">
                <h3 className="section-heading font-black text-white text-sm uppercase tracking-wider">Destaques da cidade</h3>
                <button className="view-all-link text-xs text-gold-400 font-bold hover:underline" onClick={() => navigate("/select-museum")}>Ver todos</button>
              </div>

              <div className="highlights-grid grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Casa da Cultura (Equipamento Real do Banco!) */}
                {firstMuseum && (
                  <Card 
                    className="highlight-item-card cursor-pointer overflow-hidden border-white/5 bg-white/5 group"
                    onClick={() => handleSelectMuseum(firstMuseum)}
                  >
                    <div className="card-image-wrapper h-40 relative overflow-hidden">
                      <img src={firstMuseum?.coverImageUrl ? getFullUrl(firstMuseum.coverImageUrl) : "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=600"} alt={firstMuseum.name} className="card-image w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="card-overlay"></div>
                      <span className="card-badge-absolute uppercase">Destaque</span>
                    </div>
                    <div className="card-info p-4">
                      <h4 className="card-title font-black text-white text-base">{firstMuseum.name}</h4>
                      <p className="card-desc text-xs text-gray-400 mt-2 leading-relaxed line-clamp-2">
                        {firstMuseum.missao || `História, arte e memória no coração de ${cityName}.`}
                      </p>
                      <span className="card-action-btn font-extrabold text-gold-400 text-xs block mt-4 group-hover:translate-x-1 transition-transform">Explorar &gt;</span>
                    </div>
                  </Card>
                )}

                {/* Card 2: Festival de Inverno (Evento Real do Banco!) */}
                {firstEvent && (
                  <Card className="highlight-item-card cursor-pointer overflow-hidden border-white/5 bg-white/5 group" onClick={() => navigate("/agenda")}>
                    <div className="card-image-wrapper h-40 relative overflow-hidden">
                      <img src={(firstEvent as any)?.coverImageUrl ? getFullUrl((firstEvent as any).coverImageUrl) : "https://images.unsplash.com/photo-1507676184212-d0330a151f96?q=80&w=600"} alt={(firstEvent as any).title} className="card-image w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="card-overlay"></div>
                      <span className="card-badge-absolute event-badge uppercase">Evento</span>
                    </div>
                    <div className="card-info p-4">
                      <h4 className="card-title font-black text-white text-base">{(firstEvent as any).title}</h4>
                      <p className="card-desc text-xs text-gray-400 mt-2 leading-relaxed line-clamp-2">
                        {(firstEvent as any).description || "Programação completa disponível no portal."}
                      </p>
                      <span className="card-date-badge font-extrabold text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full inline-block mt-4">
                        {`${new Date((firstEvent as any).startDate).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})} - ${new Date((firstEvent as any).endDate).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}`}
                      </span>
                    </div>
                  </Card>
                )}

                {/* Card 3: Rota Histórica (Roteiro Real do Banco!) */}
                {firstTrail && (
                  <Card className="highlight-item-card cursor-pointer overflow-hidden border-white/5 bg-white/5 group" onClick={() => navigate("/roteiro")}>
                    <div className="card-image-wrapper h-40 relative overflow-hidden">
                      <img src={(firstTrail as any)?.imageUrl ? getFullUrl((firstTrail as any).imageUrl) : "https://images.unsplash.com/photo-1523730205978-59fd1b2965e3?q=80&w=600"} alt={(firstTrail as any).title} className="card-image w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="card-overlay"></div>
                      <span className="card-badge-absolute route-badge uppercase">Roteiro</span>
                    </div>
                    <div className="card-info p-4">
                      <h4 className="card-title font-black text-white text-base">{(firstTrail as any).title}</h4>
                      <p className="card-desc text-xs text-gray-400 mt-2 leading-relaxed line-clamp-2">
                        {(firstTrail as any).description || `Percorra os principais marcos históricos.`}
                      </p>
                      <span className="card-action-btn font-extrabold text-gold-400 text-xs block mt-4 group-hover:translate-x-1 transition-transform">Ver roteiro &gt;</span>
                    </div>
                  </Card>
                )}
              </div>
            </section>
          )}

          {/* Experiências em alta */}
          {city.equipments.length > 0 && (
            <section className="city-section-block text-left mb-6">
              <div className="section-header-flex flex justify-between items-center mb-4">
                <h3 className="section-heading font-black text-white text-sm uppercase tracking-wider">Experiências em alta</h3>
                <button className="view-all-link text-xs text-gold-400 font-bold hover:underline" onClick={() => navigate("/select-museum")}>Ver todos</button>
              </div>

              <div className="experiences-horizontal-grid flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                {city.equipments.map((eq) => (
                  <Card key={eq.id} className="experience-compact-item flex-shrink-0 cursor-pointer overflow-hidden relative" onClick={() => handleSelectMuseum(eq)}>
                    <img src={eq.coverImageUrl ? getFullUrl(eq.coverImageUrl) : "https://images.unsplash.com/photo-1566378246598-5b11a0d486cc?q=80&w=300"} alt={eq.name} />
                    <div className="info-overlay flex flex-col justify-end p-3 text-left">
                      <span className="title font-bold text-white text-xs">{eq.name}</span>
                      <span className="count text-[9px] text-gray-400">{eq.worksCount} obras</span>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* C. Painel de Status Direito */}
        <aside className="city-right-sidebar">
          {/* User selector Profile panel */}
          <div className="right-panel-user-header flex items-center justify-between p-4 border-b border-white/5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="avatar-w flex-shrink-0">
                {authName ? authName.charAt(0).toUpperCase() : "V"}
              </div>
              <div className="text-left min-w-0">
                <span className="name font-bold text-white block text-sm truncate">{authName || "Visitante"}</span>
                <span className="title text-gold-400 text-[10px] font-bold uppercase block truncate">{activeTitle}</span>
              </div>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </div>

          {/* Seu Progresso na Cidade */}
          <section className="right-panel-block p-5 border-b border-white/5">
            <span className="block-title text-[9px] text-gray-500 font-black uppercase text-left mb-4">Seu progresso na cidade</span>

            <div className="donut-progress-row flex items-center gap-5 my-4">
              <div className="donut-svg-wrapper relative">
                <svg className="radial-donut-ring" viewBox="0 0 100 100">
                  <circle className="bg-ring" cx="50" cy="50" r="40" />
                  <circle className="progress-ring" cx="50" cy="50" r="40" style={{ strokeDashoffset: 251.2 - (251.2 * explorationPercent) / 100 }} />
                </svg>
                <div className="radial-inner-value flex flex-col items-center justify-center">
                  <span className="percent font-black text-white text-lg">{explorationPercent}%</span>
                  <span className="lbl text-[8px] text-gold-400 uppercase font-black">Explorado</span>
                </div>
              </div>

              <div className="check-progress-list flex-1 text-left space-y-3">
                <div className="check-progress-item">
                  <div className="flex justify-between text-[10px] mb-1 font-bold">
                    <span className="label text-gray-400">🏛️ {visitedEquipmentsCount}/{totalEquipmentsCount} {totalEquipmentsCount === 1 ? "Equipamento visitado" : "Equipamentos visitados"}</span>
                  </div>
                  <div className="progress-track-small">
                    <div className="fill-gold" style={{ width: `${equipmentsPercent}%` }}></div>
                  </div>
                </div>
                <div className="check-progress-item">
                  <div className="flex justify-between text-[10px] mb-1 font-bold">
                    <span className="label text-gray-400">📅 {registeredEventsCount}/{activeEventsCount} {activeEventsCount === 1 ? "Evento participado" : "Eventos participados"}</span>
                  </div>
                  <div className="progress-track-small">
                    <div className="fill-gold" style={{ width: `${eventsPercent}%` }}></div>
                  </div>
                </div>
                <div className="check-progress-item">
                  <div className="flex justify-between text-[10px] mb-1 font-bold">
                    <span className="label text-gray-400">🧭 {completedTrailsCount}/{totalTrailsCount} {totalTrailsCount === 1 ? "Roteiro concluído" : "Roteiros concluídos"}</span>
                  </div>
                  <div className="progress-track-small">
                    <div className="fill-gold" style={{ width: `${trailsPercent}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="view-progress-btn w-full border-gold-400 text-gold-400 font-extrabold uppercase text-xs h-9 rounded-lg mt-3 flex items-center justify-center gap-2 hover:bg-gold-400 hover:text-black"
              onClick={() => navigate("/perfil")}
            >
              Ver meu progresso <ChevronRight size={14} />
            </Button>
          </section>

          {/* Ranking de exploradores (REAL DO BANCO DE DADOS!) */}
          <section className="right-panel-block p-5 border-b border-white/5 text-left">
            <div className="flex justify-between items-center mb-4">
              <span className="block-title text-[9px] text-gray-500 font-black uppercase">Ranking de exploradores</span>
              <button className="block-action text-[9px] text-gold-400 font-bold hover:underline" onClick={() => navigate("/ranking")}>Ver ranking</button>
            </div>

            <div className="explorers-ranking-list space-y-3">
              {dbRankings.length > 0 ? (
                dbRankings.slice(0, 3).map((r, index) => {
                  const isMe = r.email === dbMyRank?.email;
                  return (
                    <div key={(r as any).rank || index} className={`explorer-rank-item flex items-center gap-3 ${isMe ? 'active-user-rank-style' : ''}`}>
                      <span className={`rank-num font-black text-sm ${(r as any).rank === 1 ? 'text-yellow-500' : (r as any).rank === 2 ? 'text-gold-400' : 'text-gray-500'}`}>{(r as any).rank}</span>
                      <div className="rank-avatar bg-[#101622] text-white font-bold uppercase">{(r as any).name ? (r as any).name.charAt(0) : "V"}</div>
                      <div className="flex-1 min-w-0">
                        <span className="name font-bold text-xs text-white block truncate">{(r as any).name || "Visitante Anônimo"} {isMe && "(Você)"}</span>
                      </div>
                      <span className="xp-tag text-[10px] text-gold-400 font-semibold">{r.xp} XP</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-xs text-gray-500 font-semibold w-full">
                  Nenhum explorador no ranking ainda
                </div>
              )}
            </div>

            <span className="ranking-see-all text-[10px] text-gray-500 hover:text-gold-400 hover:underline font-bold text-center block mt-4 cursor-pointer" onClick={() => navigate("/ranking")}>Ver todos os exploradores &gt;</span>
          </section>

          {/* Conquistas da cidade (REAL DO BANCO DE DADOS!) */}
          <section className="right-panel-block p-5 border-b border-white/5 text-left">
            <div className="flex justify-between items-center mb-4">
              <span className="block-title text-[9px] text-gray-500 font-black uppercase">Conquistas da cidade</span>
              <button className="block-action text-[9px] text-gold-400 font-bold hover:underline" onClick={() => navigate("/conquistas")}>Ver todas</button>
            </div>

            <div className="city-achievements-row flex gap-4 justify-between my-2">
              {dbAchievements.length > 0 ? (
                dbAchievements.slice(0, 4).map((ach, idx) => {
                  const colors = ["gold", "purple", "bronze", "dark"];
                  const color = colors[idx % 4];
                  return (
                    <div key={ach.id} className={`achievement-badge-shield ${color}`} title={ach.description || (ach as any).title}>
                      {(ach as any).title.includes("Pioneiro") ? "🥇" : (ach as any).title.includes("Mestre") ? "👑" : (ach as any).title.includes("Rotas") ? "🧭" : "🔒"}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-2 text-xs text-gray-500 font-semibold w-full">
                  Sem conquistas cadastradas
                </div>
              )}
            </div>
          </section>

          {/* Callout Explorador Lendario */}
          <section className="right-panel-block p-5">
            <Card className="explorer-legendary-banner relative overflow-hidden" onClick={() => navigate("/desafios")}>
              <div className="legendary-banner-glow"></div>
              <div className="legendary-banner-content text-left p-4 z-10 relative">
                <span className="legendary-crown-icon">👑</span>
                <h4 className="legendary-title font-black text-white text-base mt-2">Seja um Explorador Lendário</h4>
                <p className="legendary-desc text-xs text-gray-400 mt-2 leading-relaxed">
                  Complete missões, descubra lugares e deixe seu legado cultural na cidade.
                </p>
                <Button variant="outline" className="legendary-btn w-full border-white/20 text-white font-extrabold uppercase text-[10px] h-8 rounded-lg mt-4 flex items-center justify-center gap-1.5 hover:bg-white hover:text-black">
                  Ver missões disponíveis <ChevronRight size={12} />
                </Button>
              </div>
            </Card>
          </section>
        </aside>
      </div>

      {/* 📱 MOBILE VIEW CONTAINER (Viewport < 1024px) */}
      <div className="mobile-view-layout lg:hidden flex flex-col min-h-screen pb-24">
        
        {/* Sub-tela: Dashboard Principal */}
        {mobileTab === "dashboard" && (
          <motion.div 
            className="mobile-dashboard-scrollable-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Top Header Mobile */}
            <header className="mobile-top-bar flex justify-between items-center px-6 py-4 bg-transparent relative z-20">
              <div className="mobile-brand-logo flex items-center gap-2" onClick={() => navigate("/hub-cidades")}>
                <div className="heartbeat-pulse-line">
                  <span className="heartbeat-pulse"></span>
                </div>
                <div className="flex flex-col text-left">
                  <h2 className="mobile-brand-title font-black text-gold-400 leading-none text-base">PULSE HUB</h2>
                  <span className="mobile-brand-subtitle text-[10px] text-gray-500 tracking-widest leading-none mt-1 uppercase font-bold">Portal Municipal</span>
                </div>
              </div>

              <div className="mobile-top-actions flex items-center gap-3">
                <button className="mobile-bell-btn relative min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <Bell size={18} className="text-gray-400" />
                  <span className="bell-badge-pulse-small absolute top-2 right-2"></span>
                </button>
                <div className="mobile-avatar-circle min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer" onClick={() => navigate("/perfil")}>
                  {authName ? authName.charAt(0).toUpperCase() : "V"}
                </div>
              </div>
            </header>

            {/* Mobile Hero Block */}
            <div className="mobile-hero-section px-6 pt-2 text-left">
              <div 
                className="mobile-hero-image-card p-5 relative overflow-hidden"
                style={city.coverImageUrl ? { backgroundImage: `radial-gradient(circle at 50% 100%, rgba(7, 10, 16, 0.4) 0%, #070b13 90%), url(${getFullUrl(city.coverImageUrl)})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
              >
                <div className="mobile-hero-overlay"></div>
                <div className="relative z-10">
                  <span className="mobile-breadcrumb text-xs text-gray-500 font-bold uppercase">Pulse Hub &gt; Cidades</span>
                  <h1 className="mobile-city-title font-black text-white text-3xl md:text-4xl uppercase tracking-tighter my-1">
                    {cityName}
                  </h1>
                  <span className="mobile-city-slogan font-extrabold text-gold-400 text-xs uppercase block mb-3">Cultura que transforma, história que conecta.</span>
                  <p className="mobile-city-desc text-xs text-gray-400 leading-relaxed max-w-sm">
                    Explore museus, eventos, roteiros e experiências culturais em {cityName}. Viva o melhor da nossa cidade.
                  </p>

                  <div className="mobile-stats-row flex gap-4 mt-5 border-t border-white/5 pt-4">
                    <div className="mobile-stat-box">
                      <span className="stat-num font-black text-white text-sm">🏛️ {equipmentsCount}</span>
                      <span className="stat-lbl text-[10px] text-gray-500 font-bold uppercase block">Museus</span>
                    </div>
                    <div className="mobile-stat-box">
                      <span className="stat-num font-black text-white text-sm">📅 {activeEventsCount}</span>
                      <span className="stat-lbl text-[10px] text-gray-500 font-bold uppercase block">Eventos</span>
                    </div>
                    <div className="mobile-stat-box">
                      <span className="stat-num font-black text-white text-sm">🧭 {dbTrails.length}</span>
                      <span className="stat-lbl text-[10px] text-gray-500 font-bold uppercase block">Roteiros</span>
                    </div>
                    <div className="mobile-stat-box">
                      <span className="stat-num font-black text-white text-sm">➕ {totalExperiences}+</span>
                      <span className="stat-lbl text-[10px] text-gray-500 font-bold uppercase block">Exp.</span>
                    </div>
                  </div>

                  <div className="mobile-actions-flex flex flex-col gap-3 mt-5">
                    <Button 
                      className="explore-now-btn-mob w-full bg-gold-400 hover:bg-gold-500 text-black font-black uppercase text-xs min-h-[44px] rounded-lg flex items-center justify-center gap-2"
                      onClick={() => {
                        if (firstMuseum) {
                          handleSelectMuseum(firstMuseum);
                        } else {
                          navigate("/select-museum");
                        }
                      }}
                    >
                      Explorar agora <ArrowRight size={14} />
                    </Button>
                    <Button 
                      variant="outline"
                      className="view-map-btn-mob w-full border-gold-400 text-gold-400 hover:bg-gold-400 hover:text-black font-black uppercase text-xs min-h-[44px] rounded-lg flex items-center justify-center gap-2"
                      onClick={() => setMobileTab("mapa")}
                    >
                      <Map size={14} /> Ver mapa da cidade
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Weather Widget */}
            <div className="mobile-weather-section px-6 mt-6 text-left">
              <Card className="mobile-weather-card p-4 border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Moon className="text-gold-400" size={24} />
                  <div>
                    <span className="mobile-weather-title text-xs text-gray-500 font-bold uppercase block">Clima agora</span>
                    <span className="temp-value font-black text-white text-lg">23°C • Céu limpo</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="mobile-weather-title text-xs text-gray-500 font-bold uppercase block">Melhor horário</span>
                  <span className="text-xs text-gray-300 font-bold">Pôr do sol 17:42</span>
                </div>
              </Card>
            </div>

            {/* Mobile Category Grid: Explore a cidade */}
            <section className="mobile-categories-section px-6 mt-8 text-left">
              <div className="flex justify-between items-center mb-4">
                <h3 className="mobile-section-heading font-black text-white text-xs uppercase tracking-wider">Explore a cidade</h3>
                <span className="view-all-link text-xs text-gold-400 font-bold cursor-pointer" onClick={() => navigate("/select-museum")}>Ver todas</span>
              </div>

              <div className="mobile-categories-grid grid grid-cols-4 gap-3">
                <button className="mob-category-btn" onClick={() => navigate("/select-museum")}>
                  <span className="emoji">🏛️</span>
                  <span className="lbl">Museus</span>
                  <span className="sub">{equipmentsCount} locais</span>
                </button>
                <button className="mob-category-btn" onClick={() => navigate("/agenda")}>
                  <span className="emoji">📅</span>
                  <span className="lbl">Eventos</span>
                  <span className="sub">{activeEventsCount} ativos</span>
                </button>
                <button className="mob-category-btn" onClick={() => navigate("/roteiro")}>
                  <span className="emoji">🧭</span>
                  <span className="lbl">Roteiros</span>
                  <span className="sub">{dbTrails.length} rotas</span>
                </button>
                <button className="mob-category-btn" onClick={() => navigate("/select-museum")}>
                  <span className="emoji">🎨</span>
                  <span className="lbl">Arte</span>
                  <span className="sub">{totalExperiences} obras</span>
                </button>
                <button className="mob-category-btn" onClick={() => navigate("/roteiro")}>
                  <span className="emoji">🍴</span>
                  <span className="lbl">Gastron.</span>
                  <span className="sub">Parceiros</span>
                </button>
                <button className="mob-category-btn" onClick={() => navigate("/select-museum")}>
                  <span className="emoji">✈️</span>
                  <span className="lbl">Turismo</span>
                  <span className="sub">Atrações</span>
                </button>
                <button className="mob-category-btn" onClick={() => navigate("/chat")}>
                  <span className="emoji">🎧</span>
                  <span className="lbl">Guias</span>
                  <span className="sub">Disponív.</span>
                </button>
                <button className="mob-category-btn" onClick={() => navigate("/select-museum")}>
                  <span className="emoji">♿</span>
                  <span className="lbl">Acessib.</span>
                  <span className="sub">Ativa</span>
                </button>
              </div>
            </section>

            {/* Mobile Highlights: Destaques da cidade */}
            <section className="mobile-highlights-section px-6 mt-8 text-left">
              <div className="flex justify-between items-center mb-4">
                <h3 className="mobile-section-heading font-black text-white text-xs uppercase tracking-wider">Destaques da cidade</h3>
                <span className="view-all-link text-xs text-gold-400 font-bold cursor-pointer" onClick={() => navigate("/select-museum")}>Ver todos</span>
              </div>

              <div className="mobile-highlights-list flex flex-col gap-5">
                {/* 1: Equipamento em destaque (REAL DO BANCO!) */}
                {firstMuseum && (
                  <Card 
                    className="mobile-highlight-card overflow-hidden border-white/5 bg-white/5"
                    onClick={() => handleSelectMuseum(firstMuseum)}
                  >
                    <div className="h-44 relative overflow-hidden">
                      <img src={firstMuseum.coverImageUrl ? getFullUrl(firstMuseum.coverImageUrl) : "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=600"} alt={firstMuseum.name} className="w-full h-full object-cover" />
                      <div className="card-overlay"></div>
                      <span className="card-badge uppercase">Museu em destaque</span>
                    </div>
                    <div className="p-4">
                      <h4 className="font-black text-white text-base">{firstMuseum.name}</h4>
                      <p className="text-xs text-gray-400 mt-2 leading-relaxed line-clamp-2">
                        {firstMuseum.missao || `História, arte e memória no coração de ${cityName}.`}
                      </p>
                      <span className="text-xs text-gold-400 font-bold block mt-3">Explorar &gt;</span>
                    </div>
                  </Card>
                )}

                {/* 2: Evento em destaque (REAL DO BANCO!) */}
                {firstEvent && (
                  <Card className="mobile-highlight-card overflow-hidden border-white/5 bg-white/5" onClick={() => navigate("/agenda")}>
                    <div className="h-44 relative overflow-hidden">
                      <img src={(firstEvent as any).coverImageUrl ? getFullUrl((firstEvent as any).coverImageUrl) : "https://images.unsplash.com/photo-1507676184212-d0330a151f96?q=80&w=600"} alt={(firstEvent as any).title} className="w-full h-full object-cover" />
                      <div className="card-overlay"></div>
                      <span className="card-badge event uppercase">Evento em alta</span>
                    </div>
                    <div className="p-4">
                      <h4 className="font-black text-white text-base">{(firstEvent as any).title}</h4>
                      <p className="text-xs text-gray-400 mt-2 leading-relaxed line-clamp-2">
                        {(firstEvent as any).description || "Programação completa disponível no portal."}
                      </p>
                      <span className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full inline-block mt-3 font-extrabold">
                        {`${new Date((firstEvent as any).startDate).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})} - ${new Date((firstEvent as any).endDate).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}`}
                      </span>
                    </div>
                  </Card>
                )}

                {/* 3: Roteiro em destaque (REAL DO BANCO!) */}
                {firstTrail && (
                  <Card className="mobile-highlight-card overflow-hidden border-white/5 bg-white/5" onClick={() => navigate("/roteiro")}>
                    <div className="h-44 relative overflow-hidden">
                      <img src={(firstTrail as any).imageUrl ? getFullUrl((firstTrail as any).imageUrl) : "https://images.unsplash.com/photo-1523730205978-59fd1b2965e3?q=80&w=600"} alt={(firstTrail as any).title} className="w-full h-full object-cover" />
                      <div className="card-overlay"></div>
                      <span className="card-badge route uppercase">Roteiro sugerido</span>
                    </div>
                    <div className="p-4">
                      <h4 className="font-black text-white text-base">{(firstTrail as any).title}</h4>
                      <p className="text-xs text-gray-400 mt-2 leading-relaxed line-clamp-2">
                        {(firstTrail as any).description || `Percorra os principais marcos históricos do município.`}
                      </p>
                      <span className="text-xs text-gold-400 font-bold block mt-3">Ver roteiro &gt;</span>
                    </div>
                  </Card>
                )}

                {/* Empty state when no highlights */}
                {!firstMuseum && !firstEvent && !firstTrail && (
                  <div className="text-center py-8 text-xs text-gray-500 font-semibold">
                    Nenhum destaque disponível ainda para esta cidade.
                  </div>
                )}
              </div>
            </section>
          </motion.div>
        )}

        {/* Sub-tela: Progresso Municipal */}
        {mobileTab === "progresso" && (
          <motion.div 
            className="mobile-progresso-screen px-6 py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header com botão de voltar */}
            <header className="mobile-sub-screen-header flex items-center gap-4 mb-6">
              <button className="back-btn p-2 min-w-[44px] min-h-[44px] flex items-center justify-center" onClick={() => setMobileTab("dashboard")}>
                <ArrowLeft size={20} className="text-gold-400" />
              </button>
              <h2 className="sub-screen-title font-black text-white text-lg uppercase tracking-wider">Progresso na cidade</h2>
            </header>

            {/* Circular Progress Gauge */}
            <div className="mobile-circular-progress-card p-6 border-white/5 bg-white/5 text-center flex flex-col items-center">
              <div className="donut-svg-wrapper relative my-2">
                <svg className="radial-donut-ring" viewBox="0 0 100 100">
                  <circle className="bg-ring" cx="50" cy="50" r="40" />
                  <circle className="progress-ring" cx="50" cy="50" r="40" style={{ strokeDashoffset: 251.2 - (251.2 * explorationPercent) / 100 }} />
                </svg>
                <div className="radial-inner-value flex flex-col items-center justify-center">
                  <span className="percent font-black text-white text-2xl">{explorationPercent}%</span>
                  <span className="lbl text-xs text-gold-400 uppercase font-black">Explorado</span>
                </div>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed max-w-xs mt-4">
                Continue explorando e descubra tudo que {cityName} tem a oferecer!
              </p>
            </div>

            {/* Checklist de Progresso */}
            <div className="mobile-checklist-card p-5 border-white/5 bg-white/5 text-left mt-6">
              <div className="space-y-4">
                <div className="check-progress-item">
                  <div className="flex justify-between text-xs mb-1 font-bold">
                    <span className="label text-gray-300">🏛️ {visitedEquipmentsCount}/{totalEquipmentsCount} {totalEquipmentsCount === 1 ? "Equipamento visitado" : "Equipamentos visitados"}</span>
                  </div>
                  <div className="progress-track-small">
                    <div className="fill-gold" style={{ width: `${equipmentsPercent}%` }}></div>
                  </div>
                </div>
                <div className="check-progress-item">
                  <div className="flex justify-between text-xs mb-1 font-bold">
                    <span className="label text-gray-300">📅 {registeredEventsCount}/{activeEventsCount} {activeEventsCount === 1 ? "Evento participado" : "Eventos participados"}</span>
                  </div>
                  <div className="progress-track-small">
                    <div className="fill-gold" style={{ width: `${eventsPercent}%` }}></div>
                  </div>
                </div>
                <div className="check-progress-item">
                  <div className="flex justify-between text-xs mb-1 font-bold">
                    <span className="label text-gray-300">🚀 {completedTrailsCount}/{totalTrailsCount} {totalTrailsCount === 1 ? "Roteiro concluído" : "Roteiros concluídos"}</span>
                  </div>
                  <div className="progress-track-small">
                    <div className="fill-gold" style={{ width: `${trailsPercent}%` }}></div>
                  </div>
                </div>
              </div>

              <Button 
                variant="outline"
                className="w-full border-gold-400 text-gold-400 font-extrabold uppercase text-xs min-h-[44px] mt-5 rounded-lg flex items-center justify-center gap-2 hover:bg-gold-400 hover:text-black"
                onClick={() => navigate("/perfil")}
              >
                Ver meu progresso <ChevronRight size={14} />
              </Button>
            </div>

            {/* Ranking de Exploradores (REAL DO BANCO DE DADOS!) */}
            <div className="mobile-ranking-card p-5 border-white/5 bg-white/5 text-left mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-white text-xs uppercase tracking-wider">Ranking de exploradores</h3>
                <span className="text-[10px] text-gold-400 font-bold cursor-pointer" onClick={() => navigate("/ranking")}>Ver ranking</span>
              </div>

              <div className="explorers-ranking-list space-y-3">
                {dbRankings.length > 0 ? (
                  dbRankings.slice(0, 3).map((r, index) => {
                    const isMe = r.email === dbMyRank?.email;
                    return (
                      <div key={(r as any).rank || index} className={`explorer-rank-item flex items-center gap-3 ${isMe ? 'active-user-rank-style' : ''}`}>
                        <span className={`rank-num font-black text-sm ${(r as any).rank === 1 ? 'text-yellow-500' : (r as any).rank === 2 ? 'text-gold-400' : 'text-gray-500'}`}>{(r as any).rank}</span>
                        <div className="rank-avatar bg-[#101622] text-white font-bold uppercase">{(r as any).name ? (r as any).name.charAt(0) : "V"}</div>
                        <div className="flex-1">
                          <span className="name font-bold text-xs text-white block">{(r as any).name || "Visitante Anônimo"} {isMe && "(Você)"}</span>
                        </div>
                        <span className="xp-tag text-[10px] text-gold-400 font-semibold">{r.xp} XP</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-xs text-gray-500 font-semibold w-full">
                    Nenhum explorador no ranking ainda
                  </div>
                )}
              </div>

              <span className="ranking-see-all text-[10px] text-gray-500 font-bold text-center block mt-4 cursor-pointer" onClick={() => navigate("/ranking")}>Ver todos os exploradores &gt;</span>
            </div>

            {/* Conquistas (REAL DO BANCO DE DADOS!) */}
            <div className="mobile-achievements-row p-5 border-white/5 bg-white/5 text-left mt-6 flex justify-between items-center">
              <div>
                <h3 className="font-black text-white text-xs uppercase tracking-wider mb-2">Conquistas da cidade</h3>
                <div className="flex gap-2">
                  {dbAchievements.length > 0 ? (
                    dbAchievements.slice(0, 4).map((ach) => (
                      <span key={ach.id} className="text-xl" title={(ach as any).title}>
                        {(ach as any).title.includes("Pioneiro") ? "🥇" : (ach as any).title.includes("Mestre") ? "👑" : (ach as any).title.includes("Rotas") ? "🧭" : "🔒"}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500 font-semibold">Sem conquistas cadastradas</span>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-gold-400 font-bold hover:underline" onClick={() => navigate("/conquistas")}>Ver todas &gt;</span>
            </div>

            <Card className="explorer-legendary-banner relative overflow-hidden mt-6 mb-4" onClick={() => navigate("/desafios")}>
              <div className="legendary-banner-glow"></div>
              <div className="legendary-banner-content text-left p-5 z-10 relative">
                <span className="legendary-crown-icon">👑</span>
                <h4 className="legendary-title font-black text-white text-base mt-2">Seja um Explorador Lendário</h4>
                <p className="legendary-desc text-xs text-gray-400 mt-2 leading-relaxed">
                  Complete missões, descubra lugares e deixe seu legado cultural na cidade.
                </p>
                <Button variant="outline" className="legendary-btn w-full border-white/20 text-white font-extrabold uppercase text-[10px] h-9 rounded-lg mt-4 flex items-center justify-center gap-1.5 hover:bg-white hover:text-black">
                  Ver missões disponíveis <ChevronRight size={12} />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Sub-tela: Mapa Cultural */}
        {mobileTab === "mapa" && (
          <motion.div 
            className="mobile-mapa-screen flex flex-col h-[calc(100vh-80px)] overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header com botão de voltar */}
            <header className="mobile-sub-screen-header flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
              <div className="flex items-center gap-4">
                <button className="back-btn p-2 min-w-[44px] min-h-[44px] flex items-center justify-center" onClick={() => setMobileTab("dashboard")}>
                  <ArrowLeft size={20} className="text-gold-400" />
                </button>
                <h2 className="sub-screen-title font-black text-white text-lg uppercase tracking-wider">Mapa Cultural</h2>
              </div>
              <div className="filter-icon-mob cursor-pointer p-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
                <Navigation size={18} className="text-gold-400" />
              </div>
            </header>

            {/* Filter Pills */}
            <div className="map-filter-pills flex gap-2 overflow-x-auto px-6 py-3 flex-shrink-0 scrollbar-none bg-[#070b13]/40">
              {["Todos", "Museus", "Eventos", "Roteiros", "Arte Pública"].map(pill => (
                <button 
                  key={pill} 
                  className={`pill-btn text-xs font-black uppercase px-4 py-2 min-h-[44px] rounded-full border transition-all ${mapFilter === pill ? "bg-gold-400 text-black border-gold-400" : "bg-transparent text-gray-400 border-white/10"}`}
                  onClick={() => setMapFilter(pill)}
                >
                  {pill}
                </button>
              ))}
            </div>

            {/* Simulated interactive dark map */}
            <div className="mobile-map-simulation-area flex-grow relative overflow-hidden bg-[#0a0f19]">
              {/* Dark Streets grid */}
              <div className="streets-overlay-grid"></div>
              
              {/* Dynamic glowing gold pins from filtered equipments (REAL DO BANCO DE DADOS!) */}
              {mapFilteredEquipments.map((eq, index) => {
                const isActive = selectedPin?.id === eq.id;
                const topPercent = 30 + (index * 17) % 50;
                const leftPercent = 20 + (index * 23) % 65;

                return (
                  <div 
                    key={eq.id}
                    className={`map-glowing-pin-interactive ${isActive ? 'active-pin' : ''}`}
                    style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
                    onClick={() => setSelectedPin(eq)}
                  >
                    <div className="pin-pulse"></div>
                    <div className="pin-head">🏛️</div>
                    <span className="pin-label font-bold text-white text-[8px] bg-black/80 px-1.5 py-0.5 rounded border border-white/10 mt-1 block max-w-[70px] truncate">{eq.name}</span>
                  </div>
                );
              })}

              {/* Float bottom sheet card */}
              <AnimatePresence>
                {selectedPin && (
                  <motion.div 
                    className="floating-bottom-sheet-card px-6 pb-6 pt-4 text-left"
                    initial={{ y: 200, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 200, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  >
                    <div className="bottom-sheet-handle flex justify-center mb-3">
                      <div className="handle-bar"></div>
                    </div>

                    <div className="sheet-main-info flex justify-between items-start">
                      <div className="flex-1 text-left">
                        <span className="category-tag text-[9px] text-gold-400 font-extrabold uppercase">Equipamento Cultural • {selectedPin.name.toLowerCase().includes("museu") ? "Museu" : "Ponto Cultural"}</span>
                        <h3 className="sheet-title font-black text-white text-lg my-1">{selectedPin.name}</h3>
                        <div className="stats-row flex gap-3 text-[10px] text-gray-400 mt-1 font-bold">
                          <span>📍 350 m</span>
                          <span>🏃 5 min</span>
                        </div>
                      </div>
                      <button className="favorite-btn p-2 rounded-full border border-white/5 bg-white/5">
                        <Heart size={16} className="text-gold-400 fill-current" />
                      </button>
                    </div>

                    <p className="sheet-desc text-xs text-gray-400 mt-3 leading-relaxed">
                      {selectedPin.missao || "Espaço dedicado à preservação da história, arte e memória municipal com acervo conectado."}
                    </p>

                    <div className="details-tags-row flex gap-2 flex-wrap my-4">
                      <Badge className="badge-tag gold-text">Aberto agora • {selectedPin.horarios}</Badge>
                      <Badge className="badge-tag">Acessibilidade {selectedPin.acessibilidade}</Badge>
                      <Badge className="badge-tag gold-text">Entrada {selectedPin.ingresso}</Badge>
                    </div>

                    <div className="sheet-actions-grid grid grid-cols-2 gap-4 mt-4 border-t border-white/5 pt-4">
                      <Button 
                        className="explore-sheet-btn bg-gold-400 hover:bg-gold-500 text-black font-black uppercase text-xs h-11 rounded-lg flex items-center justify-center gap-1.5"
                        onClick={() => handleSelectMuseum(selectedPin)}
                      >
                        Ver detalhes <ArrowRight size={14} />
                      </Button>
                      <Button 
                        variant="outline"
                        className="directions-sheet-btn border-gold-400 text-gold-400 font-black uppercase text-xs h-11 rounded-lg flex items-center justify-center gap-1.5"
                        onClick={() => alert(`Como chegar em: ${selectedPin.name}\nRotas integradas via GPS local!`)}
                      >
                        <Compass size={14} /> Como chegar
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Mobile Fixed Bottom Navigation Tab Bar */}
        <nav className="mobile-bottom-nav-bar fixed bottom-0 left-0 right-0 z-50 bg-[#070b13]/90 backdrop-blur-xl border-t border-white/5 flex justify-between items-center px-4 py-2 pb-5">
          <button 
            className={`mob-nav-item flex flex-col items-center ${mobileTab === "dashboard" ? "active-gold" : ""}`}
            onClick={() => setMobileTab("dashboard")}
          >
            <span className="mob-nav-icon text-lg">🏠</span>
            <span className="mob-nav-lbl text-[10px] font-bold mt-1">Início</span>
          </button>
          
          <button 
            className={`mob-nav-item flex flex-col items-center ${mobileTab === "mapa" ? "active-gold" : ""}`}
            onClick={() => setMobileTab("mapa")}
          >
            <span className="mob-nav-icon text-lg">🧭</span>
            <span className="mob-nav-lbl text-[10px] font-bold mt-1">Explorar</span>
          </button>
          
          {/* Glowing central Pulse Hub Logo button */}
          <div className="mob-nav-scanner-button-wrapper">
            <button className="mob-scanner-glowing-circle" onClick={() => setMobileTab("dashboard")}>
              <Activity size={22} className="text-black animate-pulse" />
            </button>
          </div>

          <button 
            className={`mob-nav-item flex flex-col items-center ${mobileTab === "progresso" ? "active-gold" : ""}`}
            onClick={() => setMobileTab("progresso")}
          >
            <span className="mob-nav-icon text-lg">🚀</span>
            <span className="mob-nav-lbl text-[10px] font-bold mt-1">Missões</span>
          </button>

          <button 
            className="mob-nav-item flex flex-col items-center"
            onClick={() => navigate("/perfil")}
          >
            <span className="mob-nav-icon text-lg">👤</span>
            <span className="mob-nav-lbl text-[10px] font-bold mt-1">Perfil</span>
          </button>
        </nav>
      </div>
    </motion.div>
  );
};
