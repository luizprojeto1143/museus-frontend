import React, { useState, useEffect } from "react";
import { logger } from "@/utils/logger";

import { useTranslation } from "react-i18next";
import { api } from "../../../../api/client";
import { DollarSign, ExternalLink, Activity, ArrowUpRight, TrendingUp, FileText } from "lucide-react";

export const ProducerFinance: React.FC = () => {
    const { t } = useTranslation();
    const [balance, setBalance] = useState({ available: 0, pending: 0 });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchBalance();
    }, []);

    const fetchBalance = async () => {
        try {
            setLoading(true);
            const res = await api.get('/stripe/balance?type=PRODUCER');
            setBalance(res.data);
        } catch (error) {
            logger.error("Failed to fetch balance", error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        try {
            setActionLoading(true);
            const res = await api.get('/stripe/onboarding-link?type=PRODUCER');
            window.location.href = res.data.url;
        } catch (error) {
            logger.error("Failed to connect", error);
            logger.warn("Alert:", "Erro ao conectar conta Stripe");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDashboard = async () => {
        try {
            setActionLoading(true);
            const res = await api.get('/stripe/dashboard-link?type=PRODUCER');
            window.open(res.data.url, '_blank');
        } catch (error) {
            logger.error("Failed to open dashboard", error);
            // If they don't have an account, prompt to create
            if (window.confirm("Conta não configurada. Deseja configurar agora?")) {
                handleConnect();
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handlePayout = async () => {
        if (balance.available <= 0) {
            logger.warn("Alert:", "Você não possui saldo disponível para saque no momento.");
            return;
        }
        try {
            setActionLoading(true);
            const res = await api.post('/stripe/payout?type=PRODUCER');
            logger.warn("Alert:", res.data.message || "Saque solicitado com sucesso!");
            fetchBalance();
        } catch (error: unknown) {
            logger.error("Failed to process payout", error);
            const errMsg = error.response?.data?.message || "Erro ao solicitar saque";
            logger.warn("Alert:", errMsg);
        } finally {
            setActionLoading(false);
        }
    };

    const formatCurrency = (cents: number) => {
        return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tight">Financeiro & Saques</h1>
                <p className="text-gray-400 mt-2">Acompanhe seus recebimentos, bilheteria online e solicite saques diretamente para sua conta.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Available Balance */}
                <div className="bg-[#1a1108] border border-[var(--accent-primary)]/20 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign size={80} className="text-[var(--accent-primary)]" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-[#B0A090] text-sm uppercase tracking-widest font-bold mb-2">Saldo Disponível</h3>
                        <div className="text-4xl font-black text-white">
                            {loading ? "R$ ---" : formatCurrency(balance.available)}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Pronto para transferência para sua conta bancária.</p>
                    </div>
                </div>

                {/* Pending Balance */}
                <div className="bg-[#1a1108]/50 border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Activity size={80} className="text-white" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-gray-400 text-sm uppercase tracking-widest font-bold mb-2">Lançamentos Futuros</h3>
                        <div className="text-4xl font-black text-white opacity-80">
                            {loading ? "R$ ---" : formatCurrency(balance.pending)}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Valores em processamento (pagamentos recentes de ingressos).</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 mt-8">
                <button
                    onClick={handleDashboard}
                    disabled={actionLoading}
                    className="flex-1 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90 text-[#1a1108] h-14 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-colors disabled:opacity-50"
                >
                    <ExternalLink size={20} />
                    Painel Stripe
                </button>

                <button
                    onClick={handlePayout}
                    disabled={actionLoading || balance.available <= 0}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white border border-yellow-500/20 h-14 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-yellow-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <DollarSign size={20} />
                    Solicitar Saque Imediato
                </button>

                <button
                    onClick={handleConnect}
                    disabled={actionLoading}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 h-14 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-colors disabled:opacity-50"
                >
                    <ArrowUpRight size={20} />
                    Conectar / Atualizar Conta
                </button>
            </div>

            <div className="bg-[#1a1108] border border-white/5 p-8 rounded-2xl mt-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                        <TrendingUp size={24} className="text-[var(--accent-primary)]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Como funcionam os repasses?</h3>
                        <p className="text-sm text-gray-400">Entenda o fluxo da bilheteria online</p>
                    </div>
                </div>
                
                <div className="space-y-4 text-sm text-gray-300">
                    <p>
                        A plataforma utiliza o <strong>Stripe Connect</strong> para dividir os pagamentos automaticamente. Quando um visitante compra um ingresso online:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-gray-400">
                        <li>A taxa da plataforma (se aplicável) e a tarifa do cartão são retidas na fonte.</li>
                        <li>O valor líquido da sua parte vai direto para <strong>Lançamentos Futuros</strong>.</li>
                        <li>Após o prazo de liquidação da operadora de cartão (geralmente 2 a 14 dias), o valor vai para o <strong>Saldo Disponível</strong>.</li>
                        <li>Você pode configurar no Painel Stripe para que os saques para sua conta bancária ocorram diariamente, semanalmente ou manualmente.</li>
                    </ul>
                </div>
            </div>
            <div className="bg-[#1a1108] border border-[var(--accent-primary)]/20 p-8 rounded-2xl mt-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center">
                        <FileText size={24} className="text-[var(--accent-primary)]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white uppercase tracking-widest">Emissão de Notas Fiscais (NFS-e)</h3>
                        <p className="text-sm text-gray-400">Controle fiscal dos seus eventos</p>
                    </div>
                </div>
                
                <div className="bg-[#2c1e10] p-6 rounded-xl border border-[#463420]">
                    <p className="text-sm text-[#EAE0D5] mb-4">
                        Como Agente Cultural (Produtor), você deve emitir a Nota Fiscal de Serviço (NFS-e) correspondente aos ingressos vendidos. 
                        Este ambiente permite simular a integração com a prefeitura local.
                    </p>
                    
                    <div className="flex items-center gap-4">
                        <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-lg border border-white/10 text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-colors">
                            <ExternalLink size={16} />
                            Fazer Upload de NFS-e (PDF)
                        </button>
                        <button className="bg-[#4cd964]/10 hover:bg-[#4cd964]/20 text-[#4cd964] px-4 py-3 rounded-lg border border-[#4cd964]/20 text-sm font-bold uppercase tracking-wider transition-colors">
                            Simular Emissão Automática (API)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
