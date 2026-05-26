import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useTerminology } from "../../../hooks/useTerminology";
import { useDebounce } from "../../../hooks/useDebounce";
import { 
  Plus, 
  Search, 
  Edit3, 
  Eye, 
  Trash2, 
  History, 
  ExternalLink, 
  MoreVertical,
  Filter,
  Image as ImageIcon,
  Code,
  User as UserIcon,
  ChevronRight
} from "lucide-react";
import { 
  Card, 
  Button, 
  Input, 
  Badge, 
  Skeleton, 
  ConfirmModal, 
  EmptyState,
  AnimateIn
} from "@/components/ui";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";

type AdminWorkItem = {
  id: string;
  title: string;
  artist?: string;
  published?: boolean;
  vestigeActive?: boolean;
  code?: string;
  imageUrl?: string;
};

export const AdminWorks: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId, hasPermission } = useAuth();
  const navigate = useNavigate();
  const term = useTerminology();

  const [works, setWorks] = useState<AdminWorkItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);

  const [showConfirmExpire, setShowConfirmExpire] = useState<string | null>(null);

  const loadWorks = React.useCallback(async () => {
    if (!tenantId) return;

    setLoading(true);
    try {
      const res = await api.get("/works", { 
        params: { tenantId, page, limit: 12, search: debouncedSearch || undefined } 
      });
      const responseData = res.data;
      const worksList = responseData.data || [];
      const pagination = responseData.pagination || {};

      const apiWorks = worksList.map((w: any) => ({
        id: w.id,
        title: w.title,
        artist: w.artist ?? "",
        published: w.published ?? true,
        vestigeActive: w.vestigeActive ?? false,
        imageUrl: w.imageUrl,
        code: w.qrCode?.code || ""
      }));

      setWorks(apiWorks);
      setTotal(pagination.total || 0);
      setTotalPages(pagination.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch works", err);
      toast.error("Não foi possível carregar o acervo.");
      setWorks([]);
    } finally {
      setLoading(false);
    }
  }, [tenantId, page, debouncedSearch]);

  React.useEffect(() => {
    loadWorks();
  }, [loadWorks]);

  const handleExpire = async (id: string) => {
    try {
      await api.post(`/vestiges/expire/${id}`);
      toast.success("Vestígio expirado com sucesso!");
      loadWorks();
    } catch (err) {
      toast.error("Erro ao expirar vestígio.");
    } finally {
      setShowConfirmExpire(null);
    }
  };

  return (
    <AnimateIn variant="fadeUp" className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">{term.works}</h1>
          <p className="text-slate-400 font-medium">{t("admin.works.subtitle", "Gerencie o acervo digital e físico do museu.")}</p>
        </div>
        
        {hasPermission("manage_works") && (
          <Button 
            onClick={() => navigate("/admin/obras/nova")}
            leftIcon={<Plus size={18} />}
            className="h-12 px-8 rounded-2xl shadow-xl shadow-gold-500/10 bg-gold-400 text-slate-950 font-black"
          >
            Nova {term.work}
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder={`Buscar ${term.work.toLowerCase()}...`}
            value={searchInput}
            onChange={e => { setSearchInput(e.target.value); setPage(1); }}
            className="w-full pl-12 pr-6 h-14 bg-white/5 border border-white/5 focus:border-gold-400/50 rounded-2xl text-white outline-none transition-all focus:bg-white/[0.08]"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="glass" className="h-14 flex-1 md:flex-none px-6 rounded-2xl border-white/5" leftIcon={<Filter size={18} />}>
            Filtros
          </Button>
          <Badge className="h-14 px-6 flex items-center justify-center rounded-2xl bg-white/5 border-white/5 text-slate-400 font-black uppercase tracking-widest text-[10px]">
            {total || works.length} Itens
          </Badge>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
             <Card key={i} className="h-[280px] w-full rounded-[32px] animate-pulse bg-white/[0.02] border-white/5" />
           ))}
        </div>
      ) : (
        <motion.div 
          variants={staggerContainer()}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {works.length === 0 ? (
            <div className="col-span-full py-20">
              <EmptyState 
                title={`Nenhuma ${term.work.toLowerCase()} encontrada`}
                description="Tente ajustar sua busca ou adicione uma nova obra ao acervo."
              />
            </div>
          ) : (
            works.map(work => (
              <motion.div key={work.id} variants={staggerItem}>
                <Card className="group bg-white/[0.02] hover:bg-white/[0.04] border-white/5 hover:border-gold-400/30 transition-all rounded-[32px] overflow-hidden flex flex-col h-full relative">
                   <div className="h-48 relative overflow-hidden bg-black/40">
                      {work.imageUrl ? (
                        <img src={work.imageUrl} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-800">
                           <ImageIcon size={48} />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 flex gap-2">
                         <Badge variant={work.published ? "success" : "outline"} className="backdrop-blur-md rounded-full px-3 py-1">
                            {work.published ? 'Publicado' : 'Rascunho'}
                         </Badge>
                      </div>
                      {work.vestigeActive && (
                        <div className="absolute bottom-4 left-4">
                           <Badge className="bg-gold-400 text-slate-950 border-none rounded-full font-black text-[9px] uppercase tracking-widest px-3 py-1">
                              {t('vestige.admin.vestigeMode', 'Vestígio Ativo')}
                           </Badge>
                        </div>
                      )}
                   </div>

                   <div className="p-6 flex flex-col flex-1">
                      <div className="mb-4">
                         <h4 className="text-white font-bold text-lg line-clamp-1 group-hover:text-gold-400 transition-colors">{work.title}</h4>
                         <div className="flex items-center gap-2 mt-1 text-slate-500 text-[11px] font-bold uppercase tracking-widest">
                            <UserIcon size={12} />
                            <span className="truncate">{work.artist || "Artista Desconhecido"}</span>
                         </div>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                         <div className="flex items-center gap-2 text-gold-400 font-mono text-[10px] font-bold">
                            <Code size={12} />
                            {work.code || '---'}
                         </div>
                         <div className="flex gap-2">
                            {work.vestigeActive && hasPermission("manage_works") && (
                              <Button 
                                variant="glass" 
                                size="sm"
                                className="h-9 px-3 rounded-xl border-white/5 text-red-400 hover:bg-red-500/10"
                                onClick={() => setShowConfirmExpire(work.id)}
                              >
                                 Expirar
                              </Button>
                            )}
                            <Button
                              variant="glass"
                              size="sm"
                              className="h-9 w-9 p-0 rounded-xl border-white/5 hover:bg-gold-400 hover:text-slate-950 transition-all"
                              onClick={() => navigate(`/admin/obras/${work.id}`)}
                            >
                               {hasPermission("manage_works") ? <Edit3 size={16} /> : <Eye size={16} />}
                            </Button>
                         </div>
                      </div>
                   </div>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-between items-center px-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
            {page} / {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="glass"
              className="rounded-2xl border-white/5 h-12 px-6 font-black text-[10px] uppercase tracking-widest"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="glass"
              className="rounded-2xl border-white/5 h-12 px-6 font-black text-[10px] uppercase tracking-widest"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!showConfirmExpire}
        onClose={() => setShowConfirmExpire(null)}
        onConfirm={() => showConfirmExpire && handleExpire(showConfirmExpire)}
        title="Expirar Vestígio?"
        message="Todos os selos coletados se tornarão relíquias definitivas. Esta ação não pode ser desfeita."
        confirmText="Confirmar Expiração"
        variant="danger"
      />
    </AnimateIn>
  );
};
