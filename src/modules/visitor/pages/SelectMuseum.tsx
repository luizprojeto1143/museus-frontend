import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext";
import { LanguageSwitcher } from "../../../components/LanguageSwitcher";
import {
  MapPin, Search, Compass,
  ArrowRight, Star
} from "lucide-react";
import "./SelectMuseum.css";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  type?: "MUSEUM" | "PRODUCER" | "CULTURAL_SPACE";
  coverImageUrl?: string;
  latitude?: number;
  longitude?: number;
  openingHours?: string;
  address?: string;
  // Computed client-side
  distance?: number;
  isOpen?: boolean;
}

export const SelectMuseum: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, token, updateSession } = useAuth();

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "MUSEUM" | "PRODUCER">("ALL");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

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

  // 2. Load Tenants
  useEffect(() => {
    loadTenants();
  }, []);

  // 3. Filter & Sort by Distance
  useEffect(() => {
    filterAndSortTenants();
  }, [searchTerm, activeFilter, tenants, userLocation]);

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
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  const filterAndSortTenants = () => {
    let result = tenants.map(t => {
      // Calculate dynamic properties
      let distance = undefined;
      if (userLocation && t.latitude && t.longitude) {
        distance = calculateDistance(userLocation.lat, userLocation.lng, t.latitude, t.longitude);
      }

      // Simple logic for Open/Closed (placeholder, real logic needs parsing openingHours string)
      const isOpen = true;

      return { ...t, distance, isOpen };
    });

    // Filter by Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(lower) ||
        t.slug.toLowerCase().includes(lower) ||
        t.address?.toLowerCase().includes(lower)
      );
    }

    // Filter by Type
    if (activeFilter !== "ALL") {
      result = result.filter(t => t.type === activeFilter);
    }

    // Sort by Distance (if available)
    if (userLocation) {
      result.sort((a, b) => {
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        return 0;
      });
    }

    setFilteredTenants(result);
  };

  const handleSelect = async (tenant: Tenant) => {
    if (isAuthenticated && token) {
      // Auth flow for switching tenants
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
          updateSession(data.accessToken, data.role, data.tenantId, data.name);
          navigate("/");
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }

    // Default / Unauth flow
    navigate("/register", { state: { tenantId: tenant.id, tenantName: tenant.name } });
  };

  const formatDistance = (dist?: number) => {
    if (dist === undefined) return null;
    if (dist < 1) return `${(dist * 1000).toFixed(0)}m`;
    return `${dist.toFixed(1)}km`;
  };

  return (
    <div className="discovery-page">
      {/* HERO SECTION */}
      <header className="discovery-hero">
        <div className="discovery-overlay"></div>
        <div className="discovery-hero-content">
          {/* Header Top Bar - Fixed styling for 'embolada' issue */}
          <div className="discovery-top-bar">
            <div className="brand-pill">
              <Compass size={16} className="text-[var(--accent-gold)]" />
              <span>Cultura Viva Discovery</span>
            </div>
            <LanguageSwitcher />
          </div>

          <h1 className="hero-title mt-16">
            Descubra o <span className="text-gradient">Patrimônio Vivo</span>
          </h1>
          <p className="hero-subtitle">
            Explore museus, teatros e experiências culturais exclusivas na sua cidade.
          </p>

          {/* SEARCH BAR */}
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="O que você procura hoje?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button className="search-btn">Buscar</button>
          </div>

          {/* FILTERS */}
          <div className="filters-container">
            <button
              className={`filter-pill ${activeFilter === "ALL" ? "active" : ""}`}
              onClick={() => setActiveFilter("ALL")}
            >
              Todos
            </button>
            <button
              className={`filter-pill ${activeFilter === "MUSEUM" ? "active" : ""}`}
              onClick={() => setActiveFilter("MUSEUM")}
            >
              🏛 Museus
            </button>
            <button
              className={`filter-pill ${activeFilter === "PRODUCER" ? "active" : ""}`}
              onClick={() => setActiveFilter("PRODUCER")}
            >
              🎭 Produtoras
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="discovery-main">
        <div className="section-header">
          <h2>
            {userLocation ? "Experiências Perto de Você" : "Experiências em Destaque"}
          </h2>
          {userLocation ? (
            <span className="location-badge success">
              <MapPin size={14} /> Localização Ativa
            </span>
          ) : (
            <span className="location-badge warning">
              <MapPin size={14} /> Ative a localização
            </span>
          )}
        </div>

        {loading ? (
          <div className="loading-grid">
            {[1, 2, 3].map(i => <div key={i} className="skeleton-card"></div>)}
          </div>
        ) : (
          <div className="discovery-grid">
            {filteredTenants.map(tenant => (
              <div key={tenant.id} className="discovery-card" onClick={() => handleSelect(tenant)}>
                <div className="card-image-wrapper">
                  <img
                    src={tenant.coverImageUrl || "https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=800&auto=format&fit=crop"}
                    alt={tenant.name}
                    className="card-image"
                  />
                  <div className="card-badges">
                    {tenant.type === 'PRODUCER' && <span className="badge-producer">Produtora</span>}
                    {tenant.type === 'MUSEUM' && <span className="badge-museum">Museu</span>}
                    {/* Status logic can be refined later */}
                    <span className={`badge-status open`}>Aberto</span>
                  </div>
                </div>

                <div className="card-content">
                  <h3 className="card-title">{tenant.name}</h3>

                  <div className="card-meta">
                    <div className="meta-item">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      <span>4.8</span>
                    </div>
                    {tenant.distance !== undefined && (
                      <div className="meta-item">
                        <MapPin size={14} />
                        <span>{formatDistance(tenant.distance)}</span>
                      </div>
                    )}
                  </div>

                  <p className="card-description">
                    {tenant.address || "Endereço não informado"}
                  </p>

                  <button className="card-cta">
                    Visitar <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredTenants.length === 0 && !loading && (
          <div className="empty-state">
            <Compass size={48} strokeWidth={1} />
            <h3>Nenhum resultado encontrado</h3>
            <p>Tente buscar por outro termo ou categoria.</p>
          </div>
        )}
      </main>
    </div>
  );
};
