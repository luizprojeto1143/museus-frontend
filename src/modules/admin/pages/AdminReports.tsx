import React, { useEffect, useState } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { FileText, Download, Calendar, Users, DollarSign, BarChart2 } from "lucide-react";

interface ReportData {
    notices: {
        total: number;
        byStatus: Record<string, number>;
        totalBudget: number;
    };
    projects: {
        total: number;
        byStatus: Record<string, number>;
        totalRequested: number;
        totalApproved: number;
        totalAudience: number;
    };
    accessibility: {
        total: number;
        byService: Record<string, number>;
        byStatus: Record<string, number>;
    };
    providers: {
        total: number;
        active: number;
        totalJobs: number;
    };
}

export const AdminReports: React.FC = () => {
    const { tenantId } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ReportData | null>(null);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0],
        end: new Date().toISOString().split("T")[0]
    });

    useEffect(() => {
        if (!tenantId) return;

        setLoading(true);

        // Fetch all data in parallel
        Promise.all([
            api.get("/notices", { params: { tenantId } }).catch(() => ({ data: [] })),
            api.get("/projects", { params: { tenantId } }).catch(() => ({ data: [] })),
            api.get("/accessibility-execution/dashboard", { params: { tenantId } }).catch(() => ({ data: null })),
            api.get("/providers", { params: { tenantId } }).catch(() => ({ data: [] }))
        ]).then(([noticesRes, projectsRes, accessibilityRes, providersRes]) => {
            const notices = Array.isArray(noticesRes.data) ? noticesRes.data : [];
            const projects = Array.isArray(projectsRes.data) ? projectsRes.data : [];
            const accessibilityData = accessibilityRes.data;
            const providers = Array.isArray(providersRes.data) ? providersRes.data : [];

            // Process notices
            const noticesByStatus: Record<string, number> = {};
            let totalBudget = 0;
            notices.forEach((n: any) => {
                noticesByStatus[n.status] = (noticesByStatus[n.status] || 0) + 1;
                totalBudget += parseFloat(n.totalBudget) || 0;
            });

            // Process projects
            const projectsByStatus: Record<string, number> = {};
            let totalRequested = 0;
            let totalApproved = 0;
            let totalAudience = 0;
            projects.forEach((p: any) => {
                projectsByStatus[p.status] = (projectsByStatus[p.status] || 0) + 1;
                totalRequested += parseFloat(p.requestedBudget) || 0;
                totalApproved += parseFloat(p.approvedBudget) || 0;
                totalAudience += p.actualAudience || p.expectedAudience || 0;
            });

            // Process accessibility
            const accessibilityByService: Record<string, number> = {};
            const accessibilityByStatus: Record<string, number> = {};
            if (accessibilityData?.byService) {
                accessibilityData.byService.forEach((s: any) => {
                    accessibilityByService[s.serviceType] = s._count;
                });
            }
            if (accessibilityData?.byStatus) {
                accessibilityData.byStatus.forEach((s: any) => {
                    accessibilityByStatus[s.status] = s._count;
                });
            }

            // Process providers
            const activeProviders = providers.filter((p: any) => p.active).length;
            const totalJobs = providers.reduce((acc: number, p: any) => acc + (p.completedJobs || 0), 0);

            setData({
                notices: {
                    total: notices.length,
                    byStatus: noticesByStatus,
                    totalBudget
                },
                projects: {
                    total: projects.length,
                    byStatus: projectsByStatus,
                    totalRequested,
                    totalApproved,
                    totalAudience
                },
                accessibility: {
                    total: Object.values(accessibilityByStatus).reduce((a, b) => a + b, 0),
                    byService: accessibilityByService,
                    byStatus: accessibilityByStatus
                },
                providers: {
                    total: providers.length,
                    active: activeProviders,
                    totalJobs
                }
            });
        }).finally(() => setLoading(false));
    }, [tenantId, dateRange]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
    };

    const exportReport = () => {
        if (!data) return;

        const reportText = `
RELATÓRIO INSTITUCIONAL
========================
Período: ${dateRange.start} a ${dateRange.end}
Gerado em: ${new Date().toLocaleString("pt-BR")}

EDITAIS PÚBLICOS
----------------
Total de editais: ${data.notices.total}
Orçamento total: ${formatCurrency(data.notices.totalBudget)}
Por status:
${Object.entries(data.notices.byStatus).map(([k, v]) => `  - ${k}: ${v}`).join("\n")}

PROJETOS CULTURAIS
------------------
Total de projetos: ${data.projects.total}
Valor solicitado: ${formatCurrency(data.projects.totalRequested)}
Valor aprovado: ${formatCurrency(data.projects.totalApproved)}
Público impactado: ${data.projects.totalAudience.toLocaleString("pt-BR")} pessoas
Por status:
${Object.entries(data.projects.byStatus).map(([k, v]) => `  - ${k}: ${v}`).join("\n")}

ACESSIBILIDADE
--------------
Total de serviços: ${data.accessibility.total}
Por tipo:
${Object.entries(data.accessibility.byService).map(([k, v]) => `  - ${k}: ${v}`).join("\n")}

PRESTADORES
-----------
Total cadastrados: ${data.providers.total}
Ativos: ${data.providers.active}
Trabalhos realizados: ${data.providers.totalJobs}
        `.trim();

        const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `relatorio-institucional-${dateRange.start}-${dateRange.end}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return <div className="loading">Carregando relatório...</div>;
    }

    if (!data) {
        return <div className="card">Erro ao carregar dados do relatório</div>;
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
                <div>
                    <h1 className="section-title"><BarChart2 size={28} style={{ marginRight: "0.5rem" }} />Relatórios Institucionais</h1>

                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input
                        type="date"
                        className="input"
                        value={dateRange.start}
                        onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                        style={{ width: "auto" }}
                    />
                    <span>até</span>
                    <input
                        type="date"
                        className="input"
                        value={dateRange.end}
                        onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                        style={{ width: "auto" }}
                    />
                    <button className="btn btn-primary" onClick={exportReport} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Download size={18} />
                        Exportar
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                <div className="card" style={{ textAlign: "center", borderLeft: "4px solid #3b82f6" }}>
                    <FileText size={32} color="#3b82f6" style={{ marginBottom: "0.5rem" }} />
                    <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{data.notices.total}</div>
                    <div style={{ color: "var(--fg-muted)" }}>Editais</div>
                    <div style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>{formatCurrency(data.notices.totalBudget)}</div>
                </div>

                <div className="card" style={{ textAlign: "center", borderLeft: "4px solid #22c55e" }}>
                    <Calendar size={32} color="#22c55e" style={{ marginBottom: "0.5rem" }} />
                    <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{data.projects.total}</div>
                    <div style={{ color: "var(--fg-muted)" }}>Projetos</div>
                    <div style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>{formatCurrency(data.projects.totalApproved)}</div>
                </div>

                <div className="card" style={{ textAlign: "center", borderLeft: "4px solid #8b5cf6" }}>
                    <Users size={32} color="#8b5cf6" style={{ marginBottom: "0.5rem" }} />
                    <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{data.projects.totalAudience.toLocaleString("pt-BR")}</div>
                    <div style={{ color: "var(--fg-muted)" }}>Público Impactado</div>
                </div>

                <div className="card" style={{ textAlign: "center", borderLeft: "4px solid #f59e0b" }}>
                    <DollarSign size={32} color="#f59e0b" style={{ marginBottom: "0.5rem" }} />
                    <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{formatCurrency(data.projects.totalRequested)}</div>
                    <div style={{ color: "var(--fg-muted)" }}>Investimento Solicitado</div>
                </div>
            </div>

            {/* Detailed Sections */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                {/* Editais por Status */}
                <div className="card">
                    <h3 style={{ marginBottom: "1rem" }}>📋 Editais por Status</h3>
                    {Object.entries(data.notices.byStatus).length === 0 ? (
                        <p style={{ color: "var(--fg-muted)" }}>Nenhum edital cadastrado</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {Object.entries(data.notices.byStatus).map(([status, count]) => (
                                <div key={status} style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span>{status}</span>
                                    <strong>{count}</strong>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Projetos por Status */}
                <div className="card">
                    <h3 style={{ marginBottom: "1rem" }}>🎨 Projetos por Status</h3>
                    {Object.entries(data.projects.byStatus).length === 0 ? (
                        <p style={{ color: "var(--fg-muted)" }}>Nenhum projeto cadastrado</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {Object.entries(data.projects.byStatus).map(([status, count]) => (
                                <div key={status} style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span>{status}</span>
                                    <strong>{count}</strong>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Acessibilidade por Serviço */}
                <div className="card">
                    <h3 style={{ marginBottom: "1rem" }}>♿ Acessibilidade por Serviço</h3>
                    {Object.entries(data.accessibility.byService).length === 0 ? (
                        <p style={{ color: "var(--fg-muted)" }}>Nenhum serviço registrado</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {Object.entries(data.accessibility.byService).map(([service, count]) => (
                                <div key={service} style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span>{service}</span>
                                    <strong>{count}</strong>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Prestadores */}
                <div className="card">
                    <h3 style={{ marginBottom: "1rem" }}>👷 Prestadores</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Total Cadastrados</span>
                            <strong>{data.providers.total}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Ativos</span>
                            <strong>{data.providers.active}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Trabalhos Realizados</span>
                            <strong>{data.providers.totalJobs}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
