import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";
import toast from "react-hot-toast";
import { buildCityUrl, buildEquipmentUrl } from "@/utils/routes";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { MapPin, QrCode, Ticket, Star, ChevronRight, Search, Compass, Trophy, Theater, Calendar } from "lucide-react";
import { TheaterPlayModal, type TheaterPlay as ModalPlay } from "../components/TheaterPlayModal";
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

interface TheaterPlay {
  id: string;
  title: string;
  theaterName: string;
  cityName: string;
  date: string;
  price: number;
  imageUrl?: string;
  isLocal?: boolean;
}

const DEMO_THEATER_PLAYS: TheaterPlay[] = [
  {
    id: "play-1",
    title: "O Auto da Compadecida",
    theaterName: "Teatro Municipal de Ouro Preto",
    cityName: "Ouro Preto, MG",
    date: "Hoje às 20h00",
    price: 25,
    imageUrl: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=600&q=80",
    isLocal: true
  },
  {
    id: "play-2",
    title: "O Fantasma da Ópera",
    theaterName: "Teatro Amazonas",
    cityName: "Manaus, AM",
    date: "Amanhã às 19h30",
    price: 40,
    imageUrl: "https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=600&q=80",
    isLocal: false
  },
  {
    id: "play-3",
    title: "Romeu & Julieta - O Musical",
    theaterName: "Teatro Castro Alves",
    cityName: "Salvador, BA",
    date: "Sábado às 21h00",
    price: 35,
    imageUrl: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=600&q=80",
    isLocal: false
  },
  {
    id: "play-4",
    title: "Divaldo & Cecília - Amor à Arte",
    theaterName: "Teatro Municipal de Tiradentes",
    cityName: "Tiradentes, MG",
    date: "Domingo às 18h00",
    price: 20,
    imageUrl: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=600&q=80",
    isLocal: true
  }
];

type ListResponse<T> = T[] | {
  data?: T[];
};

