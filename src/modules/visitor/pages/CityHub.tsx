import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";
import { getFullUrl } from "../../../utils/url";
import { toast } from "react-hot-toast";
import { 
  MapPin, Calendar, Compass, Award, Star, Search, Flame, Map, 
  BookOpen, Bell, Shield, Users, User, ArrowRight, Scan, 
  ChevronRight, Landmark, HelpCircle, Utensils, Headphones, Monitor
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Card, Badge, Button } from "@/components/ui";
import { pageVariants, staggerItem } from "@/lib/motion";
import "./CityHub.css";

interface CityEquipment {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  worksCount: number;
  eventsCount: number;
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
}

export const CityHub: React.FC = () => {
  const { t } = useTranslation();
  const { role, name: authName } = useAuth();
  const navigate = useNavigate();

  const [cities, setCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileTab, setMobileTab] = useState<"inicio" | "explorar" | "missoes" | "perfil">("inicio");
  const [hubSettings, setHubSettings] = useState<{ title: string; subtitle: string; imageUrl: string } | null>(null);
  const [visitor, setVisitor] = useState<{ xp: number; achievements: number; stamps: number; name: string; email: string } | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (role === "master") { navigate("/master", { replace: true }); return; }
    if (role === "admin") { navigate("/admin", { replace: true }); return; }
  }, [role, navigate]);

  useEffect(() => {
    const fetchHubData = async () => {
      try {
        setLoading(true);
        const [res, eventsRes] = await Promise.all([
          api.get("/analytics/municipal-pwa/summary"),
          api.get("/events", { params: { discovery: "true" } }).catch(() => ({ data: { data: [] } }))
        ]);
        if (res.data) {
          setCities(res.data.cities || []);
          setHubSettings(res.data.hubSettings || null);
          setVisitor(res.data.visitor || null);
        }
        if (eventsRes.data) {
          setEvents(eventsRes.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching city hub data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHubData();
  }, []);

  const filteredCities = cities.filter(city => 
    city.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    { id: "museus", label: "Museus", icon: "🏛️" },
    { id: "arte", label: "Arte Pública", icon: "🗽" },
    { id: "eventos", label: "Eventos", icon: "📅" },
    { id: "patrimonio", label: "Patrimônio", icon: "🏛️" },
    { id: "teatros", label: "Teatros", icon: "🎭" },
    { id: "gastronomia", label: "Gastronomia", icon: "🍴" },
    { id: "roteiros", label: "Roteiros", icon: "🧭", mobileOnly: true },
    { id: "guias", label: "Guias e Áudios", icon: "🎧", mobileOnly: true }
  ];

  // Dynamic statistics calculations
  const citiesVisited = cities.filter(c => c.explorationPercent > 0).length;
  const museumsExplored = cities.reduce((acc, city) => acc + (city.visitedEquipmentsCount || 0), 0);
  const totalExploration = cities.length > 0 ? Math.round(cities.reduce((acc, city) => acc + city.explorationPercent, 0) / cities.length) : 0;

  // Dynamic Level calculations
  const xp = visitor?.xp || 0;
  const level = Math.floor(xp / 1000) + 1;
  const xpInCurrentLevel = xp % 1000;
  const xpNeededForNextLevel = 1000;
  const progressPercent = Math.min(Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100), 100);

  let levelTitle = "Explorador Iniciante";
  if (level >= 10) levelTitle = "Explorador Lendário";
  else if (level >= 5) levelTitle = "Explorador Avançado";
  else if (level >= 2) levelTitle = "Explorador Ativo";

  return (
    <div className="pulse-hub-root-container">
      <Helmet>
        <title>Pulse Hub | Cultura Viva</title>
        <meta name="description" content="Bem-vindo ao ecossistema Cultura Viva. Explore cidades históricas, museus e acumule conquistas." />
      </Helmet>

      {/* 💻 DESKTOP CONTAINER (Viewport >= 1024px) */}
      <div className="desktop-layout-grid hidden lg:grid">
        {/* Left Sidebar Navigation */}
        <aside className="hub-sidebar">
          <div className="sidebar-logo-container">
            <img src="/logo-culturaviva.jpg" alt="Cultura Viva" className="sidebar-logo-img" onError={(e) => {(e.target as HTMLImageElement).style.display = 'none'}} />
            <div className="sidebar-logo-text">
              <h2 className="logo-title font-black text-gold-400">CULTURA VIVA</h2>
              <span className="logo-subtitle">PATRIMÔNIO • TECNOLOGIA • INCLUSÃO</span>
            </div>
          </div>

          <nav className="sidebar-nav-links">
            <button className="sidebar-nav-item active">
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
              <span className="sidebar-nav-icon">🚀</span> Missões
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
          </div>
        </aside>

        {/* Central Dashboard Scroll Area */}
        <main className="hub-main-dashboard">
          {/* Top Bar Header */}
          <header className="dashboard-top-bar flex justify-between items-center mb-8">
            <div className="search-bar-container max-w-xl flex-1 mr-4">
              <div className="search-bar-wrapper">
                <Search size={18} className="text-gray-400 mr-3" />
                <input 
                  type="text" 
                  placeholder="Buscar cidades, museus, obras e experiências..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                <div className="flex flex-col text-left">
                  <span className="user-profile-name font-bold">{authName || "Visitante"}</span>
                  <span className="user-profile-title font-semibold text-xs text-gold-400">{levelTitle}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Hero Welcome banner */}
          <div 
            className="dashboard-hero-banner cursor-pointer" 
            onClick={() => {
              if (cities.length === 0) {
                toast.error("Cidade em manutenção, logo irá ser liberada!!");
              }
            }}
            style={hubSettings?.imageUrl ? { backgroundImage: `radial-gradient(circle at 0% 0%, rgba(234, 179, 8, 0.05) 0%, transparent 60%), url(${getFullUrl(hubSettings.imageUrl)})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
          >
            <div className="hero-banner-glow"></div>
            <div className="hero-banner-content">
              <span className="hero-welcome-lbl">Bem-vindo ao</span>
              <div className="hero-banner-title-flex flex items-center gap-4">
                <h1 className="hero-title-main font-black">
                  {hubSettings?.title ? hubSettings.title.split(" ").slice(0, -1).join(" ") : "Pulse"}{" "}
                  <span className="text-gold-400">{hubSettings?.title ? hubSettings.title.split(" ").pop() || "Hub" : "Hub"}</span>
                </h1>
                <div className="heartbeat-pulse-line">
                  <span className="heartbeat-pulse"></span>
                </div>
              </div>
              <p className="hero-subtitle-desc" style={{ whiteSpace: 'pre-line' }}>
                {hubSettings?.subtitle || `Conecte-se com a cultura.\nExplore. Descubra. Viva experiências únicas.`}
              </p>
            </div>
          </div>

          {/* Cidades em Destaque Rows */}
          <section className="dashboard-section-row mb-10">
            <div className="section-title-flex flex justify-between items-center mb-6">
              <h3 className="section-title font-bold text-white border-l-2 border-gold-400 pl-3">Cidades em destaque</h3>
              <button className="text-xs text-gold-400 hover:underline">Ver todas &gt;</button>
            </div>

            <div className="dashboard-cities-carousel">
              {filteredCities.length > 0 ? (
                filteredCities.map((c, idx) => (
                  <div 
                    key={c.id} 
                    className="carousel-city-card"
                    onClick={() => navigate(`/cidades/${c.slug}`)}
                  >
                    <div className="carousel-city-img-wrapper">
                      <img 
                        src={getFullUrl(c.coverImageUrl || "")} 
                        alt={c.name} 
                        className="carousel-city-img" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=600";
                        }}
                      />
                      <div className="carousel-city-overlay"></div>
                      <div className="carousel-city-museum-badge">🏛️</div>
                    </div>
                    <div className="carousel-city-info flex flex-col p-4 text-left">
                      <h4 className="carousel-city-name font-bold text-white text-base">{c.name}</h4>
                      <span className="carousel-city-exp-count text-xs text-gray-400">
                        {c.totalExperiences} experiências
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div 
                  className="carousel-city-card cursor-pointer"
                  onClick={() => toast.error("Cidade em manutenção, logo irá ser liberada!!")}
                >
                  <div className="carousel-city-img-wrapper">
                    <img 
                      src="https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=600" 
                      alt="Novas Cidades" 
                      className="carousel-city-img opacity-50" 
                    />
                    <div className="carousel-city-overlay"></div>
                    <div className="carousel-city-museum-badge">🏛️</div>
                  </div>
                  <div className="carousel-city-info flex flex-col p-4 text-left">
                    <h4 className="carousel-city-name font-bold text-white text-base">Novas Cidades</h4>
                    <span className="carousel-city-exp-count text-xs text-gold-400 font-bold">
                      Cidade em manutenção, logo irá ser liberada!!
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Categories & Map Widgets Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
            {/* Category Box */}
            <section className="dashboard-category-card">
              <div className="section-title-flex flex justify-between items-center mb-6">
                <h3 className="section-title font-bold text-white border-l-2 border-gold-400 pl-3">Explore por categorias</h3>
                <button className="text-xs text-gold-400 hover:underline">Ver todas &gt;</button>
              </div>

              <div className="dashboard-categories-grid">
                {categories.filter(cat => !cat.mobileOnly).map(cat => (
                  <Card key={cat.id} className="category-compact-item" onClick={() => navigate("/select-museum")}>
                    <span className="category-icon-emoji">{cat.icon}</span>
                    <h4 className="category-item-label font-bold text-gray-300 text-xs">{cat.label}</h4>
                  </Card>
                ))}
              </div>
            </section>

            {/* Map Widget Box */}
            <section className="dashboard-map-widget-card" onClick={() => navigate("/mapa")}>
              <div className="section-title-flex flex justify-between items-center mb-6">
                <h3 className="section-title font-bold text-white border-l-2 border-gold-400 pl-3">Mapa Cultural</h3>
                <button className="text-xs text-gold-400 hover:underline">Ver mapa &gt;</button>
              </div>

              <div className="map-widget-vector-container">
                <div className="map-vector-overlay"></div>
                <div className="map-glowing-pin pin-1"></div>
                <div className="map-glowing-pin pin-2"></div>
                <div className="map-glowing-pin pin-3"></div>
                <div className="map-glowing-pin pin-4"></div>
                <div className="map-glowing-pin pin-5"></div>
                <div className="map-glowing-pin pin-6"></div>
              </div>
            </section>
          </div>

          {/* Seu progresso cultural row */}
          <section className="dashboard-cultural-progress-banner">
            <div className="progress-banner-header flex justify-between items-center mb-6">
              <h3 className="section-title font-bold text-white border-l-2 border-gold-400 pl-3">Seu progresso cultural</h3>
            </div>

            <div className="progress-banner-flex">
              <div className="progress-circular-widget flex items-center gap-4">
                <div className="circular-progress-ring-gold">
                  <div className="circular-inner">
                    <span className="circular-pct font-black">{totalExploration}%</span>
                    <span className="circular-lbl font-semibold">Exploração</span>
                  </div>
                </div>
              </div>

              <div className="progress-numeric-stats">
                <div className="progress-stat-col text-left">
                  <h4 className="stat-number font-black text-white text-2xl">{citiesVisited}</h4>
                  <span className="stat-lbl font-semibold text-xs text-gray-400">Cidades visitadas</span>
                </div>
                <div className="progress-stat-col text-left">
                  <h4 className="stat-number font-black text-white text-2xl">{museumsExplored}</h4>
                  <span className="stat-lbl font-semibold text-xs text-gray-400">Museus explorados</span>
                </div>
                <div className="progress-stat-col text-left">
                  <h4 className="stat-number font-black text-white text-2xl">{visitor?.stamps || 0}</h4>
                  <span className="stat-lbl font-semibold text-xs text-gray-400">Obras descobertas</span>
                </div>
                <div className="progress-stat-col text-left">
                  <h4 className="stat-number font-black text-white text-2xl">{visitor?.achievements || 0}</h4>
                  <span className="stat-lbl font-semibold text-xs text-gray-400">Conquistas</span>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Right Sidebar Panel */}
        <aside className="hub-right-panel">
          {/* Seu Nivel Hexagon Card */}
          <section className="dashboard-right-level-card mb-8">
            <h4 className="right-panel-title border-l-2 border-gold-400 pl-3">Seu Nível</h4>
            
            <div className="level-hexagon-wrapper flex flex-col items-center py-6">
              <div className="hexagon-gold-glow">
                <div className="hexagon-inner flex flex-col items-center justify-center">
                  <Star size={20} className="fill-current text-gold-400 mb-1" />
                  <span className="hexagon-level-text font-black text-sm">Nível {level}</span>
                </div>
              </div>
              <span className="level-badge-subtitle font-black text-gold-400 text-sm mt-3">{levelTitle}</span>
            </div>

            <div className="level-progress-bar-wrapper mb-6">
              <div className="level-progress-track">
                <div className="level-progress-fill" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <div className="level-progress-labels flex justify-between text-xs text-gray-400 mt-2 font-bold">
                <span>{xpInCurrentLevel} / {xpNeededForNextLevel} XP</span>
              </div>
            </div>

            <div className="level-quick-stats grid grid-cols-3 gap-2 border-t border-white/5 pt-4 text-center">
              <div>
                <h5 className="quick-stat-val font-black text-white text-sm">{visitor?.achievements || 0}</h5>
                <span className="quick-stat-lbl text-[10px] text-gray-500 font-bold uppercase">Missões</span>
              </div>
              <div>
                <h5 className="quick-stat-val font-black text-white text-sm">{visitor?.stamps || 0}</h5>
                <span className="quick-stat-lbl text-[10px] text-gray-500 font-bold uppercase">Badges</span>
              </div>
              <div>
                <h5 className="quick-stat-val font-black text-white text-sm">CV</h5>
                <span className="quick-stat-lbl text-[10px] text-gray-500 font-bold uppercase">Selo</span>
              </div>
            </div>
          </section>

          {/* Proximos Eventos Slider */}
          <section className="dashboard-right-events-card mb-8">
            <div className="flex justify-between items-center mb-6">
              <h4 className="right-panel-title border-l-2 border-gold-400 pl-3">Próximos eventos</h4>
              <button className="text-[10px] text-gold-400 hover:underline uppercase font-bold" onClick={() => navigate("/agenda")}>Ver todas</button>
            </div>

            <div className="right-events-vertical-list space-y-4">
              {events.length === 0 ? (
                <div className="text-center py-4 text-xs text-gray-500 font-semibold">
                  Nenhum evento agendado
                </div>
              ) : (
                events.slice(0, 3).map((evt, idx) => {
                  const dateObj = new Date(evt.startDate);
                  const day = dateObj.getDate().toString().padStart(2, '0');
                  const month = dateObj.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
                  return (
                    <div key={evt.id} className="vertical-event-item flex items-center gap-4 cursor-pointer" onClick={() => navigate(`/agenda`)}>
                      <div className="event-date-calendar-badge flex flex-col items-center justify-center">
                        <span className="event-date-num font-black text-white text-sm leading-none">{day}</span>
                        <span className="event-date-month font-bold text-gold-400 text-[9px] uppercase leading-none mt-1">{month}</span>
                      </div>
                      <div className="event-item-info flex-1 text-left">
                        <h5 className="event-item-title font-bold text-white text-xs leading-snug line-clamp-1">{evt.title}</h5>
                        <span className="event-item-loc text-[10px] text-gray-400 block mt-0.5">{evt.location || evt.tenant?.name || ""}</span>
                      </div>
                      <Badge variant="glass" className="event-item-tag-badge bg-gold-400/10 text-gold-400 text-[9px] font-bold px-2 py-0.5 border border-gold-400/20">
                        Evento
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Continue Explorando Box */}
          {cities.length > 0 && cities[0].equipments?.length > 0 && (
            <section className="dashboard-right-continue-card">
              <h4 className="right-panel-title border-l-2 border-gold-400 pl-3 mb-6">Continue explorando</h4>
              
              <div 
                className="continue-exploring-widget-card flex items-center gap-4"
                onClick={() => navigate(`/cidades/${cities[0].slug}`)}
              >
                <div className="continue-exploring-img-wrapper">
                  <img 
                    src={getFullUrl(cities[0].equipments[0].coverImageUrl || cities[0].coverImageUrl)} 
                    alt={cities[0].equipments[0].name} 
                    className="continue-exploring-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=300";
                    }}
                  />
                </div>
                <div className="continue-widget-info flex-1 text-left">
                  <h5 className="continue-widget-title font-bold text-white text-xs line-clamp-1">{cities[0].equipments[0].name}</h5>
                  <span className="continue-widget-loc text-[10px] text-gray-400 block mt-0.5">{cities[0].name} - MG</span>
                  
                  <div className="continue-progress-bar-small mt-2">
                    <div className="continue-bar-track">
                      <div className="continue-bar-fill" style={{ width: `${cities[0].explorationPercent}%` }}></div>
                    </div>
                    <span className="continue-pct-lbl text-[9px] text-gold-400 font-bold block mt-1">{cities[0].explorationPercent}% explorado</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gold-400 flex-shrink-0" />
              </div>
            </section>
          )}
        </aside>
      </div>

      {/* 📱 MOBILE VIEW CONTAINER (Viewport < 1024px) */}
      <div className="mobile-view-layout lg:hidden flex flex-col min-h-screen pb-24">
        {/* Top Header Mobile */}
        <header className="mobile-top-bar flex justify-between items-center px-6 py-4 bg-transparent relative z-20">
          <div className="mobile-brand-logo flex items-center gap-2">
            <img src="/logo-culturaviva.jpg" alt="Logo" className="mobile-logo-circle" onError={(e) => {(e.target as HTMLImageElement).style.display = 'none'}} />
            <div className="flex flex-col text-left">
              <h2 className="mobile-brand-title font-black text-gold-400 leading-none">CULTURA VIVA</h2>
              <span className="mobile-brand-subtitle text-[8px] text-gray-400 tracking-widest leading-none mt-1">PATRIMÔNIO • TECNOLOGIA</span>
            </div>
          </div>

          <div className="mobile-top-actions flex items-center gap-3">
            <button className="mobile-bell-btn relative">
              <Bell size={18} className="text-gray-400" />
              <span className="bell-badge-pulse-small"></span>
            </button>
            <div className="mobile-avatar-circle" onClick={() => navigate("/perfil")}>
              {authName ? authName.charAt(0).toUpperCase() : "V"}
            </div>
          </div>
        </header>

        {/* Dynamic Tab Switching Content */}
        <div className="mobile-dynamic-content-area flex-1 px-6">
          {mobileTab === "inicio" && (
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Welcome text hero */}
              <div 
                className="mobile-hero-welcome text-left pt-2 cursor-pointer" 
                onClick={() => {
                  if (cities.length === 0) {
                    toast.error("Cidade em manutenção, logo irá ser liberada!!");
                  }
                }}
                style={hubSettings?.imageUrl ? { backgroundImage: `linear-gradient(to bottom, rgba(7, 9, 14, 0.5), #07090e 95%), url(${getFullUrl(hubSettings.imageUrl)})`, backgroundSize: 'cover', backgroundPosition: 'center', padding: '1.5rem', borderRadius: '1.5rem' } : undefined}
              >
                <span className="mobile-welcome-lbl text-xs text-gray-400 block mb-1">Bem-vindo ao</span>
                <div className="mobile-welcome-title-flex flex items-center gap-3">
                  <h1 className="mobile-welcome-title font-black text-3xl">
                    {hubSettings?.title ? hubSettings.title.split(" ").slice(0, -1).join(" ").toUpperCase() : "PULSE"}{" "}
                    <span className="text-gold-400">{hubSettings?.title ? hubSettings.title.split(" ").pop()?.toUpperCase() || "HUB" : "HUB"}</span>
                  </h1>
                  <div className="heartbeat-pulse-line">
                    <span className="heartbeat-pulse"></span>
                  </div>
                </div>
                <p className="mobile-welcome-sub text-xs text-gray-400 mt-2" style={{ whiteSpace: 'pre-line' }}>
                  {hubSettings?.subtitle || `Conecte-se com a cultura. Explore. Descubra.\nViva experiências únicas.`}
                </p>
              </div>

              {/* Mobile Search Bar inside with QR Scan */}
              <div className="mobile-search-wrapper">
                <div className="mobile-search-container flex items-center justify-between">
                  <div className="flex items-center flex-1 mr-3">
                    <Search size={18} className="text-gray-400 mr-2" />
                    <input 
                      type="text" 
                      placeholder="Buscar museus, obras, eventos e experiências..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="mobile-search-input-field"
                    />
                  </div>
                  <Scan size={18} className="text-gold-400 flex-shrink-0 cursor-pointer" onClick={() => navigate("/scanner")} />
                </div>
              </div>

              {/* Mobile Radar Columns Progress Dashboard */}
              <div className="mobile-radial-stats-row">
                <div className="mobile-stat-box flex flex-col items-center text-center">
                  <span className="mobile-stat-icon">🏛️</span>
                  <span className="mobile-stat-num font-black text-white text-base">{museumsExplored}</span>
                  <span className="mobile-stat-lbl text-[9px] text-gray-500 font-bold uppercase mt-1">Museus visitados</span>
                </div>
                <div className="mobile-stat-box flex flex-col items-center text-center">
                  <span className="mobile-stat-icon">📅</span>
                  <span className="mobile-stat-num font-black text-white text-base">{events.length}</span>
                  <span className="mobile-stat-lbl text-[9px] text-gray-500 font-bold uppercase mt-1">Eventos ativos</span>
                </div>
                <div className="mobile-stat-box flex flex-col items-center text-center">
                  <span className="mobile-stat-icon">🖼️</span>
                  <span className="mobile-stat-num font-black text-white text-base">{visitor?.stamps || 0}</span>
                  <span className="mobile-stat-lbl text-[9px] text-gray-500 font-bold uppercase mt-1">Obras descobertas</span>
                </div>
                <div className="mobile-stat-box flex flex-col items-center text-center">
                  <span className="mobile-stat-icon">🏆</span>
                  <span className="mobile-stat-num font-black text-white text-base">{visitor?.achievements || 0}</span>
                  <span className="mobile-stat-lbl text-[9px] text-gray-500 font-bold uppercase mt-1">Conquistas</span>
                </div>
                <div className="mobile-stat-box flex flex-col items-center text-center">
                  <div className="mobile-progress-circle-donut">
                    <span className="donut-text font-black text-xs">{totalExploration}%</span>
                  </div>
                  <span className="mobile-stat-lbl text-[9px] text-gray-500 font-bold uppercase mt-1">Exploração geral</span>
                </div>
              </div>

              {/* Explore por Categorias Grid */}
              <div className="mobile-category-section text-left">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="mobile-section-heading font-black text-white text-sm uppercase tracking-wider">Explore por categorias</h3>
                  <button className="text-xs text-gold-400 font-bold" onClick={() => navigate("/select-museum")}>Ver todas &gt;</button>
                </div>
                <div className="mobile-categories-grid-flex">
                  {categories.map(cat => (
                    <Card key={cat.id} className="mobile-category-grid-item" onClick={() => navigate("/select-museum")}>
                      <span className="mob-cat-emoji">{cat.icon}</span>
                      <span className="mob-cat-name font-bold text-[10px] text-gray-300 mt-1">{cat.label}</span>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Em Destaque Card Slider */}
              <div className="mobile-featured-slider-section text-left">
                <h3 className="mobile-section-heading font-black text-white text-sm uppercase tracking-wider mb-4">Em Destaque</h3>
                
                {cities.length > 0 ? (
                  (() => {
                    const featuredCity = cities[0];
                    const firstEquip = featuredCity.equipments?.[0];
                    return (
                      <Card 
                        className="mobile-featured-highlight-card overflow-hidden relative border-white/5 bg-white/5"
                        onClick={() => navigate(`/cidades/${featuredCity.slug}`)}
                      >
                        <div className="mobile-featured-img-wrapper h-48 relative">
                          <img 
                            src={getFullUrl(firstEquip?.coverImageUrl || featuredCity.coverImageUrl || "")} 
                            alt={firstEquip?.name || featuredCity.name} 
                            className="mobile-featured-img object-cover w-full h-full"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?q=80&w=600";
                            }}
                          />
                          <div className="mobile-featured-img-overlay"></div>
                          <Badge variant="glass" className="absolute top-4 left-4 bg-gold-400/20 text-gold-400 border-gold-400/30 text-[9px] font-black uppercase tracking-wider">
                            Em Destaque
                          </Badge>
                        </div>

                        <div className="mobile-featured-card-info p-5">
                          <h4 className="mobile-featured-title font-black text-white text-lg">{firstEquip?.name || featuredCity.name}</h4>
                          <span className="mobile-featured-city-tag text-xs text-gold-400 font-bold block mt-1">{featuredCity.name} / MG</span>
                          <p className="mobile-featured-desc text-xs text-gray-400 mt-2 leading-relaxed">
                            Explore pontos culturais de relevância em {featuredCity.name}. Visite obras e colete conquistas exclusivas!
                          </p>

                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mobile-explore-btn-accent border-gold-400 text-gold-400 hover:bg-gold-400 hover:text-black mt-4 h-9 font-bold text-xs uppercase tracking-wider"
                            rightIcon={<ChevronRight size={14} />}
                          >
                            Explorar agora
                          </Button>
                        </div>
                      </Card>
                    );
                  })()
                ) : (
                  <Card 
                    className="mobile-featured-highlight-card overflow-hidden relative border-white/5 bg-white/5"
                    onClick={() => {
                      toast.error("Cidade em manutenção, logo irá ser liberada!!");
                    }}
                  >
                    <div className="mobile-featured-img-wrapper h-48 relative">
                      <img 
                        src="https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?q=80&w=600" 
                        alt="Cultura Viva" 
                        className="mobile-featured-img object-cover w-full h-full opacity-55"
                      />
                      <div className="mobile-featured-img-overlay"></div>
                      <Badge variant="glass" className="absolute top-4 left-4 bg-gold-400/20 text-gold-400 border-gold-400/30 text-[9px] font-black uppercase tracking-wider">
                        Em Manutenção
                      </Badge>
                    </div>

                    <div className="mobile-featured-card-info p-5">
                      <h4 className="mobile-featured-title font-black text-white text-lg">Novas Cidades</h4>
                      <span className="mobile-featured-city-tag text-xs text-gold-400 font-bold block mt-1">Cultura Viva / MG</span>
                      <p className="mobile-featured-desc text-xs text-gray-400 mt-2 leading-relaxed">
                        Novas cidades em manutenção, logo serão liberadas para exploração cultural em breve!
                      </p>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mobile-explore-btn-accent border-gold-400 text-gold-400 hover:bg-gold-400 hover:text-black mt-4 h-9 font-bold text-xs uppercase tracking-wider"
                        rightIcon={<ChevronRight size={14} />}
                      >
                        Explorar agora
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Mobile Pagination Dot slider indicators */}
                <div className="mobile-pagination-indicators-row flex justify-center gap-1.5 mt-4">
                  <span className="mob-dot active"></span>
                  <span className="mob-dot"></span>
                </div>
              </div>
            </motion.div>
          )}

          {mobileTab === "explorar" && (
            <div className="mobile-explorar-pane py-4 text-left">
              <h3 className="font-black text-lg text-white mb-4">Explorar Cidades e Museus</h3>
              <div className="space-y-4">
                {filteredCities.length > 0 ? (
                  filteredCities.map(c => (
                    <Card 
                      key={c.id} 
                      className="p-4 bg-white/5 border-white/5 flex gap-4 cursor-pointer" 
                      onClick={() => navigate(`/cidades/${c.slug}`)}
                    >
                      <img 
                        src={getFullUrl(c.coverImageUrl)} 
                        alt={c.name} 
                        className="w-16 h-16 rounded-xl object-cover" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=600";
                        }}
                      />
                      <div className="flex-1 flex flex-col justify-center">
                        <h4 className="font-bold text-white text-sm">{c.name}</h4>
                        <span className="text-xs text-gray-400">{c.totalExperiences} experiências</span>
                      </div>
                      <ChevronRight size={18} className="text-gold-400 self-center" />
                    </Card>
                  ))
                ) : (
                  <Card 
                    className="p-4 bg-white/5 border-white/5 flex gap-4 cursor-pointer" 
                    onClick={() => toast.error("Cidade em manutenção, logo irá ser liberada!!")}
                  >
                    <div className="w-16 h-16 rounded-xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-gold-400 text-xl font-bold">
                      🏛️
                    </div>
                    <div className="flex-1 flex flex-col justify-center text-left">
                      <h4 className="font-bold text-white text-sm">Cidades em Breve</h4>
                      <span className="text-xs text-gold-400 font-bold">Cidade em manutenção, logo irá ser liberada!!</span>
                    </div>
                    <ChevronRight size={18} className="text-gold-400 self-center" />
                  </Card>
                )}
              </div>
            </div>
          )}

          {mobileTab === "missoes" && (
            <div className="mobile-missoes-pane py-4 text-left">
              <h3 className="font-black text-lg text-white mb-4">Missões e Desafios</h3>
              <div className="space-y-4">
                <Card className="p-4 bg-white/5 border-white/5 flex gap-4" onClick={() => navigate("/desafios")}>
                  <div className="text-2xl">🥇</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-xs">Arqueólogo Municipal</h4>
                    <p className="text-[10px] text-gray-400 mt-1">Escaneie 3 obras de museus diferentes.</p>
                  </div>
                  <Badge variant="glass" className="bg-gold-400/10 text-gold-400 text-[10px] self-center">150 XP</Badge>
                </Card>
                <Card className="p-4 bg-white/5 border-white/5 flex gap-4" onClick={() => navigate("/desafios")}>
                  <div className="text-2xl">🥈</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-xs">Explorador de Festivais</h4>
                    <p className="text-[10px] text-gray-400 mt-1">Faça check-in em eventos ativos.</p>
                  </div>
                  <Badge variant="glass" className="bg-cyan-400/10 text-cyan-400 text-[10px] self-center">100 XP</Badge>
                </Card>
              </div>
            </div>
          )}

          {mobileTab === "perfil" && (
            <div className="mobile-perfil-pane py-4 text-left">
              <h3 className="font-black text-lg text-white mb-4">Seu Perfil Cultural</h3>
              <Card className="p-6 bg-white/5 border-white/5 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gold-400 text-black text-2xl font-black flex items-center justify-center mb-3">
                  {authName ? authName.charAt(0).toUpperCase() : "V"}
                </div>
                <h4 className="font-bold text-white text-lg">{authName || "Visitante"}</h4>
                <span className="text-xs text-gold-400 font-bold uppercase tracking-wider">{levelTitle}</span>
                <Button className="w-full mt-6" onClick={() => navigate("/perfil")}>Ver Perfil Completo</Button>
              </Card>
            </div>
          )}
        </div>

        {/* Mobile Fixed Bottom Navigation Tab Bar */}
        <nav className="mobile-bottom-nav-bar fixed bottom-0 left-0 right-0 z-50 bg-[#070b13]/90 backdrop-blur-xl border-t border-white/5 flex justify-between items-center px-4 py-2 pb-5">
          <button 
            className={`mob-nav-item flex flex-col items-center ${mobileTab === "inicio" ? "active-gold" : ""}`}
            onClick={() => setMobileTab("inicio")}
          >
            <span className="mob-nav-icon text-lg">🏠</span>
            <span className="mob-nav-lbl text-[9px] font-bold mt-0.5">Início</span>
          </button>
          <button 
            className={`mob-nav-item flex flex-col items-center ${mobileTab === "explorar" ? "active-gold" : ""}`}
            onClick={() => setMobileTab("explorar")}
          >
            <span className="mob-nav-icon text-lg">🧭</span>
            <span className="mob-nav-lbl text-[9px] font-bold mt-0.5">Explorar</span>
          </button>
          
          {/* Glowing central Scanner Button */}
          <div className="mob-nav-scanner-button-wrapper">
            <button className="mob-scanner-glowing-circle" onClick={() => navigate("/scanner")}>
              <Scan size={22} className="text-black" />
            </button>
          </div>

          <button 
            className={`mob-nav-item flex flex-col items-center ${mobileTab === "missoes" ? "active-gold" : ""}`}
            onClick={() => setMobileTab("missoes")}
          >
            <span className="mob-nav-icon text-lg">🏳️</span>
            <span className="mob-nav-lbl text-[9px] font-bold mt-0.5">Missões</span>
          </button>
          <button 
            className={`mob-nav-item flex flex-col items-center ${mobileTab === "perfil" ? "active-gold" : ""}`}
            onClick={() => setMobileTab("perfil")}
          >
            <span className="mob-nav-icon text-lg">👤</span>
            <span className="mob-nav-lbl text-[9px] font-bold mt-0.5">Perfil</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
