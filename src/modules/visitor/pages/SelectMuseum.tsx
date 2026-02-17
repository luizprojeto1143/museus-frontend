import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext";
import { LanguageSwitcher } from "../../../components/LanguageSwitcher";
import {
  MapPin, Search, Filter, Compass, Calendar,
  ArrowRight, Star, Clock, Info
} from "lucide-react";
import "./SelectMuseum.css";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  type?: "MUSEUM" | "PRODUCER" | "CULTURAL_SPACE";
  city?: string;
  coverUrl?: string;
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
  const [activeFilter, setActiveFilter] = useState<"ALL" | "MUSEUM" | "PRODUCER" | "EVENT">("ALL");

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    filterTenants();
  }, [searchTerm, activeFilter, tenants]);

  const loadTenants = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL as string;
      const res = await fetch(baseUrl + "/tenants/public");
      const data = await res.json();

      // Mock data enhancement for demo/premium feel (if API doesn't return these yet)
      const enhancedData = data.map((t: any) => ({
        ...t,
        coverUrl: t.coverUrl || undefined,
        isOpen: true // Mock status for now
      }));

      setTenants(enhancedData);
    } catch (err) {
      console.error("Error loading tenants", err);
    } finally {
      setLoading(false);
    }
  };

  const filterTenants = () => {
    let result = tenants;

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(lower) ||
        t.slug.toLowerCase().includes(lower) ||
        t.city?.toLowerCase().includes(lower)
      );
    }

    if (activeFilter !== "ALL") {
      result = result.filter(t => t.type === activeFilter);
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

  return (
    <div className="discovery-page">
      {/* HERO SECTION */}
      <header className="discovery-hero">
        <div className="discovery-overlay"></div>
        <div className="discovery-hero-content">
          <div className="d-flex justify-between w-full p-6 absolute top-0 left-0 z-10">
            <div className="brand-pill">
              <Compass size={16} className="text-[var(--accent-gold)]" />
              <span>Cultura Viva Discovery</span>
            </div>
            <LanguageSwitcher />
          </div>

          <h1 className="hero-title">
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
          <h2>Experiências em Destaque</h2>
          <span className="location-badge">
            <MapPin size={14} /> Rio de Janeiro, BR
          </span>
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
                    src={tenant.coverUrl || "https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=800&auto=format&fit=crop"}
                    alt={tenant.name}
                    className="card-image"
                  />
                  <div className="card-badges">
                    {tenant.type === 'PRODUCER' && <span className="badge-producer">Produtora</span>}
                    {tenant.type === 'MUSEUM' && <span className="badge-museum">Museu</span>}
                    <span className={`badge-status ${tenant.isOpen ? 'open' : 'closed'}`}>
                      {tenant.isOpen ? 'Aberto' : 'Fechado'}
                    </span>
                  </div>
                </div>

                <div className="card-content">
                  <h3 className="card-title">{tenant.name}</h3>

                  <div className="card-meta">
                    <div className="meta-item">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      <span>4.8 (120)</span>
                    </div>
                    <div className="meta-item">
                      <MapPin size={14} />
                      <span>2.5 km</span>
                    </div>
                  </div>

                  <p className="card-description">
                    Experiência cultural imersiva com acervo digital e guias interativos.
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
