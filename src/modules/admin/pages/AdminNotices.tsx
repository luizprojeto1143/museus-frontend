import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../../contexts/ToastContext";

type Notice = {
    id: string;
    title: string;
    status: string;
    inscriptionStart: string;
    inscriptionEnd: string;
    totalBudget?: number;
    _count?: { projects: number };
};

const statusLabels: Record<string, { label: string; color: string }> = {
    DRAFT: { label: "Rascunho", color: "#6b7280" },
    PUBLISHED: { label: "Publicado", color: "#3b82f6" },
    INSCRIPTIONS_OPEN: { label: "Inscrições Abertas", color: "#10b981" },
    INSCRIPTIONS_CLOSED: { label: "Inscrições Encerradas", color: "#f59e0b" },
    EVALUATION: { label: "Em Avaliação", color: "#8b5cf6" },
    RESULTS_PUBLISHED: { label: "Resultados", color: "#06b6d4" },
    FINISHED: { label: "Finalizado", color: "#64748b" }
};

export const AdminNotices: React.FC = () => {
    const { tenantId } = useAuth();
    const { addToast } = useToast();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenantId) return;

        api.get("/notices", { params: { tenantId } })
            .then(res => setNotices(res.data))
            .catch(err => {
                console.error("Erro ao carregar editais", err);
                setNotices([]);
                addToast("Erro ao carregar editais", "error");
            })
            .finally(() => setLoading(false));
    }, [tenantId, addToast]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("pt-BR");
    };

    const formatCurrency = (value?: number) => {
        if (!value) return "-";
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div>
                    <h1 className="section-title">📋 Editais Públicos</h1>

                </div>
                <Link to="/admin/editais/novo" className="btn">
                    + Novo Edital
                </Link>
            </div>

            {loading ? (
                <p>Carregando...</p>
            ) : notices.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
                    <p>Nenhum edital cadastrado</p>
                    <Link to="/admin/editais/novo" className="btn" style={{ marginTop: "1rem" }}>
                        Criar primeiro edital
                    </Link>
                </div>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Status</th>
                            <th>Inscrições</th>
                            <th>Orçamento</th>
                            <th>Projetos</th>
                            <th style={{ textAlign: "right" }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notices.map(notice => {
                            const statusInfo = statusLabels[notice.status] || { label: notice.status, color: "#6b7280" };
                            return (
                                <tr key={notice.id}>
                                    <td>{notice.title}</td>
                                    <td>
                                        <span className="chip" style={{ backgroundColor: statusInfo.color, color: "#fff" }}>
                                            {statusInfo.label}
                                        </span>
                                    </td>
                                    <td>
                                        {formatDate(notice.inscriptionStart)} - {formatDate(notice.inscriptionEnd)}
                                    </td>
                                    <td>{formatCurrency(notice.totalBudget)}</td>
                                    <td>{notice._count?.projects || 0}</td>
                                    <td style={{ textAlign: "right" }}>
                                        <Link to={`/admin/editais/${notice.id}`} className="btn btn-secondary">
                                            Editar
                                        </Link>
                                        <Link to={`/admin/editais/${notice.id}/projetos`} className="btn btn-primary ml-2">
                                            Ver Projetos
                                        </Link>
                                        <button
                                            className="btn ml-2"
                                            style={{ backgroundColor: "#ef4444", color: "#fff", borderColor: "#ef4444" }}
                                            onClick={async () => {
                                                if (window.confirm(`Excluir edital "${notice.title}"?`)) {
                                                    try {
                                                        await api.delete(`/notices/${notice.id}`);
                                                        setNotices(notices.filter(n => n.id !== notice.id));
                                                        addToast("Edital excluído com sucesso", "success");
                                                    } catch (err) {
                                                        console.error("Erro ao excluir", err);
                                                        addToast("Erro ao excluir edital", "error");
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
