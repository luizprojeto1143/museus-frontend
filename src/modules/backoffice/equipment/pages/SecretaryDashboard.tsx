import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { api } from "../../../../api/client";
import { useAuth } from "../../../auth/AuthContext";
import { Button, AnimateIn, Badge, Card as UICard } from "../../../../components/ui";
import { FileText, Rocket, LayoutDashboard, Calendar, Accessibility, Folder } from "lucide-react";
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
    const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await api.get("/secretary/dashboard", { params: { tenantId } });
            setData(response.data);
        } catch (err) {
            console.error("Erro ao carregar dashboard", err);
        } finally {
            setLoading(false);
        }
    };

    const downloadPdf = async () => {
        try {
            window.open(`${api.defaults.baseURL}/executive-reports/pdf?tenantId=${tenantId}`, '_blank');
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
            <div className="sec-header flex justify-between items-center mb-8 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-xl">
                <div className="sec-title">
                    <div className="flex items-center gap-3 mb-2">
                        <LayoutDashboard className="text-gold-400" size={24} />
                        <h1 className="text-2xl font-black uppercase tracking-tighter text-white m-0">Painel de Controle</h1>
                    </div>
                    <p className="text-gray-400 text-sm">{t("admin.secretarydashboard.visoExecutivaDaGestoCulturalMunicipal", `Gestão estratégica de conteúdo, engajamento e logística institucional.`)}</p>
                </div>
                <Button onClick={downloadPdf} variant="primary" leftIcon={<FileText size={18} />}>
                    Exportar Relatório PDF
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="sec-grid-cards">
                <Card
                    title="Equipamentos"
                    value={data.cards.totalEquipments}
                    icon="🏛️"
                    color="var(--accent-primary)"
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

            {/* ROADMAP 2026 ANNOUNCEMENT */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600/20 to-purple-600/10 border border-blue-500/30 rounded-3xl p-8 mb-8 flex items-center gap-8 group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Rocket size={120} className="text-white" />
                </div>
                <div className="text-5xl animate-bounce">🚀</div>
                <div className="flex-1 relative z-10">
                    <Badge variant="info" className="mb-4 bg-blue-500 border-none text-white font-black italic">
                        ROADMAP MARÇO 2026
                    </Badge>
                    <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Inovação e Expansão Cultura Viva</h2>
                    <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
                        Novas ferramentas de engajamento (Comunidade e Quizzes) e infraestrutura (Timelines Arquitetônicas) agora integradas ao portal.
                    </p>
                </div>
                <Button variant="outline" className="relative z-10 border-white/20 text-white hover:bg-white/10 uppercase font-black tracking-tighter">
                    Ver Detalhes
                </Button>
            </div>

            {/* Alerts */}
            {data.alerts.length > 0 && (
                <div className="sec-alerts">
                    <h2 className="sec-section-title">{t("admin.secretarydashboard.AlertasDeAteno", `⚠️ Alertas de Atenção`)}</h2>
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '2rem' }}>
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