const unwrapList = <T,>(payload: ListResponse<T>): T[] => {
  return Array.isArray(payload) ? payload : payload.data || [];
};
export const VisitorHub: React.FC = () => {
  const navigate = useNavigate();
  const { name, role, isGuest } = useAuth();

  const [estados, setEstados] = useState<EstadoGroup[]>([]);
  const [recentVisits, setRecentVisits] = useState<RecentVisit[]>([]);
  const [activeTickets, setActiveTickets] = useState<ActiveTicket[]>([]);
  const [stats, setStats] = useState<UserStats>({ xp: 0, level: 1, visitsCount: 0, badgesCount: 0, trailsCompleted: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [theaterPlays, setTheaterPlays] = useState<TheaterPlay[]>(DEMO_THEATER_PLAYS);
  const [theaterFilter, setTheaterFilter] = useState<'my_city' | 'all'>('my_city');
  const [selectedPlayForModal, setSelectedPlayForModal] = useState<ModalPlay | null>(null);

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

      const isVisitorUser = !isGuest && (role === "visitor" || !role);

      const requests: Promise<any>[] = [
        api.get<ListResponse<Equipamento>>(equipamentosQuery).catch(() => ({ data: [] } as any))
      ];

      if (isVisitorUser) {
        requests.push(api.get<ListResponse<RecentVisit>>("/visitors/me/recent-visits?limit=3").catch(() => ({ data: [] } as any)));
        requests.push(api.get<ListResponse<ActiveTicket>>("/visitors/me/active-tickets?limit=3").catch(() => ({ data: [] } as any)));
        requests.push(api.get<Partial<UserStats>>("/visitors/me/stats").catch(() => ({ data: {} } as any)));
      }

      const results = await Promise.allSettled(requests);

      if (results[0].status === "fulfilled") {
        const eqData = unwrapList(results[0].value.data);
        
        const estMap = new Map<string, number>();
        eqData.forEach((eq: any) => {
          if (eq && eq.estado) {
            estMap.set(eq.estado, (estMap.get(eq.estado) || 0) + 1);
          }
        });
        
        const estList: EstadoGroup[] = Array.from(estMap.entries()).map(([nome, count]) => ({
          nome,
          equipamentosCount: count
        })).sort((a, b) => a.nome.localeCompare(b.nome));
        
        setEstados(estList);
      }
      if (isVisitorUser && results[1]?.status === "fulfilled") {
        setRecentVisits(unwrapList(results[1].value.data));
      }
      if (isVisitorUser && results[2]?.status === "fulfilled") {
        setActiveTickets(unwrapList(results[2].value.data));
      }
      if (isVisitorUser && results[3]?.status === "fulfilled") {
        const statsObj = results[3].value.data;
        if (statsObj && typeof statsObj === "object") {
          setStats(prev => ({ ...prev, ...statsObj }));
        }
      }
    } catch (_err) {
      // UI shows empty states gracefully if optional hub calls fail.
    } finally {
      setLoading(false);
    }
  }, [isGuest, role]);

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

        {/* Teatros & Espetáculos em Cartaz */}
        <motion.section
          className="hub-theater-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          style={{ padding: "24px 16px 0" }}
        >
          <div className="hub-section-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Theater size={22} color="#d4af37" />
              <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#fff", margin: 0 }}>
                Teatros & Espetáculos em Cartaz
              </h2>
            </div>
            <button className="hub-see-all" onClick={() => navigate("/theater/sessoes")}>
              Ver bilheteria <ChevronRight size={16} />
            </button>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px", overflowX: "auto" }}>
            <button
              onClick={() => setTheaterFilter('my_city')}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "0.75rem",
                fontWeight: "700",
                cursor: "pointer",
                border: "1px solid",
                borderColor: theaterFilter === 'my_city' ? "#d4af37" : "rgba(255,255,255,0.1)",
                background: theaterFilter === 'my_city' ? "rgba(212, 175, 55, 0.2)" : "rgba(255,255,255,0.05)",
                color: theaterFilter === 'my_city' ? "#d4af37" : "#94a3b8"
              }}
            >
              🏙️ Na Minha Cidade
            </button>
            <button
              onClick={() => setTheaterFilter('all')}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "0.75rem",
                fontWeight: "700",
                cursor: "pointer",
                border: "1px solid",
                borderColor: theaterFilter === 'all' ? "#d4af37" : "rgba(255,255,255,0.1)",
                background: theaterFilter === 'all' ? "rgba(212, 175, 55, 0.2)" : "rgba(255,255,255,0.05)",
                color: theaterFilter === 'all' ? "#d4af37" : "#94a3b8"
              }}
            >
              🌎 Outras Cidades & Nacional
            </button>
          </div>

          {/* Grid of Plays */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "14px" }}>
            {theaterPlays
              .filter(p => theaterFilter === 'all' || p.isLocal)
              .map(play => (
                <div
                  key={play.id}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "20px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div
                    onClick={() => setSelectedPlayForModal({
                      id: play.id,
                      title: play.title,
                      theaterName: play.theaterName,
                      cityName: play.cityName,
                      posterUrl: play.imageUrl || "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=600&q=80",
                      dates: play.date,
                      price: `R$ ${play.price.toFixed(2)}`,
                      isLocal: !!play.isLocal
                    })}
                    style={{ cursor: "pointer" }}
                  >
                    <div style={{ height: "130px", background: "#0a0a0f", position: "relative", overflow: "hidden" }}>
                      {play.imageUrl ? (
                        <img src={play.imageUrl} alt={play.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                          <Theater size={36} />
                        </div>
                      )}
                      <span style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(212, 175, 55, 0.25)", border: "1px solid rgba(212, 175, 55, 0.5)", color: "#fef08a", fontSize: "0.65rem", fontWeight: "800", padding: "2px 8px", borderRadius: "12px" }}>
                        Em Cartaz
                      </span>
                    </div>

                    <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#d4af37", fontSize: "0.75rem", fontWeight: "700" }}>
                        <MapPin size={12} />
                        <span>{play.cityName}</span>
                      </div>
                      <h3 style={{ fontSize: "0.95rem", fontWeight: "800", color: "#fff", margin: 0, lineHeight: "1.2" }}>
                        {play.title}
                      </h3>
                      <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{play.theaterName}</span>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px", fontSize: "0.75rem" }}>
                        <span style={{ color: "#cbd5e1", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Calendar size={12} /> {play.date}
                        </span>
                        <strong style={{ color: "#34d399", fontWeight: "800" }}>A partir de R$ {play.price.toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: "14px", paddingTop: "0" }}>
                    <button
                      onClick={() => setSelectedPlayForModal({
                        id: play.id,
                        title: play.title,
                        theaterName: play.theaterName,
                        cityName: play.cityName,
                        posterUrl: play.imageUrl || "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=600&q=80",
                        dates: play.date,
                        price: `R$ ${play.price.toFixed(2)}`,
                        isLocal: !!play.isLocal
                      })}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #d4af37 0%, #f59e0b 100%)",
                        color: "#0f172a",
                        fontWeight: "900",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px"
                      }}
                    >
                      <Ticket size={14} /> Comprar Ingresso
                    </button>
                  </div>
                </div>
              ))}
          </div>
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

        <TheaterPlayModal
          play={selectedPlayForModal}
          onClose={() => setSelectedPlayForModal(null)}
          onBuy={(playId) => {
            const playTitle = selectedPlayForModal?.title || "Espetáculo Teatral";
            setSelectedPlayForModal(null);
            toast.success(`Ingresso para "${playTitle}" gerado com sucesso! Redirecionando para sua carteira de ingressos...`);
            navigate("/meus-ingressos");
          }}
        />
      </div>
    </>
  );
};



