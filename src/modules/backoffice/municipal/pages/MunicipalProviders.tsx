import { useTranslation } from "react-i18next";
import { logger } from "@/utils/logger";

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../../api/client";
import { useAuth } from "../../../auth/AuthContext";
import { useToast } from "../../../../contexts/ToastContext";

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

export const MunicipalProviders: React.FC = () => {
  const { t } = useTranslation();
    const { tenantId } = useAuth();
    const { addToast } = useToast();
    const [providers, setProviders] = useState<Provider[]>([]);
    const [providerToDelete, setProviderToDelete] = useState<Provider | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenantId) return;

        api.get<Provider[]>("/providers", { params: { tenantId } })
            .then(res => setProviders(Array.isArray(res.data) ? res.data : []))
            .catch(err => {
                logger.error("Erro ao carregar prestadores", err);
                setProviders([]);
                addToast("Erro ao carregar prestadores", "error");
            })
            .finally(() => setLoading(false));
    }, [tenantId, addToast]);

    const handleDelete = async (provider: Provider) => {
        try {
            await api.delete(`/providers/${provider.id}`);
            setProviders(current => current.filter(p => p.id !== provider.id));
            setProviderToDelete(null);
            addToast("Prestador excluído com sucesso", "success");
        } catch (err) {
            logger.error("Erro ao excluir", err);
            addToast("Erro ao excluir prestador", "error");
        }
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div>
                    <h1 className="section-title">👷 Prestadores de Acessibilidade</h1>

                </div>
                <Link to="/municipal/prestadores/novo" className="inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-colors cursor-pointer border bg-[var(--bg-surface-hover)] text-[var(--fg-main)] border-[var(--border-default)] text-[13px] px-5 py-2.5 rounded-[var(--radius-md)]">
                    + Novo Prestador
                </Link>
            </div>

            {loading ? (
                <p>Carregando...</p>
            ) : providers.length === 0 ? (
                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 transition-colors" style={{ textAlign: "center", padding: "2rem" }}>
                    <p>Nenhum prestador cadastrado</p>
                    <Link to="/municipal/prestadores/novo" className="inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-colors cursor-pointer border bg-[var(--bg-surface-hover)] text-[var(--fg-main)] border-[var(--border-default)] text-[13px] px-5 py-2.5 rounded-[var(--radius-md)]" style={{ marginTop: "1rem" }}>
                        Cadastrar primeiro prestador
                    </Link>
                </div>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Contato</th>
                            <th>{t("admin.providers.servios", `Serviços`)}</th>
                            <th>Trabalhos</th>
                            <th>Status</th>
                            <th style={{ textAlign: "right" }}>{t("admin.providers.aes", `Ações`)}</th>
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
                                    <Link to={`/municipal/prestadores/${provider.id}`} className="inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-colors cursor-pointer border bg-[var(--glass-bg-light)] text-[var(--fg-main)] border-[var(--border-default)] backdrop-blur-sm text-[13px] px-5 py-2.5 rounded-[var(--radius-md)]">
                                        Editar
                                    </Link>
                                    <button
                                        className="btn ml-2"
                                        style={{ backgroundColor: "#ef4444", color: "#fff", borderColor: "#ef4444" }}
                                        onClick={() => setProviderToDelete(provider)}
                                    >
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {providerToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
                    <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-[var(--bg-surface)] p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-3">Excluir prestador</h2>
                        <p className="text-sm opacity-80 mb-6">Excluir prestador "{providerToDelete.name}"?</p>
                        <div className="flex justify-end gap-3">
                            <button type="button" className="btn" onClick={() => setProviderToDelete(null)}>
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="btn"
                                style={{ backgroundColor: "#ef4444", color: "#fff" }}
                                onClick={() => void handleDelete(providerToDelete)}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
