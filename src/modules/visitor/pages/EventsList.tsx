import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Calendar, MapPin, Ticket } from "lucide-react";
import "./Events.css";

type EventItem = {
  id: string;
  title: string;
  date?: string;
  time?: string;
  location?: string;
};

type ApiEvent = {
  id: string;
  title: string;
  startDate?: string;
  location?: string;
};

export const EventsList: React.FC = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { tenantId } = useAuth();

  const fetchEvents = useCallback(async () => {
    if (!tenantId) return;

    setLoading(true);
    try {
      const res = await api.get("/events", { params: { tenantId } });
      // Backend returns { data: [], meta: {} }
      const eventsData = res.data.data || [];

      const apiEvents = (eventsData as ApiEvent[]).map((e) => ({
        id: e.id,
        title: e.title,
        date: e.startDate ? new Date(e.startDate).toLocaleDateString() : "",
        time: e.startDate ? new Date(e.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
        location: e.location ?? ""
      }));
      setEvents(apiEvents);
    } catch {
      console.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="events-container">
      <header className="events-header">
        <h1 className="events-title">{t("visitor.events.title")}</h1>
        <p className="events-subtitle">
          {t("visitor.events.subtitle")}
        </p>
      </header>

      {loading ? (
        <div className="events-loading">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-card"></div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="events-empty">
          <span className="empty-icon" role="img" aria-label="calendar">📅</span>
          <h3>{t("visitor.events.emptyTitle", "Nenhum evento agendado")}</h3>
          <p>{t("visitor.events.emptyDesc", "Fique de olho! Em breve teremos novos eventos e workshops.")}</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map(ev => (
            <Link key={ev.id} to={`/eventos/${ev.id}`} className="event-ticket">
              <div className="ticket-notch-right"></div>
              <div className="ticket-content">
                <span className="ticket-badge">
                  <Ticket size={12} />
                  Evento
                </span>
                <h2 className="ticket-title">{ev.title}</h2>
                {ev.location && (
                  <div className="ticket-location">
                    <MapPin size={14} />
                    <span>{ev.location}</span>
                  </div>
                )}
              </div>
              <div className="ticket-footer">
                <div className="ticket-date">
                  <span className="date-label">Data</span>
                  <span className="date-value">{ev.date}</span>
                </div>
                <div className="ticket-time">
                  {ev.time}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
