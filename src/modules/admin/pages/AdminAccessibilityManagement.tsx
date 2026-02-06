import React, { useEffect, useState } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";

type Execution = {
    id: string;
    serviceType: string;
    status: string;
    requestedAt: string;
    project?: { id: string; title: string };
    provider?: { id: string; name: string };
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
    APPROVED: { label: "Aprovado", color: "#3b82f6" },
    IN_PROGRESS: { label: "Em Andamento", color: "#f59e0b" },
    DELIVERED: { label: "Entregue", color: "#8b5cf6" },
    VALIDATED: { label: "Validado", color: "#10b981" },
    REJECTED: { label: "Rejeitado", color: "#ef4444" }
};

export const AdminAccessibilityManagement: React.FC = () => {
    const { tenantId } = useAuth();
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenantId) return;

        api.get("/accessibility-execution/dashboard", { params: { tenantId } })
            .then(res => setDashboard(res.data))
            .catch(err => {
                console.error("Erro ao carregar dashboard", err);
            })
            .finally(() => setLoading(false));
    }, [tenantId]);

    if (loading) return <p>Carregando...</p>;
    if (!dashboard) return <p>Erro ao carregar dados</p>;

    const totalByStatus = dashboard.byStatus.reduce((acc, s) => acc + s._count, 0);

    return (
        <div>
            <div style={{ marginBottom: "1rem" }}>
                <h1 className="section-title">♿ Gestão de Acessibilidade</h1>
                <p className="section-subtitle">Acompanhe as solicitações e execuções de serviços de acessibilidade</p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                {dashboard.byStatus.map(s => {
                    const info = statusLabels[s.status] || { label: s.status, color: "#6b7280" };
                    return (
                        <div key={s.status} className="card" style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "2rem", fontWeight: "bold", color: info.color }}>{s._count}</div>
                            <div style={{ fontSize: "0.85rem", color: "var(--fg-muted)" }}>{info.label}</div>
                        </div>
                    );
                })}
                <div className="card" style={{ textAlign: "center", background: "var(--accent)" }}>
                    <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#fff" }}>{totalByStatus}</div>
                    <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.8)" }}>Total</div>
                </div>
            </div>

            {/* By Service Type */}
            <div className="card" style={{ marginBottom: "2rem" }}>
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

            {/* Recent Executions */}
            <div className="card">
                <h3 style={{ marginBottom: "1rem" }}>Solicitações Recentes</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Serviço</th>
                            <th>Projeto</th>
                            <th>Prestador</th>
                            <th>Status</th>
                            <th>Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dashboard.recentExecutions.map(exec => {
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
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
