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
  const { tenantId } = useAuth();

  const fetchEvents = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await api.get("/events", { params: { tenantId, status: 'PUBLISHED' } });
      setEvents(res.data.data || []);
    } catch { console.error("Failed to fetch events"); }
    finally { setLoading(false); }
  }, [tenantId]);

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
      <header className="events-header flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="events-title italic">Pulso Cultural</h1>
           <p className="events-subtitle">Uma seleção viva de intervenções, diálogos e descobertas em nosso espaço.</p>
        </div>
        
        <div className="flex gap-2">
            <button className="h-12 w-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all">
               <Search size={20} />
            </button>
            <button className="h-12 px-6 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3 text-sm font-bold text-slate-400 hover:text-white transition-all">
               <Filter size={18} />
               Filtros
            </button>
        </div>
      </header>

      <div className="agenda-filters">
        <div className="filter-group">
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

        <div className="category-chips">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-24 text-center">
           <div className="w-12 h-12 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
           <span className="text-xs font-black uppercase tracking-widest text-slate-400">Sincronizando Cronogramas...</span>
        </div>
      ) : Object.keys(groupedEvents).length === 0 ? (
        <div className="bg-white/2 border border-dashed border-white/10 rounded-[40px] p-24 text-center">
           <Calendar className="mx-auto mb-8 opacity-20" size={64} />
           <h3 className="text-xl font-bold mb-2">Pausa na Programação</h3>
           <p className="text-slate-400 max-w-sm mx-auto mb-8">Estamos preparando novas experiências para você. Volte em breve ou limpe os filtros.</p>
           <button onClick={() => { setFilter('UPCOMING'); setSelectedCategory('ALL'); }} className="text-gold-400 font-black text-xs uppercase tracking-widest h-12 px-8 border border-gold-400/20 rounded-xl hover:bg-gold-400/5 transition-all">
              Limpar Filtros
           </button>
        </div>
      ) : (
        <div className="agenda-timeline">
           <AnimatePresence>
             {Object.entries(groupedEvents).map(([date, dayEvents]) => {
               const d = new Date(dayEvents[0].startDate);
               return (
                 <motion.div key={date} className="timeline-day-group" variants={itemVariants}>
                    <div className="timeline-date-header">
                       <div className="date-circle">
                          <span className="day-num">{d.getDate()}</span>
                          <span className="month-name">{d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                       </div>
                       <span className="day-label">{d.toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                    </div>

                    <div className="timeline-events">
                       {dayEvents.map(ev => (
                         <Link key={ev.id} to={`/eventos/${ev.id}`} className="agenda-card group">
                            <div className="card-time-strip">
                               <span className="strip-hour">{new Date(ev.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                               <span className="strip-label">Início</span>
                            </div>

                            <div className="card-main">
                               <span className="card-tag">{categories.find(c => c.id === ev.type)?.label || 'Intervenção'}</span>
                               <h2 className="card-title text-white group-hover:text-gold-400 transition-colors">{ev.title}</h2>
                               <div className="card-meta">
                                  <div className="meta-item"><MapPin size={14} /> {ev.location || 'Auditório Principal'}</div>
                                  <div className="meta-item"><Ticket size={14} /> Gratuito</div>
                               </div>
                            </div>
                            
                            {ev.coverImageUrl && (
                              <div className="overflow-hidden rounded-2xl">
                                <img src={ev.coverImageUrl} alt={ev.title} className="card-img-side group-hover:scale-105 transition-transform duration-500" />
                              </div>
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
