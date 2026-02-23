import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Calendar as CalendarIcon, MapPin, Ticket, Clock, Filter, Grid, List as ListIcon } from "lucide-react";
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
      const eventsData = res.data.data || [];
      setEvents(eventsData);
    } catch {
      console.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Group events by Day
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
      if (filter === 'MONTH') {
        return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
      }
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

  return (
    <div className="events-container">
      <header className="events-header">
        <h1 className="events-title">Agenda Cultural</h1>
        <p className="events-subtitle">Explore a programação e planeje sua visita.</p>
      </header>

      <div className="agenda-filters">
        <div className="filter-group">
          <button
            className={`filter-btn ${filter === 'UPCOMING' ? 'active' : ''}`}
            onClick={() => setFilter('UPCOMING')}
          >Próximos</button>
          <button
            className={`filter-btn ${filter === 'WEEK' ? 'active' : ''}`}
            onClick={() => setFilter('WEEK')}
          >Esta Semana</button>
          <button
            className={`filter-btn ${filter === 'MONTH' ? 'active' : ''}`}
            onClick={() => setFilter('MONTH')}
          >Este Mês</button>
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
        <div className="p-12 text-center">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-500">Organizando programação...</p>
        </div>
      ) : Object.keys(groupedEvents).length === 0 ? (
        <div className="events-empty">
          <span className="empty-icon">📅</span>
          <h3 className="text-xl font-bold text-white mb-2">Agenda Vazia</h3>
          <p className="text-zinc-500">Não encontramos eventos para este período ou categoria.</p>
          <button
            className="mt-6 text-gold underline font-bold"
            onClick={() => { setFilter('UPCOMING'); setSelectedCategory('ALL'); }}
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="agenda-timeline">
          {Object.entries(groupedEvents).map(([date, dayEvents]) => {
            const d = new Date(dayEvents[0].startDate);
            const dayNum = d.getDate();
            const monthName = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
            const dayLabel = d.toLocaleDateString('pt-BR', { weekday: 'long' });

            return (
              <div key={date} className="timeline-day-group">
                <div className="timeline-date-header">
                  <div className="date-circle">
                    <span className="day-num">{dayNum}</span>
                    <span className="month-name">{monthName}</span>
                  </div>
                  <span className="day-label capitalize">{dayLabel}</span>
                </div>

                <div className="timeline-events">
                  {dayEvents.map(ev => (
                    <Link key={ev.id} to={`/eventos/${ev.id}`} className="agenda-card">
                      <div className="card-time-strip">
                        <span className="strip-hour">
                          {new Date(ev.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="strip-label">Início</span>
                      </div>

                      <div className="card-main">
                        <span className="card-tag">
                          {categories.find(c => c.id === ev.type)?.label || 'Evento'}
                        </span>
                        <h2 className="card-title">{ev.title}</h2>
                        <div className="card-meta">
                          {ev.location && (
                            <div className="meta-item">
                              <MapPin size={14} />
                              <span>{ev.location}</span>
                            </div>
                          )}
                          <div className="meta-item">
                            <Ticket size={14} />
                            <span>Grátis</span>
                          </div>
                        </div>
                      </div>

                      {ev.coverImageUrl && (
                        <img src={ev.coverImageUrl} alt={ev.title} className="card-img-side" />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
