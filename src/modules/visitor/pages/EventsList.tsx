import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { MapPin, Ticket, Clock, Filter, Calendar, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./Events.css";

type EventItem = {
  id: string;
  title: string;
  startDate: string;
  location?: string;
  type?: string;
  coverImageUrl?: string;
};

export const EventsList: React.FC = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'UPCOMING' | 'WEEK' | 'MONTH'>('UPCOMING');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const { tenantId, equipamentoId } = useAuth();

  const fetchEvents = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await api.get("/events", { params: { tenantId, equipamentoId, status: 'PUBLISHED' } });
      setEvents(res.data.data || []);
    } catch { console.error("Failed to fetch events"); }
    finally { setLoading(false); }
  }, [tenantId, equipamentoId]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const groupedEvents = useMemo(() => {
    const filtered = events.filter(e => {
      if (selectedCategory !== 'ALL' && e.type !== selectedCategory) return false;
      const eventDate = new Date(e.startDate);
      const now = new Date();
      if (filter === 'WEEK') {
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);
        return eventDate >= now && eventDate <= nextWeek;
      }
      if (filter === 'MONTH') return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
      return eventDate >= now;
    });

    const groups: Record<string, EventItem[]> = {};
    filtered.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).forEach(ev => {
      const dateKey = new Date(ev.startDate).toLocaleDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(ev);
    });
    return groups;
  }, [events, filter, selectedCategory]);

  const categories = [
    { id: 'ALL', label: 'Todos' },
    { id: 'WORKSHOP', label: 'Oficinas' },
    { id: 'EXHIBITION', label: 'Exposições' },
    { id: 'SHOW', label: 'Shows' },
    { id: 'LECTURE', label: 'Palestras' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="events-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <header className="events-header-premium">
        <span className="events-badge">Agendamentos & Intervenções</span>
        <h1 className="events-title-premium">Pulso Cultural</h1>
        <p className="hero-subtitle-premium">Uma seleção viva e pulsante de diálogos, performances e descobertas em nosso espaço sagrado.</p>
        
        <div className="workslist-controls mt-10">
          <div className="workslist-filter-pill">
            {['UPCOMING', 'WEEK', 'MONTH'].map(f => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f as any)}
              >
                {f === 'UPCOMING' ? 'Em Breve' : f === 'WEEK' ? 'Esta Semana' : 'Este Mês'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center p-20">
           <div className="splash-loader-fill h-1 w-40"></div>
        </div>
      ) : Object.keys(groupedEvents).length === 0 ? (
        <div className="workslist-empty py-40">
           <Calendar className="mx-auto mb-8 opacity-20" size={64} />
           <h3 className="text-2xl font-fd text-white mb-4">Pausa na Programação</h3>
           <p className="text-muted max-w-sm mx-auto mb-10">Estamos preparando novas experiências para você. Volte em breve ou limpe os filtros.</p>
           <button onClick={() => { setFilter('UPCOMING'); setSelectedCategory('ALL'); }} className="gallery-cta !justify-center">
              Limpar Filtros
           </button>
        </div>
      ) : (
        <div className="agenda-timeline-premium">
           <AnimatePresence mode="popLayout">
             {Object.entries(groupedEvents).map(([date, dayEvents]) => {
               const d = new Date(dayEvents[0].startDate);
               return (
                 <motion.div 
                   key={date} 
                   className="timeline-day-group-premium" 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                 >
                    <div className="timeline-date-header-premium">
                       <div className="date-circle-premium">
                          <span className="day-num-premium">{d.getDate()}</span>
                          <span className="month-name-premium">{d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                       </div>
                       <span className="day-label-premium">{d.toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                    </div>

                    <div className="timeline-events-premium">
                       {dayEvents.map(ev => (
                         <Link key={ev.id} to={`/eventos/${ev.id}`} className="agenda-card-premium group">
                            <div className="card-time-premium">
                               <span className="strip-hour-premium">{new Date(ev.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                               <span className="strip-label-premium">Início</span>
                            </div>

                            <div className="card-main-premium">
                               <span className="card-tag-premium">{categories.find(c => c.id === ev.type)?.label || 'Intervenção'}</span>
                               <h2 className="card-title-premium">{ev.title}</h2>
                               <div className="card-meta-premium">
                                  <div className="meta-item-premium"><MapPin size={14} /> {ev.location || 'Auditório Principal'}</div>
                               </div>
                            </div>
                            
                            {ev.coverImageUrl && (
                              <img src={ev.coverImageUrl} alt={ev.title} className="card-img-premium" />
                            )}
                         </Link>
                       ))}
                    </div>
                 </motion.div>
               );
             })}
           </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};
