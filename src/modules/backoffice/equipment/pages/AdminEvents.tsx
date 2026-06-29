import React, { useEffect, useState } from "react";
import { logger } from "@/utils/logger";

import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../../api/client";
import { useAuth } from "../../../auth/AuthContext";
import { useTerminology } from "../../../../hooks/useTerminology";
import { 
  Button, 
  Input, 
  Card, 
  Badge, 
  AnimateIn 
} from "@/components/ui";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Search, 
  Plus, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Edit, 
  BarChart2,
  CalendarDays,
  MoreHorizontal,
  Eye,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

type AdminEventItem = {
  id: string;
  title: string;
  date?: string; // formatted
  day?: string;
  month?: string;
  time?: string; // formatted
  rawDate?: string; // ISO
  type?: string;
  status: string;
  location?: string;
};

export const AdminEvents: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId, hasPermission } = useAuth();
  const term = useTerminology();
  const navigate = useNavigate();
  const [events, setEvents] = useState<AdminEventItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchEvents = React.useCallback(async () => {
    if (!tenantId) return;

    try {
      setLoading(true);
      const res = await api.get("/events", { params: { tenantId, page, limit: 10 } });
      const responseData = res.data;
      const rawData = Array.isArray(responseData) ? responseData : (responseData.data || []);
      const meta = responseData.meta || {};

      const eventsData = rawData.map((e: unknown) => {
        const d = e.startDate ? new Date(e.startDate) : null;
        return {
          id: e.id,
          title: e.title,
          date: d ? d.toLocaleDateString() : "",
          day: d ? d.getDate().toString().padStart(2, '0') : "",
          month: d ? d.toLocaleString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '') : "",
          time: d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
          rawDate: e.startDate,
          type: e.type,
          status: e.status || (e.active ? "PUBLISHED" : "DRAFT"),
          location: e.location || (e.isOnline ? "Online" : "")
        };
      });
      setEvents(eventsData);
      setTotalPages(meta.totalPages || 1);
    } catch (err) {
      logger.error("Failed to fetch events", err);
      toast.error("Erro ao carregar eventos");
    } finally {
      setLoading(false);
    }
  }, [tenantId, page]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Publicado</Badge>;
      case "CANCELED":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Cancelado</Badge>;
      case "COMPLETED":
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Concluído</Badge>;
      default:
        return <Badge className="bg-slate-500/10 text-slate-400 border-white/10">Rascunho</Badge>;
    }
  }

  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AnimateIn className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
             <CalendarDays className="text-gold-400" size={32} />
             {term.events}
          </h1>
          <p className="text-slate-400 font-medium">
            Gerencie toda a programação cultural e exposições temporárias.
          </p>
        </div>

        {hasPermission("manage_events") && (
          <Button
            onClick={() => navigate("/admin/eventos/novo")}
            className="rounded-2xl h-14 px-8 bg-gold-400 text-slate-950 hover:bg-gold-500 font-black uppercase tracking-widest shadow-xl shadow-gold-400/20"
            leftIcon={<Plus size={20} />}
          >
            Novo {term.event}
          </Button>
        )}
      </div>

      {/* Filters Area */}
      <Card className="p-4 bg-white/[0.02] border-white/5 rounded-3xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-gold-400 transition-colors" size={20} />
            <Input
              placeholder={`Buscar ${term.events.toLowerCase()} pelo título...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-12 bg-white/5 border-white/5 focus:border-gold-400 rounded-2xl h-12"
            />
          </div>
          <Button variant="glass" className="rounded-2xl h-12 px-6 border-white/5 bg-white/5 text-slate-400 hover:text-white">
            <Filter size={18} className="mr-2" /> Filtros Avançados
          </Button>
        </div>
      </Card>

      {/* Events List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={`skeleton-${i}`} className="h-32 bg-white/[0.02] border border-white/5 rounded-[32px] animate-pulse" />
            ))
          ) : filteredEvents.length > 0 ? (
            filteredEvents.map((ev) => (
              <motion.div
                key={ev.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative"
              >
                <Card className="overflow-hidden border-white/5 bg-black/20 hover:bg-white/[0.03] transition-all duration-300 rounded-[32px] hover:border-gold-400/30">
                  <div className="flex flex-col md:flex-row items-stretch">
                    {/* Date Badge Side */}
                    <div className="md:w-36 bg-white/[0.02] p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 group-hover:bg-gold-400/5 transition-colors">
                      <span className="text-4xl font-black text-white group-hover:text-gold-400 transition-colors leading-none">
                        {ev.day}
                      </span>
                      <span className="text-xs font-black text-slate-500 tracking-widest mt-1 uppercase">
                        {ev.month}
                      </span>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          {getStatusBadge(ev.status)}
                          <Badge variant="outline" className="bg-slate-500/10 border-white/5 text-slate-500 uppercase text-[10px] tracking-widest">
                            {ev.type || 'Geral'}
                          </Badge>
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white group-hover:text-gold-400 transition-all tracking-tight">
                          {ev.title}
                        </h3>
                        
                        <div className="flex flex-wrap gap-6">
                          <div className="flex items-center gap-2 text-slate-400">
                             <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gold-400/60">
                                <Clock size={16} />
                             </div>
                             <span className="text-sm font-medium">{ev.time}</span>
                          </div>
                          {ev.location && (
                            <div className="flex items-center gap-2 text-slate-400">
                               <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gold-400/60">
                                  <MapPin size={16} />
                               </div>
                               <span className="text-sm font-medium truncate max-w-[200px]">{ev.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 self-end md:self-center">
                        {hasPermission("view_analytics") && (
                          <Button
                            variant="glass"
                            size="sm"
                            onClick={() => navigate(`/admin/eventos/${ev.id}/dashboard`)}
                            className="rounded-2xl border-white/5 h-12 px-6 hover:border-gold-400/50 text-slate-400 hover:text-gold-400"
                          >
                            <BarChart2 size={18} className="mr-2" /> 
                            Relatório
                          </Button>
                        )}
                        
                        <Button
                          onClick={() => navigate(`/admin/eventos/${ev.id}`)}
                          className="rounded-2xl h-12 px-6 bg-white/5 border-white/5 hover:bg-white/10 text-white font-bold"
                        >
                          {hasPermission("manage_events") ? (
                            <><Edit size={18} className="mr-2" /> Editar</>
                          ) : (
                            <><Eye size={18} className="mr-2" /> Ver</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="p-20 text-center border-white/5 bg-black/20 rounded-[40px]">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-slate-700 border border-white/5 border-dashed">
                    <Calendar size={48} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Nenhum evento encontrado</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">Tente ajustar sua busca ou crie um novo evento cultural para o seu museu.</p>
                  </div>
                  <Button
                    onClick={() => navigate("/admin/eventos/novo")}
                    variant="glass"
                    className="rounded-2xl h-12 border-gold-400/20 text-gold-400"
                  >
                    Criar meu primeiro evento
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-6 pt-8">
          <Button
            variant="glass"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="rounded-2xl w-12 h-12 p-0 border-white/5 flex items-center justify-center text-slate-500 hover:text-white disabled:opacity-20"
          >
            <ChevronLeft size={24} />
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-white font-black">{page}</span>
            <span className="text-slate-600 font-bold">/</span>
            <span className="text-slate-500 font-bold">{totalPages}</span>
          </div>
          <Button
            variant="glass"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="rounded-2xl w-12 h-12 p-0 border-white/5 flex items-center justify-center text-slate-500 hover:text-white disabled:opacity-20"
          >
            <ChevronRight size={24} />
          </Button>
        </div>
      )}
    </AnimateIn>
  );
};
