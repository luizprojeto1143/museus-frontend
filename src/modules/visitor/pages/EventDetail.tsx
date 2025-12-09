import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, isDemoMode } from "../../../api/client";

type EventDetail = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
};

export const EventDetail: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [apiEvent, setApiEvent] = useState<EventDetail | null>(null);
  const [apiLoading, setApiLoading] = useState(true);

  const mock: EventDetail = {
    id: id || "1",
    title: "Oficina de Aquarela",
    description: "Aprenda técnicas básicas de aquarela com artistas renomados. Evento gratuito, vagas limitadas.",
    location: "Atelier 1 - 2º andar",
    startDate: "2025-12-15T14:00:00",
    endDate: "2025-12-15T17:00:00"
  };

  const isDemo = isDemoMode || !id;

  useEffect(() => {
    if (isDemo) return;


    api
      .get(`/events/${id}`)
      .then((res) => {
        setApiEvent(res.data);
      })
      .catch(() => {
        console.error("Failed to fetch event details");
      })
      .finally(() => setApiLoading(false));
  }, [id, isDemo]);

  const event = isDemo ? mock : apiEvent;
  const loading = isDemo ? false : apiLoading;

  if (loading) {
    return <div className="card">{t("common.loading")}</div>;
  }

  if (!event) {
    return <div className="card">{t("visitor.eventDetail.notFound")}</div>;
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(i18n.language, {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div>
      <Link to="/eventos" style={{ fontSize: "0.9rem", color: "#38bdf8" }}>
        ← {t("visitor.eventDetail.backToEvents")}
      </Link>

      <div className="card" style={{ marginTop: "1rem" }}>
        <h1 className="section-title" style={{ marginBottom: "0.5rem" }}>
          {event.title}
        </h1>

        {event.location && (
          <p style={{ fontSize: "0.9rem", color: "#9ca3af", marginBottom: "0.5rem" }}>
            📍 {event.location}
          </p>
        )}

        <p style={{ fontSize: "0.9rem", color: "#9ca3af", marginBottom: "1.5rem" }}>
          🗓 {formatDate(event.startDate)}
          {event.endDate && ` - ${formatDate(event.endDate)}`}
        </p>

        {event.description && (
          <div style={{ marginTop: "1.5rem" }}>
            <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>{t("visitor.eventDetail.about")}</h2>
            <p style={{ color: "#e5e7eb", lineHeight: "1.6" }}>{event.description}</p>
          </div>
        )}

        <div style={{ marginTop: "2rem", display: "flex", gap: "0.75rem" }}>
          <button className="btn" onClick={() => alert(t("visitor.eventDetail.participateAlert"))}>
            {t("visitor.eventDetail.participate")}
          </button>
          <button className="btn btn-secondary" onClick={() => window.history.back()}>
            {t("common.back")}
          </button>
        </div>
      </div>
    </div>
  );
};
