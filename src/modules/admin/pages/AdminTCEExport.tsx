import { useTranslation } from "react-i18next";
﻿import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, FileText, Download, Calendar } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { toast } from "react-hot-toast";
import "./AdminShared.css";


export const AdminTCEExport: React.FC = () => {
  const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());
    const [quarter, setQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/analytics/summary?tenantId=${tenantId}`);
            setStats(res.data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    }, [tenantId]);

    useEffect(() => { if (tenantId) fetchData(); }, [tenantId, fetchData]);

    const onExport = () => {
        if (!stats) return;
        const data = {
            equipamento: stats.tenantName || 'Equipamento Cultural',
            periodo: `${year} Q${quarter}`,
            visitantes: stats.totalVisitors || 0,
            eventos: stats.totalEvents || 0,
            oficinas: 0,
            projetos: 0,
            receita: stats.totalRevenue || 0,
            despesas: 0,
            acervo: stats.totalWorks || 0,
            observacoes: ''
        };
        const csv = Object.entries(data).map(([k, v]) => `${k};${v}`).join('\n');
        const blob = new Blob([`Relatório TCE-MG\n${csv}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tce_${year}_Q${quarter}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Relatório exportado!");
    };

    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}><Loader2 className="animate-spin" style={{ color: "#d4af37" }} /></div>;

    return (
        <div style={{ display: "grid", gap: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 className="section-title" style={{ margin: 0 }}>{t("admin.tceexport.exportaoTcemg", "Exportação TCE-MG")}</h1>
                    <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>{t("admin.tceexport.relatrioFormatadoParaOTribunal", "Relatório formatado para o Tribunal de Contas")}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.5rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }}>
                        {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select value={quarter} onChange={e => setQuarter(Number(e.target.value))} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.5rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }}>
                        {[1, 2, 3, 4].map(q => <option key={q} value={q}>Q{q}</option>)}
                    </select>
                    <Button onClick={onExport} leftIcon={<Download size={16} />}>Exportar CSV</Button>
                </div>
            </div>

            {/* Preview */}
            <div className="card" style={{ overflow: "hidden", padding: 0 }}>
                <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
                    <FileText size={18} className="text-amber-500" />
                    <h2 className="card-title" style={{ margin: 0 }}>Prévia do Relatório — {year} Q{quarter}</h2>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-black/40 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        <tr><th className="px-6 py-3">Campo</th><th className="px-6 py-3 text-right">Valor</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {[
                            { label: 'Visitantes no Período', value: stats?.totalVisitors?.toLocaleString("pt-BR") || '0' },
                            { label: 'Eventos Realizados', value: stats?.totalEvents || '0' },
                            { label: 'Total de Obras no Acervo', value: stats?.totalWorks || '0' },
                            { label: 'Avaliações Recebidas', value: stats?.totalReviews || '0' },
                            { label: 'Nota Média do Público', value: stats?.avgRating ? `${stats.avgRating.toFixed(1)}/5` : 'N/A' },
                            { label: 'Receita Registrada', value: stats?.totalRevenue ? `R$ ${stats.totalRevenue.toLocaleString("pt-BR")}` : 'R$ 0,00' }
                        ].map((row, i) => (
                            <tr key={i} className="hover:bg-zinc-900/40 border border-gold/20/5">
                                <td className="px-6 py-3 text-gray-300 text-sm">{row.label}</td>
                                <td className="px-6 py-3 text-right text-white font-bold text-sm">{row.value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
                <p className="text-amber-400 text-sm font-bold mb-1">⚠️ Nota</p>
                <p style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{t("admin.tceexport.esteUmRelatrioSimplificadoPara", "Este é um relatório simplificado. Para atender ao formato exato do TCE-MG, ajuste os campos conforme o modelo oficial do seu município.")}</p>
            </div>
        </div>
    );
};
