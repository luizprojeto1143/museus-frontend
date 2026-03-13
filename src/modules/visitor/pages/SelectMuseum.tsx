import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext";
import { LanguageSwitcher } from "../../../components/LanguageSwitcher";
import {
  MapPin, Search, Compass,
  ArrowRight, Star, Info,
  Zap, Navigation, X,
  Clock, Landmark, Theater
} from "lucide-react";
import "./SelectMuseum.css";

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
  missao?: string;
  descricao?: string;
  // Computed client-side
  distance?: number;
}

export const SelectMuseum: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, token, updateSession, isGuest, enterAsGuest, role, name } = useAuth();
  const [searchParams] = useSearchParams();
  const isRegisterMode = searchParams.get("mode") === "register";

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedLandmark, setSelectedLandmark] = useState<Equipamento | null>(null);

  // 1. Get User Location on Mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Geolocation denied or error:", error);
        }
      );
    }
  }, []);

  // 2. Load Tenants & Handle Auto-selection
  useEffect(() => {
    async function init() {
      await loadEquipamentos();
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
    try {
      const baseUrl = import.meta.env.VITE_API_URL as string;
      const res = await fetch(baseUrl + "/equipamentos/public");
      const data = await res.json();
      setEquipamentos(data);
    } catch (err) {
      console.error("Error loading equipments", err);
    } finally {
      setLoading(false);
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
        e.slug.toLowerCase().includes(lower) ||
        e.endereco?.toLowerCase().includes(lower)
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
    if (isAuthenticated && token && !isGuest) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL as string;
        // Reutilizamos switch-tenant mas agora focando em equipamento contextualmente se necessario,
        // ou apenas atualizamos localmente o ID
        updateSession(token, "", role || "visitor", equip.tenantId, name, equip.id);
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

    enterAsGuest(equip.tenantId, equip.id);
    navigate("/home");
  };

  const formatDistance = (dist?: number) => {
    if (dist === undefined) return null;
    if (dist < 1) return `${(dist * 1000).toFixed(0)}m`;
    return `${dist.toFixed(1)}km`;
  };

  return (
    <div className="discovery-page pulse-hub">
      {/* 🔮 PULSE BACKGROUND ELEMENTS */}
      <div className="pulse-particles"></div>

      {/* HEADER TOP BAR */}
      <div className="pulse-top-bar">
        <div className="pulse-brand">
          <Zap size={20} className="pulse-icon-animated" />
          <span>Pulse Hub</span>
        </div>
        <div className="pulse-top-actions">
          {isAuthenticated && <div className="user-indicator">Online</div>}
          <LanguageSwitcher absolute={false} />
        </div>
      </div>

      {/* HERO / RADAR SECTION */}
      <header className="pulse-hero">
        <div className="pulse-hero-content">
          <div className="pulse-aura"></div>
          <h1 className="pulse-title">
            O Pulso da <span className="pulse-gradient">Cultura</span>
          </h1>
          <p className="pulse-subtitle">
            Descubra monumentos históricos e museus em tempo real.
          </p>

          {/* SMART SEARCH */}
          <div className="pulse-search-wrapper">
            <div className="pulse-search-container">
              <Search className="pulse-search-icon" size={20} />
              <input
                type="text"
                placeholder="Qual história você quer viver?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pulse-search-input"
              />
              <div className="pulse-search-glass"></div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="pulse-filters">
              {[
                { id: "ALL", label: "Todos", icon: <Compass size={14} /> },
                { id: "museu", label: "Museus", icon: <Theater size={14} /> },
                { id: "teatro", label: "Teatros", icon: <Landmark size={14} /> },
                { id: "centro_cultural", label: "Centros", icon: <Navigation size={14} /> }
              ].map(f => (
                <button
                  key={f.id}
                  className={`pulse-filter-chip ${activeFilter === f.id ? "active" : ""}`}
                  onClick={() => setActiveFilter(f.id)}
                >
                  {f.icon} {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* PROXIMITY RADAR (If location active) */}
      {userLocation && nearestEquipamentos.length > 0 && !searchTerm && (
        <section className="pulse-radar-section">
          <h2 className="pulse-section-title">
            <Navigation size={18} className="text-blue-400" /> Próximo a Você
          </h2>
          <div className="pulse-radar-grid">
            {nearestEquipamentos.map(e => (
              <div key={e.id} className="pulse-radar-card" onClick={() => handleSelect(e)}>
                <div className="radar-dist">{formatDistance(e.distance)}</div>
                <div className="radar-info">
                  <h4>{e.nome}</h4>
                  <span>{e.tipo}</span>
                </div>
                <Zap size={16} className="radar-icon" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MAIN CONTENT GRID */}
      <main className="pulse-main">
        <div className="pulse-main-header">
          <h2>{searchTerm ? `Resultados para "${searchTerm}"` : "Explorar Tudo"}</h2>
          <p>{filteredAndSortedEquipamentos.length} equipamentos encontrados</p>
        </div>

        {loading ? (
          <div className="pulse-loading">
            <div className="pulse-loader"></div>
          </div>
        ) : (
          <div className="pulse-grid">
            {filteredAndSortedEquipamentos.map(equip => (
              <div
                key={equip.id}
                className="pulse-card"
                onClick={() => handleSelect(equip)}
              >
                <div className="pulse-card-media">
                  <img
                    src={equip.fotoCapaUrl || "https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=800&auto=format&fit=crop"}
                    alt={equip.nome}
                  />
                  <div className="pulse-card-tag">
                    <Theater size={12} />
                    {equip.tipo}
                  </div>
                </div>

                <div className="pulse-card-body">
                  <h3 className="pulse-card-title">{equip.nome}</h3>
                  <div className="pulse-card-meta">
                    <div className="meta-pill">
                      <MapPin size={12} /> {equip.distance ? formatDistance(equip.distance) : "Explore"}
                    </div>
                    <div className="meta-pill">
                      <Star size={12} className="text-yellow-400 fill-yellow-400" /> 4.9
                    </div>
                  </div>
                  <p className="pulse-card-excerpt">
                    {equip.endereco || "Betim - MG"}
                  </p>
                  <div className="pulse-card-footer">
                    <button className="pulse-btn-visit">
                      Entrar no Local
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredAndSortedEquipamentos.length === 0 && !loading && (
          <div className="pulse-empty">
            <Compass size={64} strokeWidth={1} className="opacity-20 mb-4" />
            <p>Nenhum equipamento encontrado neste setor.</p>
          </div>
        )}
      </main>

      {/* LANDMARK DETAIL MODAL */}
      {selectedLandmark && (
        <div className="landmark-modal-overlay" onClick={() => setSelectedLandmark(null)}>
          <div className="landmark-modal-card" onClick={e => e.stopPropagation()}>
            <button className="landmark-close" onClick={() => setSelectedLandmark(null)}>
              <X size={24} />
            </button>
            <div className="landmark-hero">
              <img src={selectedLandmark.fotoCapaUrl || ""} alt={selectedLandmark.nome} />
              <div className="landmark-overlay-content">
                <div className="landmark-tag">{selectedLandmark.tipo.toUpperCase()}</div>
                <h2>{selectedLandmark.nome}</h2>
              </div>
            </div>
            <div className="landmark-content">
              <div className="landmark-quick-info">
                <div className="info-item">
                  <MapPin size={16} />
                  <span>{selectedLandmark.endereco}</span>
                </div>
                <div className="info-item">
                  <Clock size={16} />
                  <span>{selectedLandmark.horarios?.seg || "Visitação Livre"}</span>
                </div>
              </div>

              <div className="landmark-story">
                <h3>Sobre o Local</h3>
                <p>{selectedLandmark.missao || selectedLandmark.descricao || "Este local é um marco da cultura local, preservando memórias e histórias que moldaram a identidade da região."}</p>
              </div>

              <div className="landmark-actions">
                <button className="landmark-btn-entry" onClick={() => { enterAsGuest(selectedLandmark.tenantId, selectedLandmark.id); navigate("/home"); }}>
                  Entrar no Espaço <Zap size={18} />
                </button>
                <button className="landmark-btn-secondary" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${selectedLandmark.lat},${selectedLandmark.lng}`, '_blank')}>
                  Como Chegar <Navigation size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

