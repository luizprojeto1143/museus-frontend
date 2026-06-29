import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../api/client";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Search, MapPin, ChevronRight, Plus } from "lucide-react";
import "./CitySearch.css";

interface City {
  id: string;
  slug: string;
  nome: string;
  estado?: string;
  logoUrl?: string;
  bannerUrl?: string;
  equipamentosCount?: number;
  status?: "active" | "coming_soon";
}

const BRAZIL_STATES = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT",
  "PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"
];

export const CitySearch: React.FC = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");

  const fetchCities = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/public/cities?limit=100");
      const data = res.data;
      setCities(Array.isArray(data) ? data : data.data || []);
    } catch (_err) {
      setCities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const filtered = cities.filter(c => {
    const matchSearch =
      c.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.estado || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchState = !selectedState || c.estado === selectedState;
    return matchSearch && matchState;
  });

  const active = filtered.filter(c => c.status !== "coming_soon");
  const comingSoon = filtered.filter(c => c.status === "coming_soon");

  return (
    <>
      <Helmet>
        <title>Explorar Cidades | Cultura Viva</title>
        <meta name="description" content="Explore cidades culturais brasileiras. Encontre museus, equipamentos culturais, eventos e muito mais." />
      </Helmet>

      <div className="city-search-page">
        {/* Header */}
        <motion.div
          className="cs-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1>Explorar Cidades</h1>
          <p>Encontre cidades com patrimônio cultural no mapa</p>

          {/* Busca */}
          <div className="cs-search-wrapper">
            <Search size={18} className="cs-search-icon" />
            <input
              id="cs-search-input"
              type="text"
              className="cs-search-input"
              placeholder="Buscar por cidade..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>

          {/* Filtro por Estado */}
          <div className="cs-filters">
            <button
              className={`cs-state-btn ${!selectedState ? "active" : ""}`}
              onClick={() => setSelectedState("")}
            >
              Todos
            </button>
            {BRAZIL_STATES.map(uf => (
              <button
                key={uf}
                className={`cs-state-btn ${selectedState === uf ? "active" : ""}`}
                onClick={() => setSelectedState(prev => prev === uf ? "" : uf)}
              >
                {uf}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Resultados */}
        <div className="cs-results">
          {loading ? (
            <div className="cs-grid">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="cs-card cs-skeleton" />
              ))}
            </div>
          ) : active.length === 0 && comingSoon.length === 0 ? (
            <div className="cs-empty">
              <MapPin size={56} />
              <h3>Nenhuma cidade encontrada</h3>
              <p>Ainda não temos essa cidade cadastrada. Quer indicar?</p>
              <button className="cs-suggest-btn" id="cs-suggest-city">
                <Plus size={18} />
                Indicar minha cidade
              </button>
            </div>
          ) : (
            <>
              {active.length > 0 && (
                <section>
                  <h2 className="cs-group-title">Disponíveis ({active.length})</h2>
                  <div className="cs-grid">
                    {active.map((city, i) => (
                      <motion.button
                        key={city.id}
                        id={`cs-city-${city.slug}`}
                        className="cs-card"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.04 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/cidades/${city.slug}`)}
                      >
                        {city.bannerUrl ? (
                          <img src={city.bannerUrl} alt={city.nome} className="cs-card-banner" />
                        ) : (
                          <div className="cs-card-banner-placeholder">
                            <MapPin size={32} />
                          </div>
                        )}
                        <div className="cs-card-body">
                          {city.logoUrl && (
                            <img src={city.logoUrl} alt="" className="cs-card-logo" />
                          )}
                          <div className="cs-card-info">
                            <strong>{city.nome}</strong>
                            {city.estado && <small>{city.estado}</small>}
                            {city.equipamentosCount !== undefined && (
                              <span className="cs-card-count">{city.equipamentosCount} equipamentos</span>
                            )}
                          </div>
                          <ChevronRight size={18} className="cs-card-arrow" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </section>
              )}

              {comingSoon.length > 0 && (
                <section style={{ marginTop: 32 }}>
                  <h2 className="cs-group-title">Em breve ({comingSoon.length})</h2>
                  <div className="cs-grid">
                    {comingSoon.map((city, i) => (
                      <div
                        key={city.id}
                        className="cs-card cs-card-coming-soon"
                      >
                        <div className="cs-card-banner-placeholder">
                          <MapPin size={32} />
                        </div>
                        <div className="cs-card-body">
                          <div className="cs-card-info">
                            <strong>{city.nome}</strong>
                            {city.estado && <small>{city.estado}</small>}
                          </div>
                          <span className="cs-coming-badge">Em breve</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        {/* CTA Indicar Cidade */}
        <div className="cs-footer-cta">
          <p>Não encontrou sua cidade?</p>
          <button className="cs-suggest-btn" id="cs-footer-suggest">
            <Plus size={18} />
            Indicar minha cidade
          </button>
        </div>
      </div>
    </>
  );
};
