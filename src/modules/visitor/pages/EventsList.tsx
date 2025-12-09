import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, isDemoMode } from "../../../api/client";

type EventItem = {
  id: string;
  title: string;
  date?: string;
  time?: string;
  location?: string;
};

export const EventsList: React.FC = () => {
  const { t } = useTranslation();
  const mock: EventItem[] = [
    {
      id: "1",
      title: "Oficina de aquarela",
      date: "15/12/2025",
      time: "14:00",
      location: "Atelier 1"
    },
    {
      id: "2",
      title: "Visita guiada temática",
      date: "20/12/2025",
      time: "10:00",
      location: "Saguão principal"
    }
  ];

  const [apiEvents, setApiEvents] = useState<EventItem[] | null>(null);
  const tenantId = import.meta.env.VITE_DEFAULT_TENANT_ID as string | undefined;
  const isDemo = isDemoMode || !tenantId;

  useEffect(() => {
    if (isDemo) return;

    api
      .get("/events", { params: { tenantId } })
      .then((res) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiEvents = (res.data as any[]).map((e) => ({
          id: e.id,
          title: e.title,
          date: e.date ?? e.startsAt ?? "",
          time: e.time ?? "",
          location: e.location ?? ""
        }));
        setApiEvents(apiEvents);
      })
      .catch(() => {
        console.error("Failed to fetch events");
      });
  }, [isDemo, tenantId]);

  const events = isDemo ? mock : (apiEvents || []);

  return (
    <div>
      <h1 className="section-title">{t("visitor.events.title")}</h1>
      <p className="section-subtitle">
        {t("visitor.events.subtitle")}
      </p>

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
    </div>
  );
};
