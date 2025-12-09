import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, isDemoMode } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";

type AdminEventItem = {
  id: string;
  title: string;
  date?: string;
  time?: string;
  active?: boolean;
};

export const AdminEvents: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useAuth();
  // Mock data
  const mockEvents: AdminEventItem[] = [
    { id: "1", title: "Oficina de aquarela", date: "15/12/2025", time: "14:00", active: true }
  ];

  const [events, setEvents] = useState<AdminEventItem[]>(isDemoMode ? mockEvents : []);

  useEffect(() => {
    if (isDemoMode || !tenantId) return;

    api
      .get("/events", { params: { tenantId } })
      .then((res) => {
        const apiEvents = (res.data as { id: string; title: string; date?: string; startsAt?: string; time?: string; active?: boolean }[]).map((e) => ({
          id: e.id,
          title: e.title,
          date: e.date ?? e.startsAt ?? "",
          time: e.time ?? "",
          active: e.active ?? true
        }));
        setEvents(apiEvents);
      })
      .catch(() => {
        // Silently fail or use mock if needed
      });
  }, [tenantId]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div>
          <h1 className="section-title">{t("admin.events.title")}</h1>
          <p className="section-subtitle">
            {t("admin.events.subtitle")}
          </p>
        </div>
        <Link to="/admin/eventos/novo" className="btn">
          {t("admin.events.new")}
        </Link>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>{t("admin.events.table.title")}</th>
            <th>{t("admin.events.table.date")}</th>
            <th>{t("admin.events.table.time")}</th>
            <th>{t("admin.events.table.status")}</th>
            <th style={{ textAlign: "right" }}>{t("admin.events.table.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {events.map(ev => (
            <tr key={ev.id}>
              <td>{ev.title}</td>
              <td>{ev.date}</td>
              <td>{ev.time}</td>
              <td>
                <span className="chip">{ev.active ? t("admin.events.status.active") : t("admin.events.status.inactive")}</span>
              </td>
              <td style={{ textAlign: "right" }}>
                <Link to={`/admin/eventos/${ev.id}`} className="btn btn-secondary">
                  {t("common.edit")}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
