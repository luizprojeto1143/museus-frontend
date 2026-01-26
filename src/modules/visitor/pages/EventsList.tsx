import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";

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
      const apiEvents = (res.data as ApiEvent[]).map((e) => ({
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
    <div>
      <h1 className="section-title">{t("visitor.events.title")}</h1>
      <p className="section-subtitle">
        {t("visitor.events.subtitle")}
      </p>

      {loading ? (
        <div className="card-grid">
          {[1, 2].map(i => (
            <div key={i} className="card" style={{ height: "150px", animation: "pulse 1.5s infinite", background: "rgba(255,255,255,0.05)" }}></div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📅</div>
          <h3>{t("visitor.events.emptyTitle", "Nenhum evento agendado")}</h3>
          <p style={{ color: "#9ca3af" }}>{t("visitor.events.emptyDesc", "Fique de olho! Em breve teremos novos eventos e workshops.")}</p>
        </div>
      ) : (
        <div className="card-grid">
          {events.map(ev => (
            <Link key={ev.id} to={`/eventos/${ev.id}`} style={{ textDecoration: "none" }}>
              <article className="card">
                <h2 className="card-title">{ev.title}</h2>
                <p className="card-subtitle">
                  {ev.date} • {ev.time}
                </p>
                <p style={{ fontSize: "0.85rem", color: "#e5e7eb" }}>{t("visitor.events.location")}: {ev.location}</p>
              </article>
            </Link>
          ))}
        </div>
      )}
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};
