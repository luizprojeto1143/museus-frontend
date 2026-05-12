import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { 
  Users, 
  Search, 
  Download, 
  ChevronRight, 
  Star, 
  Map, 
  Eye, 
  Calendar,
  Award,
  Filter,
  MoreVertical,
  Mail,
  Clock
} from "lucide-react";
import { 
  Card, 
  Button, 
  Badge, 
  AnimateIn,
  AnimatedCounter
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

interface Visitor {
  id: string;
  name: string;
  email: string;
  age?: number;
  xp: number;
  trailsCompleted: number;
  worksVisited: number;
  eventsAccessed: number;
  firstAccessAt: string;
  lastAccessAt: string;
}

export const AdminVisitors: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useAuth();
  const navigate = useNavigate();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadVisitors = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/visitors?tenantId=${tenantId}&limit=50`);
      setVisitors(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
    } catch (err) {
      console.error("Erro ao carregar visitantes", err);
      toast.error("Erro ao carregar lista de visitantes");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadVisitors();
  }, [loadVisitors]);

  const filteredVisitors = visitors.filter(v =>
    v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const csv = [
      ["Nome", "Email", "Idade", "XP", "Trilhas", "Obras", "Primeiro Acesso", "Último Acesso"],
      ...filteredVisitors.map(v => [
        v.name,
        v.email,
        v.age || "",
        v.xp,
        v.trailsCompleted,
        v.worksVisited,
        new Date(v.firstAccessAt).toLocaleDateString(),
        new Date(v.lastAccessAt).toLocaleDateString()
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visitantes-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Lista exportada com sucesso!");
  };

  return (
    <AnimateIn className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
             <Users className="text-gold-400" size={32} />
             Comunidade de Visitantes
          </h1>
          <p className="text-slate-400 font-medium">Gerencie e acompanhe o engajamento dos seus visitantes.</p>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-gold-400 transition-colors" size={18} />
              <input 
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 pl-12 pr-6 rounded-2xl bg-white/5 border border-white/5 focus:border-gold-400/50 focus:bg-white/[0.08] transition-all text-sm text-white w-full md:w-[300px] outline-none"
              />
           </div>
           <Button variant="glass" onClick={handleExportCSV} className="rounded-2xl h-12 border-white/5">
              <Download size={18} />
           </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white/[0.02] border-white/5 rounded-3xl">
           <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] mb-2">Total Registrado</p>
           <h3 className="text-3xl font-black text-white"><AnimatedCounter value={total} /></h3>
        </Card>
        <Card className="p-6 bg-white/[0.02] border-white/5 rounded-3xl">
           <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] mb-2">XP Médio</p>
           <h3 className="text-3xl font-black text-white">
              <AnimatedCounter value={visitors.length > 0 ? Math.round(visitors.reduce((acc, v) => acc + v.xp, 0) / visitors.length) : 0} />
           </h3>
        </Card>
        <Card className="p-6 bg-white/[0.02] border-white/5 rounded-3xl">
           <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] mb-2">Engajamento</p>
           <h3 className="text-3xl font-black text-white">Alta</h3>
        </Card>
      </div>

      {/* Visitor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-8 bg-white/[0.02] border-white/5 rounded-[32px] h-[240px] animate-pulse" />
            ))
          ) : filteredVisitors.length === 0 ? (
            <div className="col-span-full py-20 text-center">
               <Users className="mx-auto text-slate-800 mb-4" size={48} />
               <p className="text-slate-500">Nenhum visitante encontrado.</p>
            </div>
          ) : (
            filteredVisitors.map((visitor) => (
              <motion.div
                key={visitor.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card className="p-8 bg-white/[0.02] border-white/5 rounded-[32px] hover:border-gold-400/30 transition-all group relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-10 transition-opacity">
                      <Users size={120} />
                   </div>

                   <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                         <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-400 to-bronze-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-gold-400/20">
                            {visitor.name?.charAt(0).toUpperCase() || '?'}
                         </div>
                         <div className="min-w-0">
                            <h4 className="text-white font-bold truncate pr-4">{visitor.name || "Sem Nome"}</h4>
                            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                               <Mail size={10} />
                               <span className="truncate max-w-[120px]">{visitor.email || "—"}</span>
                            </div>
                         </div>
                      </div>
                      <Badge className="bg-gold-400/10 text-gold-400 border-gold-400/20">{visitor.xp} XP</Badge>
                   </div>

                   <div className="grid grid-cols-3 gap-4 mb-8">
                      <div className="space-y-1">
                         <div className="flex items-center gap-1.5 text-slate-600">
                            <Map size={12} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Trilhas</span>
                         </div>
                         <p className="text-white font-bold">{visitor.trailsCompleted}</p>
                      </div>
                      <div className="space-y-1 text-center border-x border-white/5 px-2">
                         <div className="flex items-center justify-center gap-1.5 text-slate-600">
                            <Eye size={12} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Obras</span>
                         </div>
                         <p className="text-white font-bold">{visitor.worksVisited}</p>
                      </div>
                      <div className="space-y-1 text-right">
                         <div className="flex items-center justify-end gap-1.5 text-slate-600">
                            <Calendar size={12} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Eventos</span>
                         </div>
                         <p className="text-white font-bold">{visitor.eventsAccessed}</p>
                      </div>
                   </div>

                   <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                         <Clock size={12} />
                         <span>Acesso: {new Date(visitor.lastAccessAt).toLocaleDateString()}</span>
                      </div>
                      <Link 
                        to={`/admin/visitantes/${visitor.id}`}
                        className="text-gold-400 hover:text-white transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-widest group/btn"
                      >
                         Ver Perfil
                         <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                   </div>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </AnimateIn>
  );
};
