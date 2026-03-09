import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
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

    const fetchData = useCallback(async () => {
        try {
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
        } catch (err) { toast.error("Erro"); }
    };

    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}><Loader2 className="animate-spin" style={{ color: "#d4af37" }} /></div>;

    return (
        <div style={{ display: "grid", gap: "2rem" }}>
            <div>
                <h1 className="section-title" style={{ margin: 0 }}>{t("admin.moderation.moderaoDeAvaliaes", `Moderação de Avaliações`)}</h1>
                <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>{t("admin.moderation.reviseEModereAvaliaesDosVisitantes", `Revise e modere avaliações dos visitantes`)}</p>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-4 gap-4">
                    <div className="stat-card">
                        <MessageSquare className="mx-auto text-blue-500 mb-1" size={20} />
                        <p className="text-2xl font-black text-white">{stats.totalReviews}</p>
                        <p className="text-zinc-400 text-[10px] font-bold uppercase">Total</p>
                    </div>
                    <div className="stat-card" style={{ borderColor: "rgba(212,175,55,0.2)" }}>
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
                {reviews.map((review: any) => {
                    const mod = review.moderation;
                    const isModerated = mod !== null;
                    return (
                        <div key={review.id} className="card" style={{ padding: "1.25rem", borderColor: !isModerated ? 'border-amber-500/20' : mod?.isApproved ? 'border-green-500/10' : 'border-red-500/10' }}>
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                                        <span style={{ color: "white", fontWeight: 700, fontSize: "0.9rem" }}>{review.work?.title}</span>
                                        <span className={`text-xs font-bold ${review.rating >= 4 ? 'text-green-400' : review.rating >= 3 ? 'text-amber-400' : 'text-red-400'}`}>★ {review.rating}</span>
                                        {isModerated && (
                                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${mod.isApproved ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                {mod.isApproved ? 'APROVADA' : mod.flagReason || 'REJEITADA'}
                                            </span>
                                        )}
                                        {!isModerated && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md font-bold">PENDENTE</span>}
                                    </div>
                                    {review.comment && <p className="text-gray-300 text-sm mb-1">{review.comment}</p>}
                                    <p className="text-zinc-300 text-xs">{review.visitor?.name || 'Anônimo'} • {new Date(review.createdAt).toLocaleDateString("pt-BR")}</p>
                                </div>
                                {!isModerated && (
                                    <div className="flex gap-1 shrink-0 ml-4">
                                        <button onClick={() => onModerate(review.id, true)} className="p-2 bg-green-500/10 hover:bg-green-500/20 rounded-lg text-green-400 transition-colors"><Check size={16} /></button>
                                        <button onClick={() => onModerate(review.id, false, 'SPAM')} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"><X size={16} /></button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
