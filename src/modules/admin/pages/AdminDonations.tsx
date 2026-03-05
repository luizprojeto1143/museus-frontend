import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, Heart, DollarSign, Users, Clock, Gift } from "lucide-react";
import { toast } from "react-hot-toast";
import "./AdminShared.css";


interface DonationStats {
    totalRaised: number;
    totalDonations: number;
    completedCount: number;
    pendingCount: number;
}

interface Donation {
    id: string;
    donorName: string | null;
    message: string | null;
    amount: number | null;
    anonymous: boolean;
    createdAt: string;
}

export const AdminDonations: React.FC = () => {
    const { tenantId } = useAuth();
    const [stats, setStats] = useState<DonationStats | null>(null);
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [statsRes, wallRes] = await Promise.all([
                api.get(`/donations/stats?tenantId=${tenantId}`),
                api.get(`/donations/wall?tenantId=${tenantId}`)
            ]);
            setStats(statsRes.data);
            setDonations(wallRes.data.donations || []);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar doações");
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        if (tenantId) fetchData();
    }, [tenantId, fetchData]);

    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}><Loader2 className="animate-spin" style={{ color: "#d4af37" }} /></div>;

    const statCards = [
        { label: "Total Arrecadado", value: `R$ ${Number(stats?.totalRaised || 0).toFixed(2).replace('.', ',')}`, icon: <DollarSign size={20} />, color: "text-green-500 bg-green-50" },
        { label: "Total Doações", value: stats?.totalDonations || 0, icon: <Heart size={20} />, color: "text-rose-500 bg-rose-50" },
        { label: "Confirmadas", value: stats?.completedCount || 0, icon: <Gift size={20} />, color: "text-emerald-500 bg-emerald-50" },
        { label: "Pendentes", value: stats?.pendingCount || 0, icon: <Clock size={20} />, color: "text-amber-500 bg-amber-50" }
    ];

    return (
        <div style={{ display: "grid", gap: "2rem" }}>
            <div>
                <h1 className="section-title" style={{ margin: 0 }}>Doações</h1>
                <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>Painel de arrecadação e mural de doadores</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((s, i) => (
                    <div key={i} className="card">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${s.color}`}>{s.icon}</div>
                        <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">{s.label}</p>
                        <p className="text-2xl font-black text-white">{s.value}</p>
                    </div>
                ))}
            </div>

            <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Heart size={20} className="text-rose-500" /> Mural de Doadores
                </h2>
                {donations.length === 0 ? (
                    <div className="card" style={{ textAlign: "center", padding: "5rem 2rem", border: "2px dashed rgba(212,175,55,0.15)" }}>
                        <Heart size={48} style={{ margin: "0 auto 1rem", color: "#64748b", opacity: 0.3 }} />
                        <p style={{ color: "#64748b" }}>Nenhuma doação registrada ainda.</p>
                    </div>
                ) : (
                    <div className="card" style={{ overflow: "hidden", padding: 0 }}>
                        <table className="w-full text-left">
                            <thead className="bg-black/40 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Doador</th>
                                    <th className="px-6 py-4">Mensagem</th>
                                    <th className="px-6 py-4">Valor</th>
                                    <th className="px-6 py-4">Data</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {donations.map(d => (
                                    <tr key={d.id} className="hover:bg-zinc-900/40 border border-gold/20/5 transition-colors">
                                        <td className="px-6 py-4 text-white font-bold text-sm">{d.donorName || "Anônimo"}</td>
                                        <td className="px-6 py-4 text-gray-400 text-sm italic max-w-[300px] truncate">{d.message || "—"}</td>
                                        <td className="px-6 py-4 text-green-400 font-bold">{d.amount ? `R$ ${Number(d.amount).toFixed(2).replace('.', ',')}` : "—"}</td>
                                        <td className="px-6 py-4 text-zinc-400 text-xs">{new Date(d.createdAt).toLocaleDateString("pt-BR")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
