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

interface Tenant {
  id: string;
  name: string;
  slug: string;
  type?: "MUSEUM" | "PRODUCER" | "CULTURAL_SPACE" | "ARCHITECTURAL_LANDMARK" | "CITY";
  coverImageUrl?: string;
  latitude?: number;
  longitude?: number;
  openingHours?: string;
  address?: string;
  mission?: string;
  // Computed client-side
  distance?: number;
  isOpen?: boolean;
}

export const SelectMuseum: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, token, updateSession, isGuest, enterAsGuest } = useAuth();
  const [searchParams] = useSearchParams();
  const isRegisterMode = searchParams.get("mode") === "register";

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedLandmark, setSelectedLandmark] = useState<Tenant | null>(null);

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
      await loadTenants();
      const selectId = searchParams.get("select");
      if (selectId) {
        // We'll wait until tenants are loaded
      }
    }
    init();
  }, []);

  useEffect(() => {
    const selectId = searchParams.get("select");
    if (selectId && tenants.length > 0) {
      const found = tenants.find(t => t.id === selectId);
      if (found) setSelectedLandmark(found);
    }
  }, [searchParams, tenants]);

  const loadTenants = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL as string;
      const res = await fetch(baseUrl + "/tenants/public");
      const data = await res.json();
      setTenants(data);
    } catch (err) {
      console.error("Error loading tenants", err);
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

  const filteredAndSortedTenants = useMemo(() => {
    let result = tenants.map(t => {
      let distance = undefined;
      if (userLocation && t.latitude && t.longitude) {
        distance = calculateDistance(userLocation.lat, userLocation.lng, t.latitude, t.longitude);
      }
      return { ...t, distance };
    });

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(lower) ||
        t.slug.toLowerCase().includes(lower) ||
        t.address?.toLowerCase().includes(lower)
      );
    }

    if (activeFilter !== "ALL") {
      result = result.filter(t => t.type === activeFilter);
    }

    if (userLocation) {
      result.sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
    }

    return result;
  }, [tenants, searchTerm, activeFilter, userLocation]);

  const nearestTenants = useMemo(() => {
    if (!userLocation) return [];
    return [...filteredAndSortedTenants]
      .filter(t => t.distance !== undefined && t.distance < 5) // Within 5km
      .slice(0, 3);
  }, [filteredAndSortedTenants, userLocation]);

  const handleSelect = async (tenant: Tenant) => {
    // If it's a landmark, show detail instead of entering
    if (tenant.type === "ARCHITECTURAL_LANDMARK") {
      setSelectedLandmark(tenant);
      return;
    }

    if (isAuthenticated && token && !isGuest) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL as string;
        const res = await fetch(baseUrl + "/auth/switch-tenant", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ targetTenantId: tenant.id })
        });

        if (res.ok) {
          const data = await res.json();
          updateSession(data.accessToken, data.refreshToken || "", data.role, data.tenantId, data.name);
          navigate("/home");
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (isRegisterMode) {
      navigate("/register", { state: { tenantId: tenant.id, tenantName: tenant.name } });
      return;
    }

    enterAsGuest(tenant.id);
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
                { id: "MUSEUM", label: "Museus", icon: <Theater size={14} /> },
                { id: "ARCHITECTURAL_LANDMARK", label: "Monumentos", icon: <Landmark size={14} /> },
                { id: "CITY", label: "Cidades", icon: <Navigation size={14} /> }
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
      {userLocation && nearestTenants.length > 0 && !searchTerm && (
        <section className="pulse-radar-section">
          <h2 className="pulse-section-title">
            <Navigation size={18} className="text-blue-400" /> Próximo a Você
          </h2>
          <div className="pulse-radar-grid">
            {nearestTenants.map(t => (
              <div key={t.id} className="pulse-radar-card" onClick={() => handleSelect(t)}>
                <div className="radar-dist">{formatDistance(t.distance)}</div>
                <div className="radar-info">
                  <h4>{t.name}</h4>
                  <span>{t.type === 'ARCHITECTURAL_LANDMARK' ? 'Monumento' : 'Equipamento'}</span>
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
          <p>{filteredAndSortedTenants.length} locais encontrados</p>
        </div>

        {loading ? (
          <div className="pulse-loading">
            <div className="pulse-loader"></div>
          </div>
        ) : (
          <div className="pulse-grid">
            {filteredAndSortedTenants.map(tenant => (
              <div
                key={tenant.id}
                className={`pulse-card ${tenant.type === 'ARCHITECTURAL_LANDMARK' ? 'monument-style' : ''}`}
                onClick={() => handleSelect(tenant)}
              >
                <div className="pulse-card-media">
                  <img
                    src={tenant.coverImageUrl || "https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=800&auto=format&fit=crop"}
                    alt={tenant.name}
                  />
                  <div className="pulse-card-tag">
                    {tenant.type === 'ARCHITECTURAL_LANDMARK' ? <Landmark size={12} /> : <Theater size={12} />}
                    {tenant.type}
                  </div>
                </div>

                <div className="pulse-card-body">
                  <h3 className="pulse-card-title">{tenant.name}</h3>
                  <div className="pulse-card-meta">
                    <div className="meta-pill">
                      <MapPin size={12} /> {tenant.distance ? formatDistance(tenant.distance) : "Explore"}
                    </div>
                    <div className="meta-pill">
                      <Star size={12} className="text-yellow-400 fill-yellow-400" /> 4.9
                    </div>
                  </div>
                  <p className="pulse-card-excerpt">
                    {tenant.address || "Betim - MG"}
                  </p>
                  <div className="pulse-card-footer">
                    <button className="pulse-btn-visit">
                      {tenant.type === 'ARCHITECTURAL_LANDMARK' ? 'Ver História' : 'Entrar no Museu'}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredAndSortedTenants.length === 0 && !loading && (
          <div className="pulse-empty">
            <Compass size={64} strokeWidth={1} className="opacity-20 mb-4" />
            <p>Nenhuma frequência encontrada neste setor.</p>
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
              <img src={selectedLandmark.coverImageUrl || ""} alt={selectedLandmark.name} />
              <div className="landmark-overlay-content">
                <div className="landmark-tag">PONTO HISTÓRICO</div>
                <h2>{selectedLandmark.name}</h2>
              </div>
            </div>
            <div className="landmark-content">
              <div className="landmark-quick-info">
                <div className="info-item">
                  <MapPin size={16} />
                  <span>{selectedLandmark.address}</span>
                </div>
                <div className="info-item">
                  <Clock size={16} />
                  <span>{selectedLandmark.openingHours || "Visitação Livre"}</span>
                </div>
              </div>

              <div className="landmark-story">
                <h3>Fatos e História</h3>
                <p>{selectedLandmark.mission || "Este local é um marco da arquitetura e cultura local, preservando memórias e histórias que moldaram a identidade da região."}</p>
              </div>

              <div className="landmark-actions">
                <button className="landmark-btn-entry" onClick={() => { enterAsGuest(selectedLandmark.id); navigate("/home"); }}>
                  Explorar Digitalmente <Zap size={18} />
                </button>
                <button className="landmark-btn-secondary" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${selectedLandmark.latitude},${selectedLandmark.longitude}`, '_blank')}>
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

