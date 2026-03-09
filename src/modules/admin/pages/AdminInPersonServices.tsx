import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";
import { useTranslation } from "react-i18next";
import { HandMetal, CheckCircle2, XCircle } from "lucide-react";
import "./AdminShared.css";

interface AdminServiceOption {
    id: string;
    name: string;
    description: string | null;
    enabled: boolean;
    tenantServiceId: string | null;
}

export const AdminInPersonServices: React.FC = () => {
    const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [services, setServices] = useState<AdminServiceOption[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (tenantId) {
            loadServices();
        }
    }, [tenantId]);

    const loadServices = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/tenant-services/admin/${tenantId}`);
            setServices(res.data);
        } catch (error) {
            console.error("Erro ao carregar serviços:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (inPersonServiceId: string, currentStatus: boolean) => {
        if (!tenantId) return;

        try {
            // Optimistic UI update
            setServices(prev => prev.map(s => s.id === inPersonServiceId ? { ...s, enabled: !currentStatus } : s));

            await api.post("/tenant-services", {
                tenantId,
                inPersonServiceId,
                active: !currentStatus
            });

            // Reload to ensure sync
            loadServices();
        } catch (error) {
            console.error("Erro ao atualizar serviço:", error);
            alert("Erro ao atualizar status do serviço.");
            loadServices(); // Revert on error
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="w-8 h-8 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="admin-page-container p-8 max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-serif text-[var(--accent-gold)] flex items-center gap-3">
                    <HandMetal size={32} />
                    Configuração de Serviços Presenciais
                </h1>
                <p className="text-[var(--fg-muted)] mt-2">
                    Nesta tela, você pode escolher quais serviços presenciais (oferecidos pelo Master)
                    estarão disponíveis para os visitantes agendarem em sua instituição.
                </p>
            </header>

            <div className="admin-card">
                <div className="admin-card-header mb-6">
                    <h2 className="text-xl text-white">Serviços Disponíveis</h2>
                </div>

                <div className="space-y-4">
                    {services.length === 0 ? (
                        <p className="text-[var(--fg-muted)] text-center py-8">Nenhum serviço disponibilizado pelo Master no momento.</p>
                    ) : (
                        services.map(srv => (
                            <div
                                key={srv.id}
                                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${srv.enabled
                                        ? "bg-[rgba(212,175,55,0.05)] border-[var(--accent-gold)]"
                                        : "bg-[var(--bg-surface-active)] border-[var(--border-subtle)]"
                                    }`}
                            >
                                <div>
                                    <h3 className="text-lg text-white font-medium flex items-center gap-2">
                                        {srv.name}
                                        {srv.enabled ? (
                                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded flex items-center gap-1">
                                                <CheckCircle2 size={12} /> Ativo no Museu
                                            </span>
                                        ) : (
                                            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded flex items-center gap-1">
                                                <XCircle size={12} /> Desativado
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-sm text-[var(--fg-muted)] mt-1">{srv.description}</p>
                                </div>

                                <div className="flex flex-col items-center">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={srv.enabled}
                                            onChange={() => handleToggle(srv.id, srv.enabled)}
                                        />
                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-gold)]"></div>
                                    </label>
                                    <span className="text-[10px] text-[var(--fg-muted)] mt-1 uppercase tracking-wider font-semibold">
                                        {srv.enabled ? "Ativo" : "Inativo"}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
