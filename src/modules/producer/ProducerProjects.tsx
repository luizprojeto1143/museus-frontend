import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { useTranslation } from "react-i18next";
import { Plus, Edit, Eye, Filter } from "lucide-react";
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
        const colors: Record<string, string> = {
            DRAFT: "bg-gray-500",
            SUBMITTED: "bg-blue-500",
            APPROVED: "bg-green-500",
            REJECTED: "bg-red-500",
            UNDER_REVIEW: "bg-yellow-500",
            IN_EXECUTION: "bg-purple-500",
            COMPLETED: "bg-cyan-500"
        };
        const labels: Record<string, string> = {
            DRAFT: "Rascunho",
            SUBMITTED: "Submetido",
            APPROVED: "Aprovado",
            REJECTED: "Rejeitado",
            UNDER_REVIEW: "Em Análise",
            IN_EXECUTION: "Em Execução",
            COMPLETED: "Concluído"
        };
        return <span className={`px-2 py-1 rounded text-xs font-bold text-white ${colors[status] || "bg-gray-500"}`}>{labels[status] || status}</span>;
    };

    return (
        <div className="producer-projects">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gold">Meus Projetos</h1>
                    <p className="text-gray-400">Gerencie seus projetos culturais</p>
                </div>
                <Link to="/producer/projects/new" className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> Novo Projeto
                </Link>
            </div>

            {loading ? <p>Carregando...</p> : (
                <div className="grid gap-4">
                    {projects.length === 0 ? (
                        <div className="p-8 text-center bg-black/20 rounded border border-gray-800">
                            <p className="text-gray-400 mb-4">Você ainda não tem projetos cadastrados.</p>
                            <Link to="/producer/projects/new" className="text-gold hover:underline">Criar meu primeiro projeto</Link>
                        </div>
                    ) : (
                        projects.map(project => (
                            <div key={project.id} className="card p-4 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-100">{project.title}</h3>
                                    <div className="flex gap-2 items-center mt-1 text-sm text-gray-400">
                                        {getStatusBadge(project.status)}
                                        <span>• Criado em: {new Date(project.createdAt).toLocaleDateString()}</span>
                                        {project.notice && <span>• Edital: {project.notice.title}</span>}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Link to={`/producer/projects/${project.id}`} className="p-2 hover:bg-white/10 rounded" title={project.status === 'DRAFT' ? "Editar" : "Visualizar"}>
                                        {project.status === 'DRAFT' ? <Edit size={18} className="text-blue-400" /> : <Eye size={18} className="text-gray-400" />}
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
