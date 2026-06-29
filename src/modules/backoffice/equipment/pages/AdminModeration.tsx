import React, { useEffect, useState, useCallback } from "react";
import { logger } from "@/utils/logger";

import { useTranslation } from "react-i18next";
import { api } from "../../../../api/client";
import { useAuth } from "../../../auth/AuthContext";
import { 
  Shield, 
  Check, 
  X, 
  AlertTriangle, 
  MessageSquare, 
  Search, 
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  User,
  Star
} from "lucide-react";
import { 
  Card, 
  Button, 
  Badge, 
  AnimateIn, 
  AnimatedCounter 
} from "@/components/ui";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export const AdminModeration: React.FC = () => {
    const { t } = useTranslation();
    const { tenantId } = useAuth();
    
    const [reviews, setReviews] = useState<any[]>([]);
    const [stats, setStats] = useState<unknown>(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [r, s] = await Promise.all([
                api.get(`/moderation?tenantId=${tenantId}`),
                api.get(`/moderation/stats?tenantId=${tenantId}`)
            ]);
            setReviews(r.data);
            setStats(s.data);
        } catch (error) { 
            logger.error(error); 
            toast.error("Erro ao carregar dados de moderação."); 
        } finally { 
            setLoading(false); 
        }
    }, [tenantId]);

    useEffect(() => { 
        if (tenantId) fetchData(); 
    }, [tenantId, fetchData]);

    const onModerate = async (reviewId: string, isApproved: boolean, flagReason?: string) => {
        const loadingToast = toast.loading(isApproved ? "Aprovando avaliação..." : "Rejeitando avaliação...");
        try {
            await api.post(`/moderation/${reviewId}`, { isApproved, flagReason });
            toast.success(isApproved ? "Avaliação publicada!" : "Avaliação ocultada.", { id: loadingToast });
            fetchData();
        } catch (err) { 
            toast.error("Erro ao processar moderação.", { id: loadingToast }); 
        }
    };

    const filteredReviews = reviews.filter(r => {
        if (statusFilter === 'ALL') return true;
        if (statusFilter === 'PENDING') return !r.moderation || r.moderation.isApproved === null;
        if (statusFilter === 'APPROVED') return r.moderation?.isApproved === true;
        if (statusFilter === 'REJECTED') return r.moderation?.isApproved === false;
        return true;
    });

    const getAiConfidenceColor = (score: number) => {
        if (score > 0.8) return 'text-green-400';
        if (score > 0.5) return 'text-amber-400';
        return 'text-red-400';
    };

    const getAiConfidenceBg = (score: number) => {
        if (score > 0.8) return 'bg-green-500/10 border-green-500/20';
        if (score > 0.5) return 'bg-amber-500/10 border-amber-500/20';
        return 'bg-red-500/10 border-red-500/20';
    };

    return (
        <AnimateIn className="space-y-8 pb-32 max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                        <Shield className="text-gold-400" size={32} />
                        Central de <span className="text-gold-400">Moderação AI</span>
                    </h1>
                    <p className="text-slate-400 font-medium">Revise e controle a qualidade das interações dos visitantes.</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 backdrop-blur-xl">
                    {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setStatusFilter(f)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                statusFilter === f 
                                ? 'bg-gold-400 text-slate-950 shadow-lg' 
                                : 'text-slate-500 hover:text-white'
                            }`}
                        >
                            {f === 'ALL' ? 'Tudo' : f === 'PENDING' ? 'Pendentes' : f === 'APPROVED' ? 'Aprovados' : 'Rejeitados'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Dashboard */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-white/[0.02] border-white/5 p-6 rounded-[32px] group hover:bg-white/[0.04] transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                                <MessageSquare size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total</p>
                                <div className="text-2xl font-black text-white leading-none mt-1">
                                    <AnimatedCounter value={stats.totalReviews} />
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className={`bg-white/[0.02] border-white/5 p-6 rounded-[32px] group transition-all ${stats.pending > 0 ? 'border-amber-500/20 bg-amber-500/5' : ''}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${stats.pending > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-slate-400'}`}>
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pendentes</p>
                                <div className={`text-2xl font-black leading-none mt-1 ${stats.pending > 0 ? 'text-amber-400' : 'text-white'}`}>
                                    <AnimatedCounter value={stats.pending} />
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-white/[0.02] border-white/5 p-6 rounded-[32px] group hover:bg-white/[0.04] transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400">
                                <Check size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Aprovados</p>
                                <div className="text-2xl font-black text-green-400 leading-none mt-1">
                                    <AnimatedCounter value={stats.approved} />
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-white/[0.02] border-white/5 p-6 rounded-[32px] group hover:bg-white/[0.04] transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400">
                                <X size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Rejeitados</p>
                                <div className="text-2xl font-black text-red-400 leading-none mt-1">
                                    <AnimatedCounter value={stats.flagged} />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Content List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4 opacity-50">
                        <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Processando Inteligência...</span>
                    </div>
                ) : filteredReviews.length === 0 ? (
                    <Card className="p-20 text-center bg-white/[0.02] border-white/5 rounded-[40px]">
                        <Shield className="mx-auto text-slate-800 mb-6" size={64} />
                        <h3 className="text-xl font-bold text-white">Tudo em Ordem</h3>
                        <p className="text-slate-500 mt-2 max-w-xs mx-auto text-sm">Nenhuma avaliação encontrada com os filtros selecionados.</p>
                    </Card>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredReviews.map((review) => {
                            const mod = review.moderation;
                            const isModerated = mod && mod.isApproved !== null;
                            const aiConfidence = mod?.aiScore ?? 0;
                            
                            return (
                                <motion.div
                                    key={review.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Card className={`p-8 bg-white/[0.02] border-white/5 rounded-[32px] relative overflow-hidden transition-all group ${
                                        !isModerated ? 'border-gold-400/20' : 
                                        mod.isApproved ? 'border-green-500/10' : 'border-red-500/10'
                                    }`}>
                                        <div className="flex flex-col lg:flex-row gap-8 items-start">
                                            {/* AI Insights Sidebar */}
                                            <div className="w-full lg:w-48 shrink-0 space-y-4">
                                                <div className={`p-4 rounded-2xl border backdrop-blur-md transition-all ${getAiConfidenceBg(aiConfidence)}`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Sparkles size={14} className={getAiConfidenceColor(aiConfidence)} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Análise AI</span>
                                                    </div>
                                                    <div className={`text-2xl font-black tracking-tighter ${getAiConfidenceColor(aiConfidence)}`}>
                                                        {Math.round(aiConfidence * 100)}%
                                                    </div>
                                                    <p className="text-[8px] font-bold text-slate-500 uppercase mt-1">Índice de Confiança</p>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    {isModerated ? (
                                                        <Badge className={`w-full justify-center py-2 text-[8px] font-black uppercase tracking-widest ${
                                                            mod.isApproved ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                                        }`}>
                                                            {mod.isApproved ? 'Publicado' : mod.flagReason || 'Ocultado'}
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="w-full justify-center py-2 text-[8px] font-black uppercase tracking-widest bg-gold-400/10 text-gold-400 border-gold-400/20">
                                                            Aguardando
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Review Content */}
                                            <div className="flex-1 space-y-4 min-w-0">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="space-y-1 min-w-0">
                                                        <div className="flex items-center gap-3">
                                                            <h4 className="text-xl font-bold text-white truncate">{review.work?.title || "Obra Desconhecida"}</h4>
                                                            <div className="flex items-center gap-1 text-gold-400 px-2 py-0.5 bg-gold-400/10 rounded-lg text-xs font-black">
                                                                <Star size={12} fill="currentColor" />
                                                                {review.rating}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                            <div className="flex items-center gap-1.5">
                                                                <User size={12} className="text-slate-600" />
                                                                {review.visitor?.name || "Anônimo"}
                                                            </div>
                                                            <span className="text-slate-800">•</span>
                                                            <div className="flex items-center gap-1.5">
                                                                <Clock size={12} className="text-slate-600" />
                                                                {new Date(review.createdAt).toLocaleDateString("pt-BR")}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {!isModerated && (
                                                        <div className="flex gap-2">
                                                            <Button 
                                                                onClick={() => onModerate(review.id, false, 'SPAM')}
                                                                variant="glass"
                                                                className="h-12 w-12 rounded-xl p-0 border-red-500/20 text-red-400 hover:bg-red-500/20"
                                                            >
                                                                <X size={20} />
                                                            </Button>
                                                            <Button 
                                                                onClick={() => onModerate(review.id, true)}
                                                                className="h-12 px-6 rounded-xl bg-green-500 text-slate-950 font-black uppercase tracking-widest text-[10px]"
                                                                leftIcon={<Check size={16} />}
                                                            >
                                                                Aprovar
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="relative">
                                                    {review.comment ? (
                                                        <div className="p-6 bg-black/20 rounded-[24px] border border-white/5 text-slate-300 italic leading-relaxed text-sm">
                                                            "{review.comment}"
                                                        </div>
                                                    ) : (
                                                        <div className="text-slate-600 text-xs italic">Avaliação sem comentário escrito.</div>
                                                    )}
                                                </div>

                                                {mod?.aiReason && (
                                                    <div className="flex items-start gap-3 p-4 bg-gold-400/5 rounded-2xl border border-gold-400/10">
                                                        <AlertTriangle size={14} className="text-gold-400 shrink-0 mt-0.5" />
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gold-400/60">Parecer da Inteligência</p>
                                                            <p className="text-[11px] text-slate-400 font-medium italic">{mod.aiReason}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Background Glow */}
                                        {!isModerated && (
                                            <div className="absolute -right-20 -top-20 w-40 h-40 bg-gold-400/5 rounded-full blur-3xl pointer-events-none group-hover:bg-gold-400/10 transition-all" />
                                        )}
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>
        </AnimateIn>
    );
};
