import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";
import { buildCityUrl, buildEquipmentUrl } from "@/utils/routes";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { MapPin, QrCode, Ticket, Star, ChevronRight, Search, Compass, Trophy } from "lucide-react";
import "./VisitorHub.css";

interface Equipamento {
  id: string;
  nome: string;
  slug: string;
  tipo: string;
  cidade: string;
  estado: string;
  imagemUrl?: string;
}

interface EstadoGroup {
  nome: string;
  equipamentosCount: number;
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


type ListResponse<T> = T[] | {
  data?: T[];
};

const unwrapList = <T,>(payload: ListResponse<T>): T[] => {
  return Array.isArray(payload) ? payload : payload.data || [];
};
export const VisitorHub: React.FC = () => {
  const navigate = useNavigate();
  const { name, role } = useAuth();

  const [estados, setEstados] = useState<EstadoGroup[]>([]);
  const [recentVisits, setRecentVisits] = useState<RecentVisit[]>([]);
  const [activeTickets, setActiveTickets] = useState<ActiveTicket[]>([]);
  const [stats, setStats] = useState<UserStats>({ xp: 0, level: 1, visitsCount: 0, badgesCount: 0, trailsCompleted: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let equipamentosQuery = "/equipamentos/public";
      try {
        if ("geolocation" in navigator) {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
          });
          equipamentosQuery += `?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`;
        }
      } catch {
        // Fallback to standard fetch without coordinates
      }

      const results = await Promise.allSettled([
        api.get<ListResponse<Equipamento>>(equipamentosQuery),
        api.get<ListResponse<RecentVisit>>("/visitors/me/recent-visits?limit=3"),
        api.get<ListResponse<ActiveTicket>>("/visitors/me/active-tickets?limit=3"),
        api.get<Partial<UserStats>>("/visitors/me/stats"),
      ]);

      if (results[0].status === "fulfilled") {
        const eqData = unwrapList(results[0].value.data);
        
        const estMap = new Map<string, number>();
        eqData.forEach(eq => {
          if (eq.estado) {
            estMap.set(eq.estado, (estMap.get(eq.estado) || 0) + 1);
          }
        });
        
        const estList: EstadoGroup[] = Array.from(estMap.entries()).map(([nome, count]) => ({
          nome,
          equipamentosCount: count
        })).sort((a, b) => a.nome.localeCompare(b.nome));
        
        setEstados(estList);
      }
      if (results[1].status === "fulfilled") {
        setRecentVisits(unwrapList(results[1].value.data));
      }
      if (results[2].status === "fulfilled") {
        setActiveTickets(unwrapList(results[2].value.data));
      }
      const statsResult = results[3];
      if (statsResult.status === "fulfilled") {
        setStats(prev => ({ ...prev, ...statsResult.value.data }));
      }
    } catch (_err) {
      // UI shows empty states gracefully if optional hub calls fail.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role === "master") { navigate("/master", { replace: true }); return; }
    if (role === "equipment_admin") { navigate("/admin", { replace: true }); return; }
    fetchData();
  }, [role, navigate, fetchData]);

  const filteredEstados = estados.filter(e =>
    e.nome.toLowerCase().includes(searchQuery.toLowerCase())
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
          ) : filteredEstados.length === 0 ? (
            <div className="hub-empty-state">
              <MapPin size={48} />
              <p>Nenhum estado encontrado.</p>
              <button onClick={() => navigate("/cidades?indicar=true")} className="hub-empty-cta">
                Indicar uma cidade
              </button>
            </div>
          ) : (
            <div className="hub-cities-grid">
              {filteredEstados.map((estado, i) => (
                <motion.button
                  key={estado.nome}
                  id={`hub-estado-${estado.nome.toLowerCase()}`}
                  className="hub-city-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/cidades")}
                >
                  <div className="hub-city-placeholder">
                    <MapPin size={24} />
                  </div>
                  <div className="hub-city-info">
                    <strong>{estado.nome}</strong>
                    <small>{estado.equipamentosCount} equipamentos</small>
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
                  onClick={() => navigate(buildEquipmentUrl(visit.citySlug, visit.equipamentoSlug))}
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



