import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  MapPin, Clock, Accessibility, Ticket, ArrowLeft, QrCode,
  BookOpen, Calendar, Map, ChevronRight, Star, Volume2, Award,
  ShoppingBag, ExternalLink, Users
} from "lucide-react";
import "./MuseumHub.css";

interface Work {
  id: string;
  title: string;
  artist?: string;
  imageUrl?: string;
  year?: string;
}

interface Event {
  id: string;
  title: string;
  startDate: string;
  imageUrl?: string;
}

interface Trail {
  id: string;
  name: string;
  durationMinutes?: number;
  worksCount?: number;
}

interface MuseumData {
  id: string;
  nome: string;
  slug: string;
  descricao?: string;
  missao?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  endereco?: string;
  horarios?: string;
  acessibilidade?: string;
  ingresso?: string;
  telefone?: string;
  site?: string;
  worksCount?: number;
  eventsCount?: number;
  trailsCount?: number;
}

export const MuseumHub: React.FC = () => {
  const { citySlug, equipmentSlug } = useParams<{ citySlug: string; equipmentSlug: string }>();
  const navigate = useNavigate();
  const { updateSession, isAuthenticated, role, name: authName, equipamentoId } = useAuth();

  const [museum, setMuseum] = useState<MuseumData | null>(null);
  const [featuredWorks, setFeaturedWorks] = useState<Work[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [trails, setTrails] = useState<Trail[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"obras" | "eventos" | "trilhas" | "info">("obras");

  const fetchMuseum = useCallback(async () => {
    if (!equipmentSlug) return;
    try {
      setLoading(true);
      // Tenta carregar por slug; fallback para id
      const res = await api.get(`/equipamentos/public/${equipmentSlug}`).catch(() =>
        api.get(`/equipamentos/slug/${equipmentSlug}`)
      );
      if (res?.data) {
        setMuseum(res.data);
        // Atualiza sessão com esse equipamento
        if (isAuthenticated && res.data.id) {
          updateSession(role || "visitor", res.data.tenantId || res.data.id, authName, res.data.id, null);
        }
        // Busca conteúdo associado
        const eqId = res.data.id;
        const [worksRes, eventsRes, trailsRes] = await Promise.allSettled([
          api.get(`/works?equipamentoId=${eqId}&limit=6`),
          api.get(`/events?equipamentoId=${eqId}&limit=4`),
          api.get(`/trails?equipamentoId=${eqId}&limit=4`),
        ]);
        if (worksRes.status === "fulfilled") {
          const d = worksRes.value.data;
          setFeaturedWorks(Array.isArray(d) ? d : d.data || []);
        }
        if (eventsRes.status === "fulfilled") {
          const d = eventsRes.value.data;
          setUpcomingEvents(Array.isArray(d) ? d : d.data || []);
        }
        if (trailsRes.status === "fulfilled") {
          const d = trailsRes.value.data;
          setTrails(Array.isArray(d) ? d : d.data || []);
        }
      }
    } catch (_err) {
      // Will show empty state
    } finally {
      setLoading(false);
    }
  }, [equipmentSlug, isAuthenticated, role, authName, updateSession]);

  useEffect(() => {
    fetchMuseum();
  }, [fetchMuseum]);

  if (loading) {
    return (
      <div className="museum-hub-loading">
        <div className="museum-hub-spinner" />
        <p>Carregando equipamento...</p>
      </div>
    );
  }

  if (!museum) {
    return (
      <div className="museum-hub-error">
        <h2>Equipamento não encontrado</h2>
        <button onClick={() => navigate(`/cidades/${citySlug}`)}>
          <ArrowLeft size={18} /> Voltar para a cidade
        </button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{museum.nome} | Cultura Viva</title>
        <meta name="description" content={museum.descricao || museum.missao || `Explore ${museum.nome} — obras, eventos e trilhas culturais.`} />
      </Helmet>

      <div className="museum-hub">
        {/* Capa */}
        <div className="mh-cover">
          {museum.coverImageUrl ? (
            <img src={museum.coverImageUrl} alt={museum.nome} className="mh-cover-img" />
          ) : (
            <div className="mh-cover-placeholder" />
          )}
          <div className="mh-cover-overlay" />

          <button
            className="mh-back-btn"
            onClick={() => navigate(`/cidades/${citySlug}`)}
            aria-label="Voltar"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="mh-cover-content">
            {museum.logoUrl && (
              <img src={museum.logoUrl} alt="" className="mh-logo" />
            )}
            <h1 className="mh-title">{museum.nome}</h1>
            {museum.endereco && (
              <p className="mh-address">
                <MapPin size={14} /> {museum.endereco}
              </p>
            )}
          </div>
        </div>

        {/* Infos rápidas */}
        <div className="mh-meta-bar">
          {museum.horarios && (
            <div className="mh-meta-item">
              <Clock size={14} />
              <span>{museum.horarios}</span>
            </div>
          )}
          {museum.ingresso && (
            <div className="mh-meta-item">
              <Ticket size={14} />
              <span>{museum.ingresso}</span>
            </div>
          )}
          {museum.acessibilidade && (
            <div className="mh-meta-item">
              <Accessibility size={14} />
              <span>{museum.acessibilidade}</span>
            </div>
          )}
        </div>

        {/* Ações rápidas */}
        <div className="mh-actions">
          <button
            id="mh-btn-checkin"
            className="mh-action-btn mh-action-primary"
            onClick={() => navigate(`/cidades/${citySlug}/equipamentos/${equipmentSlug}/scanner`)}
          >
            <QrCode size={20} />
            <span>Check-in QR</span>
          </button>
          <button
            id="mh-btn-audioguia"
            className="mh-action-btn"
            onClick={() => navigate(`/cidades/${citySlug}/equipamentos/${equipmentSlug}/obras`)}
          >
            <Volume2 size={20} />
            <span>Audioguia</span>
          </button>
          <button
            id="mh-btn-mapa"
            className="mh-action-btn"
            onClick={() => navigate(`/cidades/${citySlug}/equipamentos/${equipmentSlug}/mapa`)}
          >
            <Map size={20} />
            <span>Mapa</span>
          </button>
          <button
            id="mh-btn-passaporte"
            className="mh-action-btn"
            onClick={() => navigate(`/cidades/${citySlug}/equipamentos/${equipmentSlug}/passaporte`)}
          >
            <Award size={20} />
            <span>Passaporte</span>
          </button>
        </div>

        {/* Missão/Descrição */}
        {(museum.missao || museum.descricao) && (
          <motion.section
            className="mh-description"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p>{museum.missao || museum.descricao}</p>
          </motion.section>
        )}

        {/* Contadores */}
        <div className="mh-counters">
          <div className="mh-counter">
            <BookOpen size={20} />
            <strong>{museum.worksCount ?? featuredWorks.length}</strong>
            <small>Obras</small>
          </div>
          <div className="mh-counter">
            <Calendar size={20} />
            <strong>{museum.eventsCount ?? upcomingEvents.length}</strong>
            <small>Eventos</small>
          </div>
          <div className="mh-counter">
            <Map size={20} />
            <strong>{museum.trailsCount ?? trails.length}</strong>
            <small>Trilhas</small>
          </div>
          <div className="mh-counter">
            <Users size={20} />
            <strong>—</strong>
            <small>Visitantes</small>
          </div>
        </div>

        {/* Abas de conteúdo */}
        <div className="mh-tabs">
          {(["obras", "eventos", "trilhas", "info"] as const).map(tab => (
            <button
              key={tab}
              id={`mh-tab-${tab}`}
              className={`mh-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "obras" && "🎨 Obras"}
              {tab === "eventos" && "📅 Eventos"}
              {tab === "trilhas" && "🗺️ Trilhas"}
              {tab === "info" && "ℹ️ Info"}
            </button>
          ))}
        </div>

        <div className="mh-tab-content">
          {/* Aba Obras */}
          {activeTab === "obras" && (
            <div>
              {featuredWorks.length === 0 ? (
                <div className="mh-empty">
                  <BookOpen size={40} />
                  <p>Nenhuma obra cadastrada ainda</p>
                </div>
              ) : (
                <div className="mh-works-grid">
                  {featuredWorks.map((work, i) => (
                    <motion.button
                      key={work.id}
                      className="mh-work-card"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => navigate(`/cidades/${citySlug}/equipamentos/${equipmentSlug}/obras/${work.id}`)}
                    >
                      {work.imageUrl ? (
                        <img src={work.imageUrl} alt={work.title} className="mh-work-img" />
                      ) : (
                        <div className="mh-work-img-placeholder">
                          <Star size={24} />
                        </div>
                      )}
                      <div className="mh-work-info">
                        <strong>{work.title}</strong>
                        {work.artist && <small>{work.artist}</small>}
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
              <button
                className="mh-see-all-btn"
                onClick={() => navigate(`/cidades/${citySlug}/equipamentos/${equipmentSlug}/obras`)}
              >
                Ver todas as obras <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Aba Eventos */}
          {activeTab === "eventos" && (
            <div>
              {upcomingEvents.length === 0 ? (
                <div className="mh-empty">
                  <Calendar size={40} />
                  <p>Nenhum evento próximo</p>
                </div>
              ) : (
                <div className="mh-events-list">
                  {upcomingEvents.map(ev => (
                    <button
                      key={ev.id}
                      className="mh-event-card"
                      onClick={() => navigate(`/cidades/${citySlug}/equipamentos/${equipmentSlug}/eventos/${ev.id}`)}
                    >
                      {ev.imageUrl && (
                        <img src={ev.imageUrl} alt={ev.title} className="mh-event-img" />
                      )}
                      <div className="mh-event-info">
                        <strong>{ev.title}</strong>
                        <small>{new Date(ev.startDate).toLocaleDateString("pt-BR")}</small>
                      </div>
                      <ChevronRight size={16} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Aba Trilhas */}
          {activeTab === "trilhas" && (
            <div>
              {trails.length === 0 ? (
                <div className="mh-empty">
                  <Map size={40} />
                  <p>Nenhuma trilha disponível</p>
                </div>
              ) : (
                <div className="mh-trails-list">
                  {trails.map(trail => (
                    <button
                      key={trail.id}
                      className="mh-trail-card"
                      onClick={() => navigate(`/cidades/${citySlug}/equipamentos/${equipmentSlug}/trilhas/${trail.id}`)}
                    >
                      <div className="mh-trail-icon"><Map size={20} /></div>
                      <div className="mh-trail-info">
                        <strong>{trail.name}</strong>
                        <small>
                          {trail.worksCount ? `${trail.worksCount} obras` : ""}
                          {trail.durationMinutes ? ` • ${trail.durationMinutes} min` : ""}
                        </small>
                      </div>
                      <ChevronRight size={16} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Aba Info */}
          {activeTab === "info" && (
            <div className="mh-info-section">
              {museum.endereco && (
                <div className="mh-info-row">
                  <MapPin size={18} className="mh-info-icon" />
                  <div>
                    <strong>Endereço</strong>
                    <p>{museum.endereco}</p>
                  </div>
                </div>
              )}
              {museum.horarios && (
                <div className="mh-info-row">
                  <Clock size={18} className="mh-info-icon" />
                  <div>
                    <strong>Horários</strong>
                    <p>{museum.horarios}</p>
                  </div>
                </div>
              )}
              {museum.ingresso && (
                <div className="mh-info-row">
                  <Ticket size={18} className="mh-info-icon" />
                  <div>
                    <strong>Ingresso</strong>
                    <p>{museum.ingresso}</p>
                  </div>
                </div>
              )}
              {museum.acessibilidade && (
                <div className="mh-info-row">
                  <Accessibility size={18} className="mh-info-icon" />
                  <div>
                    <strong>Acessibilidade</strong>
                    <p>{museum.acessibilidade}</p>
                  </div>
                </div>
              )}
              {museum.site && (
                <a href={museum.site} target="_blank" rel="noopener noreferrer" className="mh-site-btn">
                  <ExternalLink size={16} />
                  Visitar site oficial
                </a>
              )}
            </div>
          )}
        </div>

        {/* Loja / Patrocínio */}
        <div className="mh-footer-actions">
          <button
            id="mh-btn-loja"
            className="mh-footer-btn"
            onClick={() => navigate(`/cidades/${citySlug}/equipamentos/${equipmentSlug}/loja`)}
          >
            <ShoppingBag size={18} />
            Loja Cultural
          </button>
          <button
            id="mh-btn-agendar"
            className="mh-footer-btn mh-footer-primary"
            onClick={() => navigate(`/cidades/${citySlug}/equipamentos/${equipmentSlug}/agendar`)}
          >
            <Calendar size={18} />
            Agendar Visita
          </button>
        </div>
      </div>
    </>
  );
};
