import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../../contexts/ToastContext";

type Project = {
    id: string;
    title: string;
    status: string;
    culturalCategory?: string;
    targetRegion?: string;
    requestedBudget?: number;
    notice?: { id: string; title: string };
};

const statusLabels: Record<string, { label: string; color: string }> = {
    DRAFT: { label: "Rascunho", color: "#6b7280" },
    SUBMITTED: { label: "Enviado", color: "#3b82f6" },
    UNDER_REVIEW: { label: "Em Análise", color: "#8b5cf6" },
    APPROVED: { label: "Aprovado", color: "#10b981" },
    REJECTED: { label: "Reprovado", color: "#ef4444" },
    IN_EXECUTION: { label: "Em Execução", color: "#f59e0b" },
    COMPLETED: { label: "Concluído", color: "#06b6d4" },
    CANCELED: { label: "Cancelado", color: "#64748b" }
};

export const AdminProjects: React.FC = () => {
    const { tenantId } = useAuth();
    const { addToast } = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");

    useEffect(() => {
        if (!tenantId) return;

        const params: any = { tenantId };
        if (filter) params.status = filter;

        api.get("/projects", { params })
            .then(res => setProjects(res.data))
            .catch(err => {
                console.error("Erro ao carregar projetos", err);
                setProjects([]);
                addToast("Erro ao carregar projetos", "error");
            })
            .finally(() => setLoading(false));
    }, [tenantId, filter, addToast]);

    const formatCurrency = (value?: number) => {
        if (!value) return "-";
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div>
                    <h1 className="section-title">🎨 Projetos Culturais</h1>

                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <select
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="input"
                        style={{ width: "auto" }}
                    >
                        <option value="">Todos os status</option>
                        {Object.entries(statusLabels).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <p>Carregando...</p>
            ) : projects.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
                    <p>Nenhum projeto encontrado</p>
                </div>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Edital</th>
                            <th>Categoria</th>
                            <th>Região</th>
                            <th>Orçamento</th>
                            <th>Status</th>
                            <th style={{ textAlign: "right" }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map(project => {
                            const statusInfo = statusLabels[project.status] || { label: project.status, color: "#6b7280" };
                            return (
                                <tr key={project.id}>
                                    <td>{project.title}</td>
                                    <td>{project.notice?.title || "-"}</td>
                                    <td>{project.culturalCategory || "-"}</td>
                                    <td>{project.targetRegion || "-"}</td>
                                    <td>{formatCurrency(project.requestedBudget)}</td>
                                    <td>
                                        <span className="chip" style={{ backgroundColor: statusInfo.color, color: "#fff" }}>
                                            {statusInfo.label}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        <Link to={`/admin/projetos/${project.id}`} className="btn btn-secondary">
                                            Ver Detalhes
                                        </Link>
                                        <button
                                            className="btn ml-2"
                                            style={{ backgroundColor: "#ef4444", color: "#fff", borderColor: "#ef4444" }}
                                            onClick={async () => {
                                                if (window.confirm(`Excluir projeto "${project.title}"?`)) {
                                                    try {
                                                        await api.delete(`/projects/${project.id}`);
                                                        setProjects(projects.filter(p => p.id !== project.id));
                                                        addToast("Projeto excluído com sucesso", "success");
                                                    } catch (err) {
                                                        console.error("Erro ao excluir", err);
                                                        addToast("Erro ao excluir projeto", "error");
                                                    }
                                                }
                                            }}
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};
