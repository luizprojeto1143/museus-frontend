import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useTranslation } from "react-i18next";
import { Plus, Edit, Eye, FileText, ArrowRight } from "lucide-react";
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
    const router = useNavigate();
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
        const config: Record<string, string> = {
            DRAFT: "bg-gray-500/20 text-gray-400 border-gray-500/50",
            SUBMITTED: "bg-blue-500/20 text-blue-400 border-blue-500/50",
            APPROVED: "bg-green-500/20 text-green-400 border-green-500/50",
            REJECTED: "bg-red-500/20 text-red-400 border-red-500/50",
            UNDER_REVIEW: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
            IN_EXECUTION: "bg-purple-500/20 text-purple-400 border-purple-500/50",
            COMPLETED: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
        };

        const label: Record<string, string> = {
            DRAFT: "Rascunho",
            SUBMITTED: "Submetido",
            APPROVED: "Aprovado",
            REJECTED: "Rejeitado",
            UNDER_REVIEW: "Em Análise",
            IN_EXECUTION: "Em Execução",
            COMPLETED: "Concluído"
        };

        const className = config[status] || "bg-gray-500/20 text-gray-400 border-gray-500/50";
        const text = label[status] || status;

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${className}`}>
                {text}
            </span>
        );
    };

    return (
        <div className="pb-16 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#D4AF37] mb-2 font-serif flex items-center gap-3">
                        Meus Projetos
                    </h1>
                    <p className="text-[#B0A090]">Gerencie seus projetos culturais e acompanhe o status.</p>
                </div>
                <Link
                    to="/producer/projects/new"
                    className="bg-[#D4AF37] text-[#1a1108] hover:bg-[#c5a028] px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg shadow-[#D4AF37]/20"
                >
                    <Plus size={20} /> Novo Projeto
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    {projects.length === 0 ? (
                        <div className="bg-[#2c1e10] rounded-2xl p-12 text-center border border-dashed border-[#463420]">
                            <div className="w-20 h-20 bg-black/20 rounded-full flex items-center justify-center mx-auto mb-6 text-[#463420]">
                                <FileText size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-[#EAE0D5] mb-2">{t("producer.producerprojects.vocAindaNoTemProjetos", `Você ainda não tem projetos`)}</h3>
                            <p className="text-[#B0A090] mb-8 max-w-md mx-auto">
                                Crie projetos para participar de editais ou para captar recursos via Lei de Incentivo.
                            </p>
                            <Link
                                to="/producer/projects/new"
                                className="inline-flex items-center gap-2 text-[#D4AF37] hover:underline font-bold"
                            >
                                Criar meu primeiro projeto <ArrowRight size={16} />
                            </Link>
                        </div>
                    ) : (
                        projects.map(project => (
                            <div
                                key={project.id}
                                className="bg-[#2c1e10] p-6 rounded-xl border border-[#463420] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-[#D4AF37]/50 transition-all group"
                            >
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-[#EAE0D5] group-hover:text-[#D4AF37] transition-colors">
                                            {project.title}
                                        </h3>
                                        {getStatusBadge(project.status)}
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-[#B0A090]">
                                        <span>Criado em: <strong className="text-[#EAE0D5]">{new Date(project.createdAt).toLocaleDateString()}</strong></span>
                                        {project.notice && (
                                            <span className="flex items-center gap-1 text-[#D4AF37]">
                                                <FileText size={14} /> Edital: {project.notice.title}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <button
                                        onClick={() => router(`/producer/projects/${project.id}`)}
                                        className="flex-1 md:flex-none px-4 py-2 bg-black/20 hover:bg-[#D4AF37] hover:text-[#1a1108] border border-[#463420] rounded-lg text-[#EAE0D5] text-sm font-bold flex items-center justify-center gap-2 transition-all"
                                        title={project.status === 'DRAFT' ? "Editar" : "Visualizar"}
                                    >
                                        {project.status === 'DRAFT' ? <><Edit size={16} /> Editar</> : <><Eye size={16} /> Detalhes</>}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
