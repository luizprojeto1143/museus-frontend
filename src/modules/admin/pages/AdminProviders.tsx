import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../../contexts/ToastContext";

type Provider = {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    services: string[];
    active: boolean;
    completedJobs: number;
    rating?: number;
    verifiedAt?: string;
    _count?: { executions: number };
};

const serviceLabels: Record<string, string> = {
    LIBRAS_INTERPRETATION: "Interpretação Libras",
    AUDIO_DESCRIPTION: "Audiodescrição",
    CAPTIONING: "Legendagem",
    BRAILLE: "Braille",
    TACTILE_MODEL: "Modelo Tátil",
    EASY_READING: "Leitura Fácil"
};

export const AdminProviders: React.FC = () => {
    const { tenantId } = useAuth();
    const { addToast } = useToast();
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenantId) return;

        api.get("/providers", { params: { tenantId } })
            .then(res => setProviders(res.data))
            .catch(err => {
                console.error("Erro ao carregar prestadores", err);
                setProviders([]);
                addToast("Erro ao carregar prestadores", "error");
            })
            .finally(() => setLoading(false));
    }, [tenantId, addToast]);

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div>
                    <h1 className="section-title">👷 Prestadores de Acessibilidade</h1>
                    <p className="section-subtitle">Cadastro de intérpretes, audiodescritores e outros profissionais</p>
                </div>
                <Link to="/admin/prestadores/novo" className="btn">
                    + Novo Prestador
                </Link>
            </div>

            {loading ? (
                <p>Carregando...</p>
            ) : providers.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
                    <p>Nenhum prestador cadastrado</p>
                    <Link to="/admin/prestadores/novo" className="btn" style={{ marginTop: "1rem" }}>
                        Cadastrar primeiro prestador
                    </Link>
                </div>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Contato</th>
                            <th>Serviços</th>
                            <th>Trabalhos</th>
                            <th>Status</th>
                            <th style={{ textAlign: "right" }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {providers.map(provider => (
                            <tr key={provider.id}>
                                <td>
                                    <div>
                                        <strong>{provider.name}</strong>
                                        {provider.verifiedAt && (
                                            <span title="Verificado" style={{ marginLeft: "0.5rem" }}>✅</span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontSize: "0.85rem" }}>
                                        {provider.email && <div>{provider.email}</div>}
                                        {provider.phone && <div>{provider.phone}</div>}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                                        {provider.services.map(s => (
                                            <span key={s} className="chip" style={{ fontSize: "0.75rem" }}>
                                                {serviceLabels[s] || s}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td>
                                    {provider.completedJobs}
                                    {provider.rating && (
                                        <span style={{ marginLeft: "0.5rem", color: "#f59e0b" }}>
                                            ⭐ {provider.rating.toFixed(1)}
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <span className={`chip ${provider.active ? "" : "chip-error"}`}>
                                        {provider.active ? "Ativo" : "Inativo"}
                                    </span>
                                </td>
                                <td style={{ textAlign: "right" }}>
                                    <Link to={`/admin/prestadores/${provider.id}`} className="btn btn-secondary">
                                        Editar
                                    </Link>
                                    <button
                                        className="btn ml-2"
                                        style={{ backgroundColor: "#ef4444", color: "#fff", borderColor: "#ef4444" }}
                                        onClick={async () => {
                                            if (window.confirm(`Excluir prestador "${provider.name}"?`)) {
                                                try {
                                                    await api.delete(`/providers/${provider.id}`);
                                                    setProviders(providers.filter(p => p.id !== provider.id));
                                                    addToast("Prestador excluído com sucesso", "success");
                                                } catch (err) {
                                                    console.error("Erro ao excluir", err);
                                                    addToast("Erro ao excluir prestador", "error");
                                                }
                                            }
                                        }}
                                    >
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};
