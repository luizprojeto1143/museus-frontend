import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../../api/client";
import { useAuth } from "../../../auth/AuthContext";
import { 
  Plus, 
  Map as MapIcon, 
  Edit3, 
  Trash2, 
  Search, 
  MoreHorizontal,
  Route,
  Layers,
  CheckCircle,
  XCircle,
  Eye,
  Info,
  ChevronRight,
  Navigation
} from "lucide-react";
import { 
  Button, 
  Input, 
  Card, 
  Badge, 
  AnimateIn,
  ConfirmModal,
  AnimatedCounter
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useTerminology } from "../../../../hooks/useTerminology";
import { staggerContainer, staggerItem } from "@/lib/motion";

type AdminTrailItem = {
  id: string;
  name: string;
  worksCount: number;
  active: boolean;
  description?: string;
};

export const AdminTrails: React.FC = () => {
  const { t } = useTranslation();
  const term = useTerminology();
  const navigate = useNavigate();
  const { tenantId, hasPermission } = useAuth();
  const [trails, setTrails] = useState<AdminTrailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState<AdminTrailItem | null>(null);

  const fetchTrails = useCallback(async () => {
    if (!tenantId) return;

    try {
      setLoading(true);
      const res = await api.get("/trails", { params: { tenantId } });
      const apiTrails = (res.data as any[]).map((tr) => ({
        id: tr.id,
        name: tr.title ?? tr.name ?? "Sem nome",
        worksCount: tr.workIds?.length ?? 0,
        active: tr.active ?? true,
        description: tr.description
      }));
      setTrails(apiTrails);
    } catch (err) {
      console.error("Failed to fetch trails", err);
      toast.error("Erro ao carregar trilhas");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchTrails();
  }, [fetchTrails]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/trails/${id}`);
      toast.success("Trilha excluída com sucesso!");
      fetchTrails();
      setShowDeleteModal(null);
    } catch (err) {
      console.error("Failed to delete trail", err);
      toast.error("Erro ao excluir trilha");
    }
  };

  const filteredTrails = trails.filter(trail => 
    trail.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AnimateIn className="space-y-8 pb-20">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
             <Navigation className="text-gold-400" size={32} />
             {t("admin.trails.title")}
          </h1>
          <p className="text-slate-400 font-medium">
            Gerencie os circuitos e roteiros de visitação do seu acervo.
          </p>
        </div>

        {hasPermission("manage_trails") && (
          <Button
            onClick={() => navigate("/admin/trilhas/nova")}
            className="rounded-2xl h-14 px-8 bg-gold-400 text-slate-950 hover:bg-gold-500 font-black uppercase tracking-widest shadow-xl shadow-gold-400/20"
            leftIcon={<Plus size={20} />}
          >
            Nova Trilha
          </Button>
        )}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6 bg-white/[0.02] border-white/5 rounded-3xl group hover:border-gold-400/20 transition-colors">
           <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] mb-2">Total de Trilhas</p>
           <h3 className="text-3xl font-black text-white flex items-center gap-2">
              <AnimatedCounter value={trails.length} />
              <Route className="text-white/5 group-hover:text-gold-400/20 transition-colors" size={24} />
           </h3>
        </Card>
        <Card className="p-6 bg-white/[0.02] border-white/5 rounded-3xl group hover:border-green-400/20 transition-colors">
           <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] mb-2">Trilhas Ativas</p>
           <h3 className="text-3xl font-black text-white flex items-center gap-2">
              <AnimatedCounter value={trails.filter(t => t.active).length} />
              <CheckCircle className="text-white/5 group-hover:text-green-400/20 transition-colors" size={24} />
           </h3>
        </Card>
        <Card className="p-6 bg-white/[0.02] border-white/5 rounded-3xl group hover:border-blue-400/20 transition-colors">
           <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] mb-2">{term.works} Vinculadas</p>
           <h3 className="text-3xl font-black text-white flex items-center gap-2">
              <AnimatedCounter value={trails.reduce((acc, t) => acc + t.worksCount, 0)} />
              <Layers className="text-white/5 group-hover:text-blue-400/20 transition-colors" size={24} />
           </h3>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-gold-400 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Buscar trilhas pelo nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 h-14 bg-white/5 border border-white/5 focus:border-gold-400/50 rounded-2xl text-white outline-none transition-all focus:bg-white/[0.08]"
          />
        </div>
      </div>

      {/* Trail Grid */}
      <motion.div 
        variants={staggerContainer()}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-[240px] w-full rounded-[32px] animate-pulse bg-white/[0.02] border-white/5" />
            ))
          ) : filteredTrails.length === 0 ? (
            <div className="col-span-full py-20 text-center space-y-4">
               <Route className="mx-auto text-slate-800" size={48} />
               <p className="text-slate-500 font-medium">Nenhuma trilha encontrada.</p>
            </div>
          ) : (
            filteredTrails.map((trail) => (
              <motion.div key={trail.id} variants={staggerItem} layout>
                <Card className="group bg-white/[0.02] hover:bg-white/[0.04] border-white/5 hover:border-gold-400/30 transition-all rounded-[32px] p-8 h-full flex flex-col relative overflow-hidden">
                   {/* Background Icon Decor */}
                   <div className="absolute -right-8 -top-8 text-white/[0.02] group-hover:text-gold-400/[0.05] transition-colors pointer-events-none">
                      <Route size={160} />
                   </div>

                   <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-gold-400/10 flex items-center justify-center text-gold-400 group-hover:bg-gold-400 group-hover:text-slate-950 transition-all duration-500 shadow-lg shadow-gold-400/0 group-hover:shadow-gold-400/20">
                         <MapIcon size={24} />
                      </div>
                      <Badge variant={trail.active ? "success" : "outline"} className="rounded-full px-3 py-1">
                         {trail.active ? "Ativa" : "Inativa"}
                      </Badge>
                   </div>

                   <div className="flex-1">
                      <h4 className="text-xl font-bold text-white mb-2 group-hover:text-gold-400 transition-colors">{trail.name}</h4>
                      <p className="text-slate-500 text-sm line-clamp-2 mb-6">
                         {trail.description || "Sem descrição disponível para esta trilha."}
                      </p>
                   </div>

                   <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <div className="flex items-center gap-4">
                         <div className="space-y-0.5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">{term.works}</p>
                            <p className="text-white font-bold">{trail.worksCount}</p>
                         </div>
                      </div>
                      <div className="flex gap-2">
                         {hasPermission("manage_trails") && (
                           <Button
                             variant="glass"
                             size="sm"
                             className="h-10 w-10 p-0 rounded-xl border-white/5 hover:bg-red-500/10 hover:text-red-400 transition-all text-slate-600"
                             onClick={() => setShowDeleteModal(trail)}
                           >
                              <Trash2 size={16} />
                           </Button>
                         )}
                         <Button
                           onClick={() => navigate(`/admin/trilhas/${trail.id}`)}
                           variant="glass"
                           className="h-10 px-4 rounded-xl border-white/5 group/btn hover:bg-gold-400 hover:text-slate-950 transition-all font-black text-[10px] uppercase tracking-widest"
                         >
                            {hasPermission("manage_trails") ? "Editar" : "Ver"}
                            <ChevronRight size={14} className="ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
                         </Button>
                      </div>
                   </div>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      <ConfirmModal
        isOpen={!!showDeleteModal}
        onClose={() => setShowDeleteModal(null)}
        onConfirm={() => showDeleteModal && handleDelete(showDeleteModal.id)}
        title="Excluir Trilha?"
        message={`Tem certeza que deseja excluir a trilha "${showDeleteModal?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir Permanentemente"
        variant="danger"
      />
    </AnimateIn>
  );
};
