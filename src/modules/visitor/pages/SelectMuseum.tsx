import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext";
import { LanguageSwitcher } from "../../../components/LanguageSwitcher";
import { 
  MapPin, Search, Compass, 
  ArrowRight, Star, Info, 
  Zap, Navigation, X, 
  Clock, Landmark, Theater,
  Calendar, Sparkles, Map as MapIcon
} from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";
import "./SelectMuseum.css";
import { useGeoFencing } from "../../visitor/context/GeoFencingProvider";
import { 
  Button, 
  Card, 
  AnimateIn, 
  ParticleBackground,
  Badge
} from "@/components/ui";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { motion } from "framer-motion";

interface Equipamento {
  id: string;
  tenantId: string;
  nome: string;
  slug: string;
  tipo: string;
  fotoCapaUrl?: string;
  lat?: number;
  lng?: number;
  horarios?: any;
  endereco?: string;
  cidade?: string;
  cityId?: string | null;
  missao?: string;
  descricao?: string;
  address?: string;
  // Computed client-side
  distance?: number;
}

interface Evento {
  id: string;
  title: string;
  category: string;
  startDate: string;
  coverImage?: string;
  tenantName?: string;
  location?: string;
  equipamentoNome?: string;
}

export const SelectMuseum: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, updateSession, isGuest, enterAsGuest, role, name } = useAuth();
  const [searchParams] = useSearchParams();
  const isRegisterMode = searchParams.get("mode") === "register";

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [selectedLandmark, setSelectedLandmark] = useState<Equipamento | null>(null);
  const [events, setEvents] = useState<Evento[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const { userLocation } = useGeoFencing();

  // Load Tenants & Handle Auto-selection
  useEffect(() => {
    async function init() {
      await loadEquipamentos();
      await loadEvents();
    }
    init();
  }, []);

  useEffect(() => {
    const selectId = searchParams.get("select");
    if (selectId && equipamentos.length > 0) {
      const found = equipamentos.find(e => e.id === selectId);
      if (found) setSelectedLandmark(found);
    }
  }, [searchParams, equipamentos]);

  const loadEquipamentos = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const baseUrl = import.meta.env.VITE_API_URL as string;
      const res = await fetch(baseUrl + "/equipamentos/public");
      
      if (!res.ok) {
        throw new Error(`Servidor respondeu com erro ${res.status}`);
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        setEquipamentos(data);
      } else {
        console.error("Data is not an array", data);
        setEquipamentos([]);
      }
    } catch (err) {
      console.error("Error loading equipments", err);
      setErrorMsg("O servidor está momentaneamente fora do ar. Estamos restabelecendo a conexão!");
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    setLoadingEvents(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL as string;
      const res = await fetch(baseUrl + "/events/public");
      if (res.ok) {
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error loading events", err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filteredAndSortedEquipamentos = useMemo(() => {
    let result = equipamentos.map(e => {
      let distance = undefined;
      if (userLocation && e.lat && e.lng) {
        distance = calculateDistance(userLocation.lat, userLocation.lng, e.lat, e.lng);
      }
      return { ...e, distance };
    });

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(e =>
        e.nome.toLowerCase().includes(lower) ||
        (e.slug && e.slug.toLowerCase().includes(lower)) ||
        (e.address && e.address.toLowerCase().includes(lower))
      );
    }

    if (activeFilter !== "ALL") {
      result = result.filter(e => e.tipo === activeFilter);
    }

    if (userLocation) {
      result.sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
    }

    return result;
  }, [equipamentos, searchTerm, activeFilter, userLocation]);

  const nearestEquipamentos = useMemo(() => {
    if (!userLocation) return [];
    return [...filteredAndSortedEquipamentos]
      .filter(e => e.distance !== undefined && e.distance < 5) // Within 5km
      .slice(0, 3);
  }, [filteredAndSortedEquipamentos, userLocation]);

  const handleSelect = async (equip: Equipamento) => {
    // Se logado, atualiza sessao
    if (isAuthenticated && !isGuest) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL as string;
        // Reutilizamos switch-tenant mas agora focando em equipamento contextualmente se necessario,
        // ou apenas atualizamos localmente o ID
        updateSession(role || "visitor", equip.tenantId, name, equip.id, equip.cityId || null);
        navigate("/home");
        return;
      } catch (err) {
        console.error(err);
      }
    }

    if (isRegisterMode) {
      navigate("/register", { state: { tenantId: equip.tenantId, equipamentoId: equip.id, tenantName: equip.nome } });
      return;
    }

    enterAsGuest(equip.tenantId, equip.id, equip.cityId || null);
    navigate("/home");
  };

  const formatDistance = (dist?: number) => {
    if (dist === undefined) return null;
    if (dist < 1) return `${(dist * 1000).toFixed(0)}m`;
    return `${dist.toFixed(1)}km`;
  };

  return (
    <div className="discovery-page pulse-hub bg-[var(--bg-page)] min-h-screen relative overflow-x-hidden">
      {/* 🔮 PULSE BACKGROUND ELEMENTS */}
      <ParticleBackground />
      {/* Vignette effect to fade out the edges and highlight center */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_0%,_var(--bg-page)_80%)]" />

      {/* HEADER TOP BAR */}
      <nav className="pulse-top-bar flex justify-between items-center px-8 py-6 sticky top-0 z-[100] backdrop-blur-xl bg-[var(--bg-overlay)] border-b border-[var(--border-subtle)]">
        <div className="pulse-brand flex items-center gap-3 font-black text-xl tracking-tighter">
          <span className="text-[var(--fg-main)]">{t("visitor.selectMuseum.hubTitle")}</span>
        </div>
        <div className="pulse-top-actions flex items-center gap-4">
          {isAuthenticated && <Badge variant="outline" className="text-green-400 border-green-400/30 bg-green-400/5">Online</Badge>}
          <LanguageSwitcher absolute={false} />
          <ThemeToggle />
        </div>
      </nav>

      {/* HERO / RADAR SECTION */}
      <header className="pulse-hero py-24 px-8 text-center relative z-10">
        <AnimateIn variant="fadeUp">
          <div className="pulse-hero-content max-w-4xl mx-auto">
            <h1 className="pulse-title">
              {t("visitor.selectMuseum.radarTitle").split(" ").slice(0, -1).join(" ")} <span className="pulse-gradient italic drop-shadow-sm">{t("visitor.selectMuseum.radarTitle").split(" ").pop()}</span>
            </h1>
            <p className="pulse-subtitle">
              {t("visitor.selectMuseum.radarSubtitle")}
            </p>

            {/* SMART SEARCH */}
            <div className="pulse-search-wrapper max-w-2xl mx-auto space-y-8">
              <div className="relative group transition-all duration-500">
                <div className="absolute inset-0 bg-[var(--accent-primary)]/10 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                <div className="pulse-search-container">
                  <Search className="text-[var(--accent-primary)] mr-4" size={24} />
                  <input
                    type="text"
                    placeholder={t("visitor.selectMuseum.searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pulse-search-input"
                  />
                </div>
              </div>

              {/* QUICK ACTIONS */}
              <div className="pulse-filters flex flex-wrap justify-center gap-3">
                {[
                  { id: "ALL", label: t("visitor.selectMuseum.filters.all"), icon: <Compass size={16} /> },
                  { id: "museu", label: t("visitor.selectMuseum.filters.museu"), icon: <Theater size={16} /> },
                  { id: "teatro", label: t("visitor.selectMuseum.filters.teatro"), icon: <Landmark size={16} /> },
                  { id: "centro_cultural", label: t("visitor.selectMuseum.filters.centro_cultural"), icon: <Navigation size={16} /> },
                  { id: "EVENTOS", label: "Agenda Cultural", icon: <Calendar size={16} /> }
                ].map(f => (
                  <Button
                    key={f.id}
                    variant={activeFilter === f.id ? "primary" : "glass"}
                    size="sm"
                    onClick={() => setActiveFilter(f.id)}
                    className="rounded-full px-6 py-2 h-auto"
                    leftIcon={f.icon}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </AnimateIn>

        {/* 🎫 CULTURAL AGENDA SLIDER */}
        {!searchTerm && activeFilter !== "EVENTOS" && events.length > 0 && (
          <AnimateIn variant="fadeUp" className="mt-16 w-full max-w-7xl mx-auto overflow-hidden">
            <div className="flex items-center justify-between mb-8 px-4">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <Sparkles className="text-gold-400" size={20} /> 
                Agenda Cultural
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setActiveFilter("EVENTOS")} className="text-gold-400 hover:text-gold-300">
                Ver Tudo
              </Button>
            </div>
            
            <div className="flex gap-6 overflow-x-auto pb-8 px-4 snap-x no-scrollbar">
              {events.slice(0, 8).map(event => (
                <motion.div 
                  key={event.id}
                  whileHover={{ y: -10 }}
                  className="flex-shrink-0 w-80 snap-start"
                >
                  <Card 
                    className="h-full border-white/5 bg-white/5 backdrop-blur-md overflow-hidden cursor-pointer group"
                    onClick={() => navigate(`/events`)}
                  >
                    <div className="relative h-44">
                      <img 
                        src={event.coverImage || "https://images.unsplash.com/photo-1514525253361-bee8718a7439?q=80&w=800&auto=format&fit=crop"} 
                        alt={event.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-4 left-4 bg-gold-400 text-black text-[10px] font-black px-2 py-1 rounded uppercase">
                        {event.category}
                      </div>
                    </div>
                    <div className="p-5">
                      <h4 className="font-bold text-white line-clamp-1 mb-2 group-hover:text-gold-400 transition-colors">
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar size={12} className="text-gold-400" />
                        {new Date(event.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        <span className="opacity-30">•</span>
                        <MapIcon size={12} className="text-gold-400" />
                        {event.equipamentoNome || "Espaço Cultural"}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimateIn>
        )}
      </header>

      {/* PROXIMITY RADAR (If location active) */}
      {userLocation && nearestEquipamentos.length > 0 && !searchTerm && (
        <section className="px-8 py-12 max-w-7xl mx-auto relative z-10">
          <AnimateIn variant="fadeUp">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--fg-tertiary)] mb-8 flex items-center gap-3">
              <Navigation size={18} className="text-[var(--accent-primary)] animate-pulse" /> {t("visitor.selectMuseum.proximityTitle")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {nearestEquipamentos.map(e => (
                <Card 
                  animated
                  className="p-6 cursor-pointer border-[var(--accent-primary)]/10 group bg-[var(--accent-primary)]/5 backdrop-blur-md"
                  onClick={() => handleSelect(e)}
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center font-mono font-bold text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 group-hover:scale-110 transition-transform">
                      {formatDistance(e.distance)}
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--fg-main)] mb-1">{e.nome}</h4>
                      <span className="text-xs uppercase tracking-widest text-[var(--fg-tertiary)]">{e.tipo}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </AnimateIn>
        </section>
      )}

      {/* MAIN CONTENT GRID */}
      <main className="px-8 py-20 max-w-7xl mx-auto relative z-10">
        <div className="flex justify-between items-end mb-12 border-b border-[var(--border-subtle)] pb-8">
          <div>
            <h2 className="text-3xl font-black tracking-tighter mb-2">
              {activeFilter === "EVENTOS" ? "Toda a Programação" : searchTerm ? t("visitor.selectMuseum.resultsTitle", { term: searchTerm }) : t("visitor.selectMuseum.exploreAll")}
            </h2>
            <p className="text-[var(--fg-tertiary)] font-medium">
              {activeFilter === "EVENTOS" ? `${events.length} eventos encontrados` : t("visitor.selectMuseum.foundCount", { count: filteredAndSortedEquipamentos.length })}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-12 mb-12 bg-red-400/5 border border-red-400/20 rounded-3xl text-center">
             <Info className="mx-auto mb-4 text-red-400" size={48} />
             <h3 className="text-xl font-bold mb-2">{t("visitor.selectMuseum.connectionError.title")}</h3>
             <p className="text-[var(--fg-tertiary)]">{t("visitor.selectMuseum.connectionError.message")}</p>
             <Button variant="outline" className="mt-6 border-red-400/30 text-red-400" onClick={() => loadEquipamentos()}>{t("visitor.selectMuseum.connectionError.retry")}</Button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <div className="w-12 h-12 border-t-2 border-[var(--accent-primary)] rounded-full animate-spin"></div>
          </div>
        ) : activeFilter === "EVENTOS" ? (
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {events.map(event => (
              <motion.div key={event.id} variants={staggerItem}>
                <Card
                  animated glow
                  className="h-full flex flex-col group cursor-pointer overflow-hidden border-white/5"
                  onClick={() => navigate(`/events`)}
                >
                  <div className="relative h-60 overflow-hidden">
                    <img
                      src={event.coverImage || "https://images.unsplash.com/photo-1514525253361-bee8718a7439?q=80&w=800&auto=format&fit=crop"}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <Badge className="absolute top-4 left-4 bg-black/60 shadow-xl" variant="glass">
                      <Calendar size={12} className="mr-2" />
                      {event.category}
                    </Badge>
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold mb-3 tracking-tight text-[var(--fg-main)] group-hover:text-gold-400 transition-colors line-clamp-1">{event.title}</h3>
                    <div className="flex gap-3 mb-6">
                      <Badge variant="outline" className="border-gold-400 text-gold-400 bg-gold-400/5">
                        <Clock size={12} className="mr-1" /> 
                        {new Date(event.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                      </Badge>
                    </div>
                    <p className="text-[var(--fg-secondary)] text-sm leading-relaxed line-clamp-2 mb-8 flex-1">
                      {event.equipamentoNome || "Espaço Cultural de Betim"} • {event.location || "Presencial"}
                    </p>
                    <Button 
                      variant="primary"
                      className="w-full py-6 text-base"
                      rightIcon={<ArrowRight size={20} />}
                    >
                      Ver Detalhes do Evento
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredAndSortedEquipamentos.map(equip => (
              <motion.div key={equip.id} variants={staggerItem}>
                <Card
                  animated glow
                  className="h-full flex flex-col group cursor-pointer overflow-hidden border-white/5"
                  onClick={() => handleSelect(equip)}
                >
                  <div className="relative h-60 overflow-hidden">
                    <img
                      src={equip.fotoCapaUrl || "https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=800&auto=format&fit=crop"}
                      alt={equip.nome}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                    />
                    <Badge className="absolute top-4 left-4 bg-black/60 shadow-xl" variant="glass">
                      <Theater size={12} className="mr-2" />
                      {equip.tipo}
                    </Badge>
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold mb-3 tracking-tight text-[var(--fg-main)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-1">{equip.nome}</h3>
                    <div className="flex gap-3 mb-6">
                      <Badge variant="outline" className="border-gold-400 text-gold-400 bg-gold-400/5">
                        <MapPin size={12} className="mr-1" /> {equip.distance ? formatDistance(equip.distance) : t("visitor.home.explore")}
                      </Badge>
                      <Badge variant="outline" className="border-yellow-500/50 text-yellow-500 bg-yellow-500/5">
                        <Star size={12} className="mr-1 fill-current" /> 4.9
                      </Badge>
                    </div>
                    <p className="text-[var(--fg-secondary)] text-sm leading-relaxed line-clamp-2 mb-8 flex-1">
                      {equip.endereco || "Localização não informada • Minas Gerais"}
                    </p>
                    <Button 
                      variant="primary"
                      className="w-full shadow-lg shadow-gold-500/10 group-hover:shadow-gold-500/30 py-6 text-base"
                      rightIcon={<ArrowRight size={20} />}
                    >
                      {t("visitor.selectMuseum.enterLocation")}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {filteredAndSortedEquipamentos.length === 0 && !loading && (
          <div className="pulse-empty">
            <Compass size={64} strokeWidth={1} className="opacity-20 mb-4" />
            <p>{t("visitor.selectMuseum.emptyState")}</p>
          </div>
        )}
      </main>

      {/* LANDMARK DETAIL MODAL */}
      {selectedLandmark && (
        <div className="landmark-modal-overlay fixed inset-0 z-[1000] bg-black/95 backdrop-blur-lg p-4 flex items-center justify-center animate-in fade-in duration-300" onClick={() => setSelectedLandmark(null)}>
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden relative border-white/10 shadow-2xl animate-in slide-in-from-bottom-8 duration-500" onClick={e => e.stopPropagation()}>
            <Button 
                variant="glass" 
                size="sm" 
                className="absolute top-6 right-6 z-20 rounded-full w-12 h-12 p-0"
                onClick={() => setSelectedLandmark(null)}
            >
              <X size={24} />
            </Button>
            
            <div className="relative h-80">
              <img src={selectedLandmark.fotoCapaUrl || ""} alt={selectedLandmark.nome} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-page)] via-transparent to-transparent"></div>
              <div className="absolute bottom-10 left-10">
                <Badge className="bg-[var(--accent-primary)] text-black mb-4 font-black">{selectedLandmark.tipo.toUpperCase()}</Badge>
                <h2 className="text-5xl font-black tracking-tighter text-[var(--fg-main)]">{selectedLandmark.nome}</h2>
              </div>
            </div>

            <div className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-[var(--fg-secondary)]">
                    <MapPin size={20} className="text-[var(--accent-primary)]" />
                    <span className="font-medium">{selectedLandmark.endereco}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[var(--fg-secondary)]">
                    <Clock size={20} className="text-[var(--accent-primary)]" />
                    <span className="font-medium">{selectedLandmark.horarios?.seg || t("visitor.selectMuseum.modal.visitationFree")}</span>
                  </div>
                </div>
                
                <div className="bg-[var(--bg-surface-hover)] p-6 rounded-2xl border border-[var(--border-subtle)]">
                  <h3 className="text-sm font-black uppercase tracking-widest text-[var(--accent-primary)] mb-3">{t("visitor.selectMuseum.modal.historyTitle")}</h3>
                  <p className="text-[var(--fg-secondary)] text-sm leading-relaxed italic">
                    {selectedLandmark.missao || selectedLandmark.descricao || t("visitor.selectMuseum.modal.historyFallback")}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                    className="flex-1 h-14 text-lg font-bold"
                    onClick={() => { enterAsGuest(selectedLandmark.tenantId, selectedLandmark.id, selectedLandmark.cityId || null); navigate("/home"); }}
                    rightIcon={<Zap size={20} />}
                >
                  {t("visitor.selectMuseum.modal.enter")}
                </Button>
                <Button
                    variant="outline"
                    className="flex-1 h-14 text-lg font-bold"
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${selectedLandmark.lat},${selectedLandmark.lng}`, '_blank')}
                    rightIcon={<Navigation size={20} />}
                >
                  {t("visitor.selectMuseum.modal.directions")}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

