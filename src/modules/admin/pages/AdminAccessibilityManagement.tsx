import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { DollarSign, ShieldCheck, CheckCircle, CreditCard, ExternalLink } from "lucide-react";
import "./AdminShared.css";


type Execution = {
    id: string;
    serviceType: string;
    status: string;
    requestedAt: string;
    project?: { id: string; title: string };
    provider?: { id: string; name: string };
    approvedBudget?: number;
};

type DashboardData = {
    byStatus: { status: string; _count: number }[];
    byService: { serviceType: string; _count: number }[];
    recentExecutions: Execution[];
};

const serviceLabels: Record<string, string> = {
    LIBRAS_INTERPRETATION: "Libras",
    AUDIO_DESCRIPTION: "Audiodescrição",
    CAPTIONING: "Legendagem",
    BRAILLE: "Braille",
    TACTILE_MODEL: "Modelo Tátil",
    EASY_READING: "Leitura Fácil"
};

const statusLabels: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Pendente", color: "#6b7280" },
    APPROVED: { label: "Aprovado", color: "var(--accent-primary)" },
    IN_PROGRESS: { label: "Em Andamento", color: "#f59e0b" },
    DELIVERED: { label: "Entregue", color: "#8b5cf6" },
    VALIDATED: { label: "Validado", color: "#10b981" },
    REJECTED: { label: "Rejeitado", color: "#ef4444" }
};

export const AdminAccessibilityManagement: React.FC = () => {
    const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [workRequests, setWorkRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"EXECUTIONS" | "REQUESTS">("EXECUTIONS");

    useEffect(() => {
        if (!tenantId) return;

        const fetchData = async () => {
            try {
                const [dashRes, reqRes] = await Promise.all([
                    api.get("/accessibility-execution/dashboard", { params: { tenantId } }),
                    api.get("/accessibility")
                ]);
                setDashboard(dashRes.data);
                setWorkRequests(reqRes.data);
            } catch (err) {
                console.error("Erro ao carregar dados", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tenantId]);

    if (loading) return <div className="text-center p-8 text-zinc-500">Carregando...</div>;
    if (!dashboard) return <div className="text-center p-8 text-rose-400">Erro ao carregar dados</div>;

    const totalByStatus = dashboard.byStatus.reduce((acc, s) => acc + s._count, 0);

    return (
        <div>
            <div style={{ marginBottom: "2rem" }}>
                <h1 className="section-title">♿ Gestão de Acessibilidade</h1>
            </div>

            <div className="flex gap-4 border-b border-white/10 mb-6">
                <button
                    onClick={() => setActiveTab("EXECUTIONS")}
                    className={`pb-3 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === "EXECUTIONS"
                        ? "border-blue-500 text-blue-400"
                        : "border-transparent text-zinc-500 hover:text-white"
                        }`}
                >
                    Serviços & Projetos
                </button>
                <button
                    onClick={() => setActiveTab("REQUESTS")}
                    className={`pb-3 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === "REQUESTS"
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-zinc-500 hover:text-white"
                        }`}
                >
                    Fábrica de Conteúdo
                </button>
            </div>

            {activeTab === "EXECUTIONS" && (
                <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                        {dashboard.byStatus.map(s => {
                            const info = statusLabels[s.status] || { label: s.status, color: "#6b7280" };
                            return (
                                <div key={s.status} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 transition-colors" style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: "2rem", fontWeight: "bold", color: info.color }}>{s._count}</div>
                                    <div style={{ fontSize: "0.85rem", color: "var(--fg-muted)" }}>{info.label}</div>
                                </div>
                            );
                        })}
                        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 transition-colors" style={{ textAlign: "center", background: "var(--accent)" }}>
                            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#fff" }}>{totalByStatus}</div>
                            <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.8)" }}>Total</div>
                        </div>
                    </div>

                    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 transition-colors" style={{ marginBottom: "2rem" }}>
                        <h3 style={{ marginBottom: "1rem" }}>Por Tipo de Serviço</h3>
                        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                            {dashboard.byService.map(s => (
                                <div key={s.serviceType} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <span className="chip">{serviceLabels[s.serviceType] || s.serviceType}</span>
                                    <span style={{ fontWeight: "bold" }}>{s._count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 transition-colors">
                        <div className="flex justify-between items-center mb-4">
                            <h3>Solicitações Recentes (Serviços)</h3>
                            <button
                                onClick={() => window.location.href = '/admin/acessibilidade/novo'}
                                className="text-xs bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)] text-white px-3 py-1 rounded-lg transition-colors"
                            >
                                + Nova Solicitação
                            </button>
                        </div>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Serviço</th>
                                    <th>Projeto</th>
                                    <th>Prestador</th>
                                    <th>Status</th>
                                    <th>Data</th>
                                    <th style={{ textAlign: "right" }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboard.recentExecutions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-4 text-zinc-400">Nenhuma execução encontrada.</td>
                                    </tr>
                                ) : dashboard.recentExecutions.map(exec => {
                                    const info = statusLabels[exec.status] || { label: exec.status, color: "#6b7280" };
                                    return (
                                        <tr key={exec.id}>
                                            <td>{serviceLabels[exec.serviceType] || exec.serviceType}</td>
                                            <td>{exec.project?.title || "-"}</td>
                                            <td>{exec.provider?.name || "Não atribuído"}</td>
                                            <td>
                                                <span className="chip" style={{ backgroundColor: info.color, color: "#fff" }}>
                                                    {info.label}
                                                </span>
                                            </td>
                                            <td>{new Date(exec.requestedAt).toLocaleDateString("pt-BR")}</td>
                                            <td style={{ textAlign: "right" }}>
                                                <div className="flex flex-col items-end gap-1">
                                                    {exec.status === "VALIDATED" && (
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    const res = await api.post(`/accessibility-execution/${exec.id}/pay`);
                                                                    window.location.href = res.data.checkoutUrl;
                                                                } catch (err: any) {
                                                                    console.error("Erro ao pagar", err);
                                                                    alert(err.response?.data?.message || "Erro ao processar pagamento.");
                                                                }
                                                            }}
                                                            className="text-[10px] uppercase font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded transition-colors flex items-center gap-2"
                                                        >
                                                            <DollarSign size={12} /> Pagar Agora
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => window.location.href = `/admin/acessibilidade/${exec.id}`}
                                                        className="text-[10px] uppercase font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded transition-colors"
                                                    >
                                                        Detalhes
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {activeTab === "REQUESTS" && (
                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 transition-colors">
                    <h3 className="mb-4 text-purple-400">Solicitações de Conteúdo (Master)</h3>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Obra</th>
                                <th>Tipo</th>
                                <th>Status</th>
                                <th>Solicitado em</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-zinc-400">Nenhuma solicitação encontrada.</td>
                                </tr>
                            ) : workRequests.map((req: any) => (
                                <tr key={req.id}>
                                    <td className="font-bold text-white">{req.work?.title || "Obra removida"}</td>
                                    <td>{req.type}</td>
                                    <td>
                                        <span className={`chip ${req.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td>{new Date(req.createdAt).toLocaleDateString("pt-BR")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
