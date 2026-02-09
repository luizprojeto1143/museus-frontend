import React, { useEffect, useState } from "react";
import { api } from "../../../api/client";
import "./SecretaryDashboard.css"; // Import the new styles

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
            <div className="secretary-dashboard" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="secretary-dashboard" style={{ textAlign: "center", color: "#ef4444" }}>
                Erro ao carregar dados do dashboard
            </div>
        );
    }

    return (
        <div className="secretary-dashboard">
            {/* Header */}
            <div className="sec-header">
                <div className="sec-title">
                    <h1>Painel da Secretaria</h1>
                    <p>Visão executiva da gestão cultural municipal</p>
                </div>
                <button onClick={downloadPdf} className="sec-btn-export">
                    <span>📄</span> Exportar Relatório PDF
                </button>
            </div>

            {/* KPI Cards */}
            <div className="sec-grid-cards">
                <Card
                    title="Equipamentos"
                    value={data.cards.totalEquipments}
                    icon="🏛️"
                    color="#3b82f6"
                />
                <Card
                    title="Projetos Ativos"
                    value={data.cards.activeProjects}
                    icon="📁"
                    color="#10b981"
                />
                <Card
                    title="Acessibilidade"
                    value={data.cards.pendingAccessibility}
                    icon="♿"
                    color="#f59e0b"
                />
                <Card
                    title="Eventos"
                    value={data.cards.totalEvents}
                    icon="📅"
                    color="#8b5cf6"
                />
            </div>

            {/* Alerts */}
            {data.alerts.length > 0 && (
                <div className="sec-alerts">
                    <h2 className="sec-section-title">⚠️ Alertas de Atenção</h2>
                    <div className="sec-alert-list">
                        {data.alerts.map((alert, idx) => (
                            <div
                                key={idx}
                                className={`sec-alert-item ${alert.severity === "WARNING" ? "sec-alert-warning" : "sec-alert-info"
                                    }`}
                            >
                                <span>{alert.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                {/* Equipment Accessibility Status */}
                <div>
                    <h2 className="sec-section-title">Status de Equipamentos</h2>
                    <div className="sec-table-container">
                        <table className="sec-table">
                            <thead>
                                <tr>
                                    <th>Equipamento</th>
                                    <th style={{ textAlign: 'center' }}>Tipo</th>
                                    <th style={{ textAlign: 'center' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.equipmentAccessibility.map((eq) => (
                                    <tr key={eq.id}>
                                        <td style={{ fontWeight: 500 }}>{eq.name}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--sec-text-muted)' }}>{eq.type}</span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {eq.pendingRequests > 0 ? (
                                                <span className="sec-badge sec-badge-warning">
                                                    {eq.pendingRequests} pendente(s)
                                                </span>
                                            ) : eq.hasAccessibility ? (
                                                <span className="sec-badge sec-badge-success">OK</span>
                                            ) : (
                                                <span className="sec-badge sec-badge-danger">Sem cadastro</span>
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
                    <h2 className="sec-section-title">Projetos Recentes</h2>
                    <div className="sec-project-list">
                        {data.recentProjects.map((proj) => (
                            <div key={proj.id} className="sec-project-item">
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--sec-primary)' }}>{proj.title}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--sec-text-muted)', marginTop: '0.25rem' }}>
                                        {new Date(proj.createdAt).toLocaleDateString("pt-BR")}
                                    </div>
                                </div>
                                <span className={`sec-badge ${proj.status === 'APPROVED' ? 'sec-badge-success' :
                                        proj.status === 'REJECTED' ? 'sec-badge-danger' : 'sec-badge-warning'
                                    }`}>
                                    {statusLabels[proj.status] || proj.status}
                                </span>
                            </div>
                        ))}
                        {data.recentProjects.length === 0 && (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--sec-text-muted)', background: 'white', borderRadius: '8px', border: '1px dashed var(--sec-border)' }}>
                                Nenhum projeto recente.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Card: React.FC<{ title: string; value: number; icon: string; color: string }> = ({ title, value, icon, color }) => (
    <div className="sec-card" style={{ '--card-color': color } as React.CSSProperties}>
        <div className="sec-card-icon">{icon}</div>
        <div className="sec-card-value" style={{ color: color }}>{value}</div>
        <div className="sec-card-label">{title}</div>
    </div>
);

export default SecretaryDashboard;
