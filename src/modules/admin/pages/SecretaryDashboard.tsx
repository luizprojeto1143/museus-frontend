import React, { useEffect, useState } from "react";
import { api } from "../../../api/client";

type DashboardData = {
    cards: {
        totalEquipments: number;
        totalProjects: number;
        activeProjects: number;
        pendingAccessibility: number;
        totalEvents: number;
        upcomingEvents: number;
    };
    equipmentAccessibility: {
        id: string;
        name: string;
        type: string;
        hasAccessibility: boolean;
        pendingRequests: number;
    }[];
    recentProjects: {
        id: string;
        title: string;
        status: string;
        createdAt: string;
    }[];
    alerts: {
        type: string;
        message: string;
        severity: string;
    }[];
};

const statusLabels: Record<string, string> = {
    DRAFT: "Rascunho",
    SUBMITTED: "Submetido",
    UNDER_REVIEW: "Em Análise",
    APPROVED: "Aprovado",
    REJECTED: "Rejeitado",
    IN_EXECUTION: "Em Execução",
    COMPLETED: "Concluído"
};

const SecretaryDashboard: React.FC = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await api.get("/secretary/dashboard");
            setData(response.data);
        } catch (err) {
            console.error("Erro ao carregar dashboard", err);
        } finally {
            setLoading(false);
        }
    };

    const downloadPdf = async () => {
        try {
            const response = await api.get("/executive-reports/pdf", {
                responseType: "blob"
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "relatorio-executivo.pdf");
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Erro ao baixar PDF", err);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: 32, display: "flex", justifyContent: "center" }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div style={{ padding: 32, textAlign: "center", color: "#ef4444" }}>
                Erro ao carregar dados do dashboard
            </div>
        );
    }

    return (
        <div style={{ padding: 24 }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 4 }}>
                        Painel da Secretaria
                    </h1>
                    <p style={{ color: "#6b7280", fontSize: 14 }}>
                        Visão executiva da gestão cultural municipal
                    </p>
                </div>
                <button
                    onClick={downloadPdf}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#7c3aed",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 8
                    }}
                >
                    📄 Exportar Relatório PDF
                </button>
            </div>

            {/* Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
                <Card title="Equipamentos" value={data.cards.totalEquipments} icon="🏛️" color="#3b82f6" />
                <Card title="Projetos Ativos" value={data.cards.activeProjects} icon="📁" color="#10b981" />
                <Card title="Acessibilidade Pendente" value={data.cards.pendingAccessibility} icon="♿" color="#f59e0b" />
                <Card title="Eventos" value={data.cards.totalEvents} icon="📅" color="#8b5cf6" />
            </div>

            {/* Alerts */}
            {data.alerts.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>⚠️ Alertas</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {data.alerts.map((alert, idx) => (
                            <div
                                key={idx}
                                style={{
                                    padding: 16,
                                    borderRadius: 8,
                                    backgroundColor: alert.severity === "WARNING" ? "#fef3c7" : "#dbeafe",
                                    borderLeft: `4px solid ${alert.severity === "WARNING" ? "#f59e0b" : "#3b82f6"}`
                                }}
                            >
                                <span style={{ fontWeight: 500 }}>{alert.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Equipment Accessibility Status */}
            <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Status de Acessibilidade por Equipamento</h2>
                <div style={{ backgroundColor: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f9fafb" }}>
                                <th style={{ padding: 12, textAlign: "left", fontWeight: 600 }}>Equipamento</th>
                                <th style={{ padding: 12, textAlign: "center", fontWeight: 600 }}>Tipo</th>
                                <th style={{ padding: 12, textAlign: "center", fontWeight: 600 }}>Acessibilidade</th>
                                <th style={{ padding: 12, textAlign: "center", fontWeight: 600 }}>Pendências</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.equipmentAccessibility.map((eq) => (
                                <tr key={eq.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                                    <td style={{ padding: 12 }}>{eq.name}</td>
                                    <td style={{ padding: 12, textAlign: "center" }}>{eq.type}</td>
                                    <td style={{ padding: 12, textAlign: "center" }}>
                                        {eq.hasAccessibility ? (
                                            <span style={{ color: "#10b981", fontWeight: 600 }}>✓ Cadastrado</span>
                                        ) : (
                                            <span style={{ color: "#ef4444", fontWeight: 600 }}>✗ Não cadastrado</span>
                                        )}
                                    </td>
                                    <td style={{ padding: 12, textAlign: "center" }}>
                                        {eq.pendingRequests > 0 ? (
                                            <span style={{ backgroundColor: "#fef3c7", color: "#92400e", padding: "4px 12px", borderRadius: 999, fontSize: 13 }}>
                                                {eq.pendingRequests} pendente(s)
                                            </span>
                                        ) : (
                                            <span style={{ color: "#9ca3af" }}>—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Projects */}
            <div>
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Projetos Recentes</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {data.recentProjects.map((proj) => (
                        <div
                            key={proj.id}
                            style={{
                                padding: 16,
                                backgroundColor: "white",
                                borderRadius: 8,
                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 600 }}>{proj.title}</div>
                                <div style={{ fontSize: 13, color: "#6b7280" }}>
                                    {new Date(proj.createdAt).toLocaleDateString("pt-BR")}
                                </div>
                            </div>
                            <span style={{
                                padding: "4px 12px",
                                borderRadius: 999,
                                fontSize: 13,
                                fontWeight: 500,
                                backgroundColor: "#dbeafe",
                                color: "#1e40af"
                            }}>
                                {statusLabels[proj.status] || proj.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Card: React.FC<{ title: string; value: number; icon: string; color: string }> = ({ title, value, icon, color }) => (
    <div style={{
        backgroundColor: "white",
        borderRadius: 12,
        padding: 20,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        borderTop: `4px solid ${color}`
    }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 32 }}>{icon}</span>
            <div>
                <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>{title}</div>
            </div>
        </div>
    </div>
);

export default SecretaryDashboard;
