import { useTranslation } from "react-i18next";
﻿import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, Mail, Users, Download, Calendar } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { toast } from "react-hot-toast";
import "./AdminShared.css";


interface Subscriber {
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
}

export const AdminNewsletter: React.FC = () => {
  const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSubscribers = useCallback(async () => {
        try {
            const res = await api.get(`/newsletter/list?tenantId=${tenantId}`);
            setSubscribers(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar inscritos");
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        if (tenantId) fetchSubscribers();
    }, [tenantId, fetchSubscribers]);

    const exportCSV = () => {
        const header = "Email,Nome,Data de Inscrição\n";
        const rows = subscribers.map(s =>
            `${s.email},${s.name || ""},${new Date(s.createdAt).toLocaleDateString("pt-BR")}`
        ).join("\n");
        const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `newsletter-inscritos-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("CSV exportado!");
    };

    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}><Loader2 className="animate-spin" style={{ color: "#d4af37" }} /></div>;

    return (
        <div style={{ display: "grid", gap: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 className="section-title" style={{ margin: 0 }}>Newsletter</h1>
                    <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>Gerenciamento de inscritos na newsletter</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ background: "rgba(26,28,34,0.9)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "0.75rem", padding: "0.5rem 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Users size={16} className="text-amber-500" />
                        <span style={{ color: "white", fontWeight: 700 }}>{subscribers.length}</span>
                        <span className="text-zinc-400 text-sm">inscritos</span>
                    </div>
                    <Button
                        onClick={exportCSV}
                        leftIcon={<Download size={16} />}
                        className="bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl"
                        disabled={subscribers.length === 0}
                    >
                        Exportar CSV
                    </Button>
                </div>
            </div>

            {subscribers.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "5rem 2rem", border: "2px dashed rgba(212,175,55,0.15)" }}>
                    <Mail size={48} style={{ margin: "0 auto 1rem", color: "#64748b", opacity: 0.3 }} />
                    <h3 className="text-lg font-bold text-white mb-1">Nenhum inscrito</h3>
                    <p style={{ color: "#64748b" }}>{t("admin.newsletter.osInscritosNaNewsletterAparece", "Os inscritos na newsletter aparecerão aqui.")}</p>
                </div>
            ) : (
                <div className="card" style={{ overflow: "hidden", padding: 0 }}>
                    <table className="w-full text-left">
                        <thead className="bg-black/40 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">#</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Nome</th>
                                <th className="px-6 py-4">{t("admin.newsletter.dataDeInscrio", "Data de Inscrição")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {subscribers.map((s, idx) => (
                                <tr key={s.id} className="hover:bg-zinc-900/40 border border-gold/20/5 transition-colors">
                                    <td className="px-6 py-4 text-zinc-300 text-xs">{idx + 1}</td>
                                    <td className="px-6 py-4">
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <Mail size={14} className="text-amber-500" />
                                            <span style={{ color: "white", fontWeight: 700, fontSize: "0.9rem" }}>{s.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-sm">{s.name || "—"}</td>
                                    <td className="px-6 py-4 text-zinc-400 text-xs flex items-center gap-1">
                                        <Calendar size={12} /> {new Date(s.createdAt).toLocaleDateString("pt-BR")}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
