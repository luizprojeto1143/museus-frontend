import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { useTranslation } from "react-i18next";
import { Plus, Edit, Eye } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

interface Project {
    id: string;
    title: string;
    status: string;
    createdAt: string;
    notice?: { title: string };
}

export const ProducerProjects: React.FC = () => {
    const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/projects/my")
            .then(res => setProjects(Array.isArray(res.data) ? res.data : []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { bg: string; label: string }> = {
            DRAFT: { bg: "#6b7280", label: "Rascunho" },
            SUBMITTED: { bg: "#3b82f6", label: "Submetido" },
            APPROVED: { bg: "#22c55e", label: "Aprovado" },
            REJECTED: { bg: "#ef4444", label: "Rejeitado" },
            UNDER_REVIEW: { bg: "#eab308", label: "Em Análise" },
            IN_EXECUTION: { bg: "#a855f7", label: "Em Execução" },
            COMPLETED: { bg: "#06b6d4", label: "Concluído" }
        };
        const config = statusConfig[status] || { bg: "#6b7280", label: status };
        return (
            <span style={{
                padding: "0.25rem 0.75rem",
                borderRadius: "1rem",
                fontSize: "0.75rem",
                fontWeight: "bold",
                color: "#fff",
                background: config.bg
            }}>
                {config.label}
            </span>
        );
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.8rem", color: "#d4af37", marginBottom: "0.5rem" }}>
                        📂 Meus Projetos
                    </h1>
                    <p style={{ color: "#B0A090" }}>Gerencie seus projetos culturais</p>
                </div>
                <Link
                    to="/producer/projects/new"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        background: "linear-gradient(135deg, #d4af37 0%, #f5d769 100%)",
                        color: "#1a1108",
                        fontWeight: "bold",
                        padding: "0.75rem 1.25rem",
                        borderRadius: "0.5rem",
                        textDecoration: "none",
                        transition: "all 0.2s"
                    }}
                >
                    <Plus size={18} /> Novo Projeto
                </Link>
            </div>

            {loading ? (
                <p style={{ color: "#B0A090" }}>Carregando...</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {projects.length === 0 ? (
                        <div style={{
                            padding: "3rem",
                            textAlign: "center",
                            background: "rgba(44, 30, 16, 0.5)",
                            borderRadius: "0.75rem",
                            border: "1px solid #463420"
                        }}>
                            <p style={{ color: "#B0A090", marginBottom: "1rem" }}>
                                Você ainda não tem projetos cadastrados.
                            </p>
                            <Link
                                to="/producer/projects/new"
                                style={{ color: "#d4af37", textDecoration: "underline" }}
                            >
                                Criar meu primeiro projeto
                            </Link>
                        </div>
                    ) : (
                        projects.map(project => (
                            <div
                                key={project.id}
                                style={{
                                    background: "rgba(44, 30, 16, 0.6)",
                                    border: "1px solid #463420",
                                    borderRadius: "0.75rem",
                                    padding: "1.25rem",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    transition: "all 0.2s"
                                }}
                            >
                                <div>
                                    <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#EAE0D5", marginBottom: "0.5rem" }}>
                                        {project.title}
                                    </h3>
                                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", fontSize: "0.9rem", color: "#B0A090" }}>
                                        {getStatusBadge(project.status)}
                                        <span>• Criado em: {new Date(project.createdAt).toLocaleDateString()}</span>
                                        {project.notice && <span>• Edital: {project.notice.title}</span>}
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <Link
                                        to={`/producer/projects/${project.id}`}
                                        style={{
                                            padding: "0.5rem",
                                            borderRadius: "0.375rem",
                                            color: project.status === 'DRAFT' ? "#3b82f6" : "#B0A090",
                                            background: "transparent",
                                            transition: "background 0.2s"
                                        }}
                                        title={project.status === 'DRAFT' ? "Editar" : "Visualizar"}
                                    >
                                        {project.status === 'DRAFT' ? <Edit size={18} /> : <Eye size={18} />}
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
