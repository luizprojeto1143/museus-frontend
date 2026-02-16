import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useTerminology } from "../../../hooks/useTerminology";
import { Button, Input } from "../../../components/ui";
import { Calendar, Clock, MapPin, Search, Plus, Filter, MoreVertical, Edit, BarChart2 } from "lucide-react";

type AdminEventItem = {
  id: string;
  title: string;
  date?: string; // formatted
  time?: string; // formatted
  rawDate?: string; // ISO
  type?: string;
  status: string;
  location?: string;
};

export const AdminEvents: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useAuth();
  const term = useTerminology();
  const navigate = useNavigate();
  const [events, setEvents] = useState<AdminEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!tenantId) return;

    setLoading(true);
    api
      .get("/events", { params: { tenantId } })
      .then((res) => {
        const rawData = Array.isArray(res.data) ? res.data : (res.data.data || []);

        const events = rawData.map((e: any) => ({
          id: e.id,
          title: e.title,
          date: e.startDate ? new Date(e.startDate).toLocaleDateString() : "",
          time: e.startDate ? new Date(e.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
          rawDate: e.startDate,
          type: e.type,
          status: e.status || (e.active ? "PUBLISHED" : "DRAFT"),
          location: e.location || (e.isOnline ? "Online" : "")
        }));
        setEvents(events);
      })
      .catch((err) => {
        console.error("Failed to fetch events", err);
        setEvents([]);
      })
      .finally(() => setLoading(false));
  }, [tenantId]);

  const getStatusBadge = (status: string) => {
    const map = {
      "PUBLISHED": { label: "Publicado", class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
      "DRAFT": { label: "Rascunho", class: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
      "CANCELED": { label: "Cancelado", class: "bg-red-500/10 text-red-500 border-red-500/20" },
      "COMPLETED": { label: "Concluído", class: "bg-blue-500/10 text-blue-400 border-blue-500/20" }
    };
    const s = map[status as keyof typeof map] || map["DRAFT"];
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${s.class}`}>
        {s.label}
      </span>
    );
  }

  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto pb-24 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            {term.events}
          </h1>
          <p className="text-zinc-400 text-sm font-medium mt-1">
            Gerencie toda a programação cultural.
          </p>
        </div>
        <Link to="/admin/eventos/novo">
          <Button className="bg-gold text-black hover:bg-gold/90 font-bold shadow-lg shadow-gold/10 border-none">
            <Plus size={18} className="mr-2" /> Novo {term.event}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <Input
            placeholder={`Buscar ${term.events.toLowerCase()}...`}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 bg-zinc-900/50 border-white/5 text-white focus:border-gold/30"
          />
        </div>
        <Button variant="outline" className="border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white">
          <Filter size={18} className="mr-2" /> Filtros
        </Button>
      </div>

      {/* List */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-zinc-500 text-sm">Carregando...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <Calendar className="mx-auto mb-3 opacity-20" size={48} />
            <p>Nenhum evento encontrado.</p>
          </div>
        ) : (
          <div className="w-full">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
              <div className="col-span-5 md:col-span-4">Evento</div>
              <div className="col-span-3 md:col-span-2 hidden md:block">Data/Hora</div>
              <div className="col-span-3 md:col-span-2 hidden md:block">Local</div>
              <div className="col-span-3 md:col-span-2">Status</div>
              <div className="col-span-4 md:col-span-2 text-right">Ações</div>
            </div>

            <div className="divide-y divide-white/5">
              {filteredEvents.map(ev => (
                <div key={ev.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors group">
                  <div className="col-span-5 md:col-span-4">
                    <div className="font-bold text-white group-hover:text-gold transition-colors">{ev.title}</div>
                    <div className="text-xs text-zinc-500 mt-0.5 md:hidden">
                      {ev.date} • {ev.time}
                    </div>
                    {ev.type && (
                      <span className="inline-block mt-1 text-[10px] bg-white/5 text-zinc-400 px-1.5 py-0.5 rounded border border-white/5">
                        {ev.type === 'OTHER' ? 'Geral' : ev.type}
                      </span>
                    )}
                  </div>

                  <div className="col-span-3 md:col-span-2 hidden md:block text-sm text-zinc-300">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-zinc-500" />
                      {ev.date}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                      <Clock size={12} />
                      {ev.time}
                    </div>
                  </div>

                  <div className="col-span-3 md:col-span-2 hidden md:block text-sm text-zinc-400">
                    {ev.location && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-zinc-600" />
                        <span className="truncate">{ev.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="col-span-3 md:col-span-2">
                    {getStatusBadge(ev.status)}
                  </div>

                  <div className="col-span-4 md:col-span-2 flex justify-end gap-2">
                    <button
                      onClick={() => navigate(`/admin/eventos/${ev.id}/dashboard`)}
                      className="p-2 text-zinc-400 hover:text-gold hover:bg-gold/10 rounded-xl transition-colors"
                      title="Dashboard"
                    >
                      <BarChart2 size={18} />
                    </button>
                    <button
                      onClick={() => navigate(`/admin/eventos/${ev.id}`)}
                      className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
