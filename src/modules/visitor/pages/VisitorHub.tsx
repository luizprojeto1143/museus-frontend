import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { MapPin, QrCode, Ticket, Star, ChevronRight, Search, Compass, Trophy, Calendar } from "lucide-react";
import "./VisitorHub.css";

interface City {
  id: string;
  slug: string;
  nome: string;
  estado?: string;
  logoUrl?: string;
  equipamentosCount?: number;
}

interface RecentVisit {
  id: string;
  equipamentoName: string;
  cityName: string;
  citySlug: string;
  equipamentoSlug: string;
  visitedAt: string;
}

interface ActiveTicket {
  id: string;
  eventTitle: string;
  eventDate: string;
  equipamentoName: string;
}

interface UserStats {
  xp: number;
  level: number;
  visitsCount: number;
  badgesCount: number;
  trailsCompleted: number;
}

export const VisitorHub: React.FC = () => {
  const navigate = useNavigate();
  const { name, role } = useAuth();

  const [cities, setCities] = useState<City[]>([]);
  const [recentVisits, setRecentVisits] = useState<RecentVisit[]>([]);
  const [activeTickets, setActiveTickets] = useState<ActiveTicket[]>([]);
  const [stats, setStats] = useState<UserStats>({ xp: 0, level: 1, visitsCount: 0, badgesCount: 0, trailsCompleted: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let citiesQuery = "/public/cities?limit=8";
      
      try {
        if ("geolocation" in navigator) {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
          });
          citiesQuery += `&lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`;
        }
      } catch {
        // Fallback to standard fetch without coordinates
      }

      const results = await Promise.allSettled([
        api.get(citiesQuery),
        api.get("/visitors/me/recent-visits?limit=3"),
        api.get("/visitors/me/active-tickets?limit=3"),
        api.get("/visitors/me/stats"),
      ]);

      if (results[0].status === "fulfilled") {
        const data = results[0].value.data;
        setCities(Array.isArray(data) ? data : data.data || []);
      }
      if (results[1].status === "fulfilled") {
        const data = results[1].value.data;
        setRecentVisits(Array.isArray(data) ? data : data.data || []);
      }
      if (results[2].status === "fulfilled") {
        const data = results[2].value.data;
        setActiveTickets(Array.isArray(data) ? data : data.data || []);
      }
      if (results[3].status === "fulfilled") {
        setStats(results[3].value.data || stats);
      }
    } catch (_err) {
      // Silently handle — UI shows empty states gracefully
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (role === "master") { navigate("/master", { replace: true }); return; }
    if (role === "admin") { navigate("/admin", { replace: true }); return; }
    fetchData();
  }, [role, navigate, fetchData]);

  const filteredCities = cities.filter(c =>
    c.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.estado || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const firstName = name?.split(" ")[0] || "Visitante";

  const levelProgress = (stats.xp % 1000) / 10; // % até próximo nível

  return (
    <>
      <Helmet>
        <title>Meu Hub Cultural | Cultura Viva</title>
        <meta name="description" content="Explore cidades, museus, obras e eventos culturais do Brasil. Seu hub cultural personalizado." />
      </Helmet>

      <div className="visitor-hub">
        {/* Header / Boas-vindas */}
        <motion.section
          className="hub-hero"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="hub-hero-content">
            <div className="hub-greeting">
              <h1>Olá, <span className="hub-name">{firstName}</span> 👋</h1>
              <p className="hub-subtitle">Sua jornada cultural começa aqui</p>
            </div>
            <div className="hub-level-badge">
              <div className="hub-level-circle">
                <Trophy size={16} />
                <span>Nv. {stats.level}</span>
              </div>
            </div>
          </div>

          {/* XP Bar */}
          <div className="hub-xp-bar-wrapper">
            <div className="hub-xp-info">
              <span>{stats.xp} XP</span>
              <span>{1000 - (stats.xp % 1000)} XP para o próximo nível</span>
            </div>
            <div className="hub-xp-bar">
              <motion.div
                className="hub-xp-fill"
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>

          {/* Stats rápidos */}
          <div className="hub-quick-stats">
            <div className="hub-stat">
              <Compass size={18} />
              <span>{stats.visitsCount}</span>
              <small>Visitas</small>
            </div>
            <div className="hub-stat">
              <Star size={18} />
              <span>{stats.badgesCount}</span>
              <small>Conquistas</small>
            </div>
            <div className="hub-stat">
              <MapPin size={18} />
              <span>{stats.trailsCompleted}</span>
              <small>Trilhas</small>
            </div>
          </div>
        </motion.section>

        {/* Ações rápidas */}
        <motion.section
          className="hub-quick-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <button
            id="hub-btn-scanner"
            className="hub-action-btn hub-action-primary"
            onClick={() => navigate("/scanner")}
          >
            <QrCode size={22} />
            <span>Escanear QR</span>
          </button>
          <button
            id="hub-btn-ingressos"
            className="hub-action-btn"
            onClick={() => navigate("/meus-ingressos")}
          >
            <Ticket size={22} />
            <span>Meus Ingressos</span>
            {activeTickets.length > 0 && (
              <span className="hub-action-badge">{activeTickets.length}</span>
            )}
          </button>
          <button
            id="hub-btn-passaporte"
            className="hub-action-btn"
            onClick={() => navigate("/passaporte")}
          >
            <Star size={22} />
            <span>Passaporte</span>
          </button>
          <button
            id="hub-btn-perfil"
            className="hub-action-btn"
            onClick={() => navigate("/perfil")}
          >
            <Compass size={22} />
            <span>Meu Perfil</span>
          </button>
        </motion.section>

        {/* Buscar cidade */}
        <motion.section
          className="hub-city-search"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="hub-section-header">
            <h2>Explorar Cidades</h2>
            <button className="hub-see-all" onClick={() => navigate("/cidades")}>
              Ver todas <ChevronRight size={16} />
            </button>
          </div>

          <div className="hub-search-wrapper">
            <Search size={18} className="hub-search-icon" />
            <input
              id="hub-city-search-input"
              type="text"
              className="hub-search-input"
              placeholder="Buscar cidade ou estado..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="hub-cities-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="hub-city-card hub-city-skeleton" />
              ))}
            </div>
          ) : filteredCities.length === 0 ? (
            <div className="hub-empty-state">
              <MapPin size={48} />
              <p>Nenhuma cidade encontrada.</p>
              <button onClick={() => navigate("/cidades?indicar=true")} className="hub-empty-cta">
                Indicar uma cidade
              </button>
            </div>
          ) : (
            <div className="hub-cities-grid">
              {filteredCities.map((city, i) => (
                <motion.button
                  key={city.id}
                  id={`hub-city-${city.slug}`}
                  className="hub-city-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/cidades/${city.slug}`)}
                >
                  {city.logoUrl ? (
                    <img src={city.logoUrl} alt={city.nome} className="hub-city-logo" />
                  ) : (
                    <div className="hub-city-placeholder">
                      <MapPin size={24} />
                    </div>
                  )}
                  <div className="hub-city-info">
                    <strong>{city.nome}</strong>
                    {city.estado && <small>{city.estado}</small>}
                    {city.equipamentosCount !== undefined && (
                      <small>{city.equipamentosCount} equipamentos</small>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </motion.section>

        {/* Visitas recentes */}
        {recentVisits.length > 0 && (
          <motion.section
            className="hub-recent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="hub-section-header">
              <h2>Visitados Recentemente</h2>
            </div>
            <div className="hub-recent-list">
              {recentVisits.map(visit => (
                <button
                  key={visit.id}
                  className="hub-recent-item"
                  onClick={() => navigate(`/cidades/${visit.citySlug}/equipamentos/${visit.equipamentoSlug}`)}
                >
                  <div className="hub-recent-icon">
                    <MapPin size={20} />
                  </div>
                  <div className="hub-recent-info">
                    <strong>{visit.equipamentoName}</strong>
                    <small>{visit.cityName}</small>
                  </div>
                  <ChevronRight size={16} className="hub-recent-arrow" />
                </button>
              ))}
            </div>
          </motion.section>
        )}

        {/* Ingressos ativos */}
        {activeTickets.length > 0 && (
          <motion.section
            className="hub-tickets"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <div className="hub-section-header">
              <h2>Ingressos Ativos</h2>
              <button className="hub-see-all" onClick={() => navigate("/meus-ingressos")}>
                Ver todos <ChevronRight size={16} />
              </button>
            </div>
            <div className="hub-tickets-list">
              {activeTickets.map(ticket => (
                <div key={ticket.id} className="hub-ticket-card">
                  <Ticket size={20} className="hub-ticket-icon" />
                  <div className="hub-ticket-info">
                    <strong>{ticket.eventTitle}</strong>
                    <small>{ticket.equipamentoName} • {new Date(ticket.eventDate).toLocaleDateString("pt-BR")}</small>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </>
  );
};
