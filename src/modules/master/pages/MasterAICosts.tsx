import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { Loader2, Brain, DollarSign, BarChart3, Cpu, AlertTriangle, Building2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface AIReport {
    period: { month: number; year: number };
    summary: {
        totalCost: number;
        totalAnalyses: number;
        totalTokens: number;
        activeTenants: number;
    };
    topConsumers: Array<{
        tenantId: string;
        tenantName: string;
        tenantSlug: string;
        analysesCount: number;
        tokensUsed: number;
        estimatedCost: number;
    }>;
    nearLimitTenants: Array<{
        tenantId: string;
        tenantName: string;
        current: number;
        limit: number;
        percentUsed: number;
    }>;
}

export const MasterAICosts: React.FC = () => {
  const { t } = useTranslation();
    const [report, setReport] = useState<AIReport | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchReport = useCallback(async () => {
        try {
            const res = await api.get("/ai-costs/report");
            setReport(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar relatório de IA");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}><Loader2 className="animate-spin" style={{ color: "#d4af37" }} /></div>;
    if (!report) return <div className="text-center text-gray-500 py-20">{t("master.aicosts.nenhumDadoDisponvel", `Nenhum dado disponível.`)}</div>;

    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const periodLabel = `${monthNames[report.period.month - 1]} ${report.period.year}`;

    const summaryCards = [
        { label: "Custo Total", value: `R$ ${report.summary.totalCost.toFixed(2).replace('.', ',')}`, icon: <DollarSign size={20} />, color: "text-green-500 bg-green-500/10" },
        { label: "Total Análises", value: report.summary.totalAnalyses.toLocaleString("pt-BR"), icon: <BarChart3 size={20} />, color: "text-blue-500 bg-blue-500/10" },
        { label: "Total Tokens", value: report.summary.totalTokens.toLocaleString("pt-BR"), icon: <Cpu size={20} />, color: "text-purple-500 bg-purple-500/10" },
        { label: "Tenants Ativos", value: report.summary.activeTenants, icon: <Building2 size={20} />, color: "text-amber-500 bg-amber-500/10" }
    ];

    return (
        <div style={{ display: "grid", gap: "2rem" }}>
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                    <Brain className="text-purple-500" /> Custos de IA
                </h1>
                <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>Relatório global de uso e custos — {periodLabel}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryCards.map((s, i) => (
                    <div key={i} className="card">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${s.color}`}>{s.icon}</div>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{s.label}</p>
                        <p className="text-2xl font-black text-white">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Top Consumers */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart3 size={20} style={{ color: "#60a5fa" }} /> Top Consumidores
                </h2>
                <div className="card" style={{ overflow: "hidden", padding: 0 }}>
                    <table className="w-full text-left">
                        <thead className="bg-black/40 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">#</th>
                                <th className="px-6 py-4">Tenant</th>
                                <th className="px-6 py-4">{t("master.aicosts.anlises", `Análises`)}</th>
                                <th className="px-6 py-4">Tokens</th>
                                <th className="px-6 py-4">Custo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {report.topConsumers.map((c, idx) => (
                                <tr key={c.tenantId} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-gray-600 text-xs">{idx + 1}</td>
                                    <td className="px-6 py-4">
                                        <span style={{ color: "white", fontWeight: 700, fontSize: "0.9rem" }}>{c.tenantName}</span>
                                        <p className="text-gray-600 text-xs">{c.tenantSlug}</p>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">{c.analysesCount.toLocaleString("pt-BR")}</td>
                                    <td className="px-6 py-4 text-gray-400 text-sm">{c.tokensUsed.toLocaleString("pt-BR")}</td>
                                    <td className="px-6 py-4 text-green-400 font-bold">R$ {c.estimatedCost.toFixed(2).replace('.', ',')}</td>
                                </tr>
                            ))}
                            {report.topConsumers.length === 0 && (
                                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500 italic">{t("master.aicosts.nenhumConsumoRegistradoNestePerodo", `Nenhum consumo registrado neste período.`)}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Near Limit Tenants */}
            {report.nearLimitTenants.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <AlertTriangle size={20} className="text-amber-500" /> Tenants Próximos do Limite (80%+)
                    </h2>
                    <div style={{ display: "grid", gap: "0.75rem" }}>
                        {report.nearLimitTenants.map(t => (
                            <div key={t.tenantId} className="card" style={{ padding: "1.25rem", borderColor: "rgba(212,175,55,0.2)" }}>
                                <div className="flex justify-between items-center mb-3">
                                    <span style={{ color: "white", fontWeight: 700 }}>{t.tenantName}</span>
                                    <span className={`text-sm font-black ${t.percentUsed >= 95 ? 'text-red-400' : 'text-amber-400'}`}>
                                        {t.percentUsed}%
                                    </span>
                                </div>
                                <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${t.percentUsed >= 95 ? 'bg-red-500' : 'bg-amber-500'}`}
                                        style={{ width: `${Math.min(t.percentUsed, 100)}%` }}
                                    />
                                </div>
                                <p className="text-gray-500 text-xs mt-2">{t.current} / {t.limit} análises</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
