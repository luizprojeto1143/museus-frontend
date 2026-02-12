import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useTerminology } from "../../../hooks/useTerminology";

type AdminEventItem = {
  id: string;
  title: string;
  date?: string;
  time?: string;
  status: string;
};

export const AdminEvents: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useAuth();
  const term = useTerminology(); // Hook for dynamic terms
  const [events, setEvents] = useState<AdminEventItem[]>([]);

  useEffect(() => {
    if (!tenantId) return;

    api
      .get("/events", { params: { tenantId } })
      .then((res) => {
        // Handle pagination structure if present, or array
        const rawData = Array.isArray(res.data) ? res.data : (res.data.data || []);

        const events = rawData.map((e: any) => ({
          id: e.id,
          title: e.title,
          date: e.startDate ? new Date(e.startDate).toLocaleDateString() : "",
          time: e.startDate ? new Date(e.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
          status: e.status || (e.active ? "PUBLISHED" : "DRAFT") // Fallback
        }));
        setEvents(events);
      })
      .catch((err) => {
        console.error("Failed to fetch events", err);
        setEvents([]);
      });
  }, [tenantId]);

  const getStatusBadge = (status: string) => {
    const map = {
      "PUBLISHED": { label: "Publicado", class: "bg-green-500/20 text-green-400" },
      "DRAFT": { label: "Rascunho", class: "bg-slate-500/20 text-slate-400" },
      "CANCELED": { label: "Cancelado", class: "bg-red-500/20 text-red-400" },
      "COMPLETED": { label: "Concluído", class: "bg-blue-500/20 text-blue-400" }
    };
    const s = map[status as keyof typeof map] || map["DRAFT"];
    return <span className={`px-2 py-1 rounded text-xs font-bold ${s.class}`}>{s.label}</span>;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div>
          <h1 className="section-title">{term.events}</h1>
          <p className="section-subtitle">
            Gerencie a {term.events.toLowerCase()} e atividades
          </p>
        </div>
        <Link to="/admin/eventos/novo" className="btn">
          + Novo {term.event}
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
                {getStatusBadge(ev.status)}
              </td>
              <td style={{ textAlign: "right" }}>
                <Link to={`/admin/eventos/${ev.id}`} className="btn btn-secondary">
                  {t("common.edit")}
                </Link>
                <Link to={`/admin/eventos/${ev.id}/dashboard`} className="btn btn-primary ml-2">
                  Gerenciar
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
