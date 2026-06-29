import React, { useState, useEffect } from "react";
import { logger } from "@/utils/logger";

import { api } from "../../../../api/client";
import { toast } from "react-hot-toast";
import { Card, Button } from "@/components/ui";
import { DollarSign, Save } from "lucide-react";
import { useAuth } from "../../../auth/AuthContext";

export function AdminSponsorshipSettings() {
    const { tenantId } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [sponsorSharedPrice, setSponsorSharedPrice] = useState("250");
    const [sponsorExclusivePrice, setSponsorExclusivePrice] = useState("500");

    useEffect(() => {
        if (tenantId) fetchSettings();
    }, [tenantId]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/tenants/${tenantId}/settings`);
            if (res.data.sponsorSharedPrice) setSponsorSharedPrice(res.data.sponsorSharedPrice.toString());
            if (res.data.sponsorExclusivePrice) setSponsorExclusivePrice(res.data.sponsorExclusivePrice.toString());
        } catch (error) {
            logger.error("Erro ao carregar configurações de patrocínio:", error);
            toast.error("Falha ao carregar configurações.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        const shared = Number(sponsorSharedPrice);
        const exclusive = Number(sponsorExclusivePrice);

        if (isNaN(shared) || shared < 250) {
            toast.error("O valor do patrocínio compartilhado deve ser no mínimo R$ 250.");
            return;
        }

        if (isNaN(exclusive) || exclusive < 250) {
            toast.error("O valor do patrocínio exclusivo deve ser no mínimo R$ 250.");
            return;
        }

        try {
            setSaving(true);
            await api.put(`/tenants/${tenantId}/settings`, {
                sponsorSharedPrice: shared,
                sponsorExclusivePrice: exclusive
            });
            toast.success("Valores de patrocínio atualizados com sucesso!");
        } catch (error) {
            logger.error(error);
            toast.error("Erro ao salvar valores.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-white">Carregando...</div>;
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-8">
            <div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tight">Configurações de Patrocínio</h1>
                <p className="text-gray-400 mt-2">Defina os valores que as empresas pagarão para patrocinar as obras do seu museu.</p>
            </div>

            <Card className="p-6 bg-slate-900 border-slate-800">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Valor Patrocínio Compartilhado (Mensal)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500">R$</span>
                            </div>
                            <input
                                type="number"
                                min="250"
                                step="10"
                                className="w-full bg-black border border-slate-700 rounded-xl pl-10 p-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                value={sponsorSharedPrice}
                                onChange={(e) => setSponsorSharedPrice(e.target.value)}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Valor mínimo: R$ 250,00. Múltiplas empresas podem patrocinar a mesma obra.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Valor Patrocínio Exclusivo (Mensal)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500">R$</span>
                            </div>
                            <input
                                type="number"
                                min="250"
                                step="10"
                                className="w-full bg-black border border-slate-700 rounded-xl pl-10 p-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                value={sponsorExclusivePrice}
                                onChange={(e) => setSponsorExclusivePrice(e.target.value)}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Valor mínimo: R$ 250,00. Apenas uma empresa patrocinará a obra.</p>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button 
                            className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            <Save size={18} />
                            {saving ? "Salvando..." : "Salvar Valores"}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
