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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!tenantId) return;

    setLoading(true);
    api
      .get("/events", { params: { tenantId, page, limit: 10 } })
      .then((res) => {
        const responseData = res.data;
        const rawData = Array.isArray(responseData) ? responseData : (responseData.data || []);
        const meta = responseData.meta || {};

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
        setTotalPages(meta.totalPages || 1);
      })
      .catch((err) => {
        console.error("Failed to fetch events", err);
        setEvents([]);
      })
      .finally(() => setLoading(false));
  }, [tenantId, page]);

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
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center bg-zinc-900/50 border border-white/5 rounded-3xl">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-zinc-500 text-sm">Organizando agenda...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 bg-zinc-900/50 border border-white/5 rounded-3xl">
            <Calendar className="mx-auto mb-3 opacity-20" size={48} />
            <p>Nenhum evento agendado no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredEvents.map(ev => (
              <div key={ev.id} className="group bg-zinc-900/40 hover:bg-zinc-900/60 border border-white/5 hover:border-gold/30 rounded-3xl transition-all duration-300 overflow-hidden">
                <div className="flex flex-col md:flex-row items-stretch">
                  {/* Date Badge Side */}
                  <div className="md:w-32 bg-zinc-900/50 p-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 group-hover:bg-gold/5 transition-colors">
                    <span className="text-2xl font-black text-white group-hover:text-gold transition-colors">
                      {ev.date?.split('/')[0]}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-tighter">
                      {ev.date?.split('/')[1] === '01' ? 'JAN' :
                        ev.date?.split('/')[1] === '02' ? 'FEV' :
                          ev.date?.split('/')[1] === '03' ? 'MAR' :
                            ev.date?.split('/')[1] === '04' ? 'ABR' :
                              ev.date?.split('/')[1] === '05' ? 'MAI' :
                                ev.date?.split('/')[1] === '06' ? 'JUN' :
                                  ev.date?.split('/')[1] === '07' ? 'JUL' :
                                    ev.date?.split('/')[1] === '08' ? 'AGO' :
                                      ev.date?.split('/')[1] === '09' ? 'SET' :
                                        ev.date?.split('/')[1] === '10' ? 'OUT' :
                                          ev.date?.split('/')[1] === '11' ? 'NOV' : 'DEZ'}
                    </span>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusBadge(ev.status)}
                        <span className="text-[10px] font-bold text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full uppercase">
                          {ev.type || 'Geral'}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white group-hover:text-gold transition-all">
                        {ev.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                          <Clock size={14} className="text-gold/50" />
                          {ev.time}
                        </div>
                        {ev.location && (
                          <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                            <MapPin size={14} className="text-gold/50" />
                            <span className="truncate max-w-[200px]">{ev.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        onClick={() => navigate(`/admin/eventos/${ev.id}/dashboard`)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-zinc-400 hover:text-gold hover:bg-gold/10 rounded-2xl transition-all"
                      >
                        <BarChart2 size={18} />
                        <span className="hidden lg:inline">Relatório</span>
                      </button>
                      <button
                        onClick={() => navigate(`/admin/eventos/${ev.id}`)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-zinc-800 hover:bg-zinc-700 rounded-2xl transition-all border border-white/5"
                      >
                        <Edit size={18} />
                        <span className="hidden lg:inline">Editar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="border-white/10 text-zinc-400 hover:text-white"
          >
            ◀ Anterior
          </Button>
          <span className="text-zinc-500 text-sm">Página {page} de {totalPages}</span>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="border-white/10 text-zinc-400 hover:text-white"
          >
            Próxima ▶
          </Button>
        </div>
      )}
    </div>
  );
};
