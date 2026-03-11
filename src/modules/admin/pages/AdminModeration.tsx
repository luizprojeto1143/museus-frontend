import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, Shield, Check, X, AlertTriangle, MessageSquare } from "lucide-react";
import { toast } from "react-hot-toast";

export const AdminModeration: React.FC = () => {
  const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [reviews, setReviews] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
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
        } catch (error) { console.error(error); toast.error("Erro ao carregar"); }
        finally { setLoading(false); }
    }, [tenantId]);

    useEffect(() => { if (tenantId) fetchData(); }, [tenantId, fetchData]);

    const onModerate = async (reviewId: string, isApproved: boolean, flagReason?: string) => {
        try {
            await api.post(`/moderation/${reviewId}`, { isApproved, flagReason });
            toast.success(isApproved ? "Aprovada!" : "Rejeitada!");
            fetchData();
        } catch (err) { toast.error("Erro ao moderar"); }
    };

    const filteredReviews = reviews.filter(r => {
        if (statusFilter === 'ALL') return true;
        if (statusFilter === 'PENDING') return !r.moderation;
        if (statusFilter === 'APPROVED') return r.moderation?.isApproved === true;
        if (statusFilter === 'REJECTED') return r.moderation?.isApproved === false;
        return true;
    });

    if (loading && filteredReviews.length === 0) return <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}><Loader2 className="animate-spin" style={{ color: "#d4af37" }} /></div>;

    return (
        <div style={{ display: "grid", gap: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 className="section-title" style={{ margin: 0 }}>{t("admin.moderation.moderaoDeAvaliaes", `Moderação de Avaliações`)}</h1>
                    <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>{t("admin.moderation.reviseEModereAvaliaesDos Visitantes", `Revise e modere avaliações dos visitantes`)}</p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setStatusFilter(f)}
                            style={{
                                padding: "0.25rem 0.75rem",
                                borderRadius: "0.5rem",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                transition: "all 0.2s",
                                backgroundColor: statusFilter === f ? "#d4af37" : "rgba(255,255,255,0.05)",
                                color: statusFilter === f ? "black" : "#94a3b8",
                                border: "none",
                                cursor: "pointer"
                            }}
                        >
                            {f === 'ALL' ? 'Tudo' : f === 'PENDING' ? 'Pendentes' : f === 'APPROVED' ? 'Aprovados' : 'Rejeitados'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-4 gap-4">
                    <div className="stat-card">
                        <MessageSquare className="mx-auto text-blue-500 mb-1" size={20} />
                        <p className="text-2xl font-black text-white">{stats.totalReviews}</p>
                        <p className="text-zinc-400 text-[10px] font-bold uppercase">Total</p>
                    </div>
                    <div className="stat-card" style={{ borderColor: stats.pending > 0 ? "rgba(212,175,55,0.4)" : undefined }}>
                        <AlertTriangle className="mx-auto text-amber-500 mb-1" size={20} />
                        <p className="text-2xl font-black text-amber-400">{stats.pending}</p>
                        <p className="text-zinc-400 text-[10px] font-bold uppercase">Pendentes</p>
                    </div>
                    <div className="stat-card">
                        <Check className="mx-auto text-green-500 mb-1" size={20} />
                        <p className="text-2xl font-black text-green-400">{stats.approved}</p>
                        <p className="text-zinc-400 text-[10px] font-bold uppercase">Aprovados</p>
                    </div>
                    <div className="stat-card">
                        <X className="mx-auto text-red-500 mb-1" size={20} />
                        <p className="text-2xl font-black text-red-400">{stats.flagged}</p>
                        <p className="text-zinc-400 text-[10px] font-bold uppercase">Rejeitados</p>
                    </div>
                </div>
            )}

            {/* Reviews */}
            <div style={{ display: "grid", gap: "0.75rem" }}>
                {filteredReviews.length === 0 ? (
                    <div className="card text-center" style={{ padding: "3rem" }}>
                        <Shield style={{ margin: "0 auto 1rem", color: "#64748b", opacity: 0.3 }} size={40} />
                        <p style={{ color: "#94a3b8" }}>Nenhuma avaliação encontrada com este filtro.</p>
                    </div>
                ) : (
                    filteredReviews.map((review: any) => {
                        const mod = review.moderation;
                        const isModerated = mod && mod.isApproved !== null;
                        return (
                            <div key={review.id} className="card" style={{ padding: "1.25rem", borderColor: !isModerated ? 'rgba(212,175,55,0.2)' : mod?.isApproved ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}>
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                                            <span style={{ color: "white", fontWeight: 700, fontSize: "0.9rem" }}>{review.work?.title}</span>
                                            <span className={`text-xs font-bold ${review.rating >= 4 ? 'text-green-400' : review.rating >= 3 ? 'text-amber-400' : 'text-red-400'}`}>★ {review.rating}</span>
                                            {isModerated ? (
                                                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${mod.isApproved ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                    {mod.isApproved ? 'APROVADA' : mod.flagReason || 'REJEITADA'}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md font-bold">AGUARDANDO MODERAÇÃO</span>
                                            )}
                                            
                                            {mod?.aiScore !== undefined && mod.aiScore !== null && (
                                                <div style={{ display: "flex", alignItems: "center", gap: "4px" }} title={mod.aiReason || "Confiança da IA"}>
                                                    <Shield size={12} className={mod.aiScore > 0.8 ? "text-green-500" : mod.aiScore > 0.5 ? "text-amber-500" : "text-red-500"} />
                                                    <span style={{ fontSize: "10px", color: "#94a3b8" }}>{Math.round(mod.aiScore * 100)}% Confiança IA</span>
                                                </div>
                                            )}
                                        </div>
                                        {review.comment && <p className="text-gray-200 text-sm mb-1 leading-relaxed">{review.comment}</p>}
                                        <p className="text-zinc-400 text-[10px] font-medium uppercase tracking-wider">{review.visitor?.name || 'Visitante Anônimo'} • {new Date(review.createdAt).toLocaleDateString("pt-BR")} às {new Date(review.createdAt).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}</p>
                                        
                                        {mod?.aiReason && !isModerated && (
                                            <p style={{ fontSize: "10px", color: "#fbbf24", marginTop: "4px", fontStyle: "italic" }}>
                                                Analise da IA: {mod.aiReason}
                                            </p>
                                        )}
                                    </div>
                                    {!isModerated && (
                                        <div className="flex gap-2 shrink-0 ml-4">
                                            <button 
                                                onClick={() => onModerate(review.id, false, 'SPAM')} 
                                                className="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 transition-all border border-red-500/20"
                                                title="Rejeitar como Spam/Ofensivo"
                                            >
                                                <X size={18} />
                                            </button>
                                            <button 
                                                onClick={() => onModerate(review.id, true)} 
                                                className="p-2.5 bg-green-500/10 hover:bg-green-500/20 rounded-xl text-green-400 transition-all border border-green-500/20"
                                                title="Aprovar Comentário"
                                            >
                                                <Check size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
