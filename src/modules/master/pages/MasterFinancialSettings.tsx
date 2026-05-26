import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import {
    CreditCard,
    CheckCircle,
    ShieldCheck,
    TrendingUp,
    Banknote,
    Percent,
    ArrowUpRight,
    Settings,
    Save
} from "lucide-react";
import { Button, Badge, AnimateIn, Card } from "@/components/ui";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

export const MasterFinancialSettings: React.FC = () => {
    const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/tenants/${tenantId}/settings`);
            setSettings(res.data || {});
        } catch (error) {
            console.error(error);
            toast.error(t("master.financial.error_load", "Erro ao carregar configurações financeiras."));
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put(`/tenants/${tenantId}/settings`, settings);
            toast.success(t("master.financial.save_success", "Configurações financeiras salvas!"));
        } catch (error) {
            toast.error(t("master.financial.save_error", "Erro ao salvar configurações."));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">{t("master.financial.loading", "Carregando Financeiro...")}</p>
        </div>
    );

    return (
        <AnimateIn className="space-y-12 pb-32 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-gold-400 rounded-full" />
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                            {t("master.financial.title", "Conta")} <span className="text-gold-400">{t("master.financial.title_suffix", "da Plataforma")}</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 font-medium text-lg">{t("master.financial.subtitle", "Cadastre sua conta bancária para receber as taxas e comissões do sistema.")}</p>
                </div>
                <Badge variant="glass" className="h-10 px-4 rounded-xl border-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    <ShieldCheck size={14} className="mr-2 text-gold-400" />
                    {t("master.financial.master_only", "Acesso Master")}
                </Badge>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 bg-white/[0.02] border border-white/5 rounded-[32px] space-y-3"
                >
                    <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center text-gold-400">
                        <Banknote size={20} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{t("master.financial.total_revenue", "Receita Total")}</p>
                    <p className="text-2xl font-black text-white">R$ 0,00</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 bg-white/[0.02] border border-white/5 rounded-[32px] space-y-3"
                >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <Percent size={20} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{t("master.financial.platform_fee", "Taxa da Plataforma")}</p>
                    <p className="text-2xl font-black text-white">10%</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 bg-white/[0.02] border border-white/5 rounded-[32px] space-y-3"
                >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <TrendingUp size={20} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{t("master.financial.connected_tenants", "Tenants Conectados")}</p>
                    <p className="text-2xl font-black text-white">0</p>
                </motion.div>
            </div>

            {/* Main Stripe Connect Card */}
            <Card className="p-10 bg-white/[0.02] border-white/5 rounded-[48px] space-y-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gold-400/10 text-gold-400 flex items-center justify-center">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tighter">{t("master.financial.stripe_connect", "Stripe Connect — Conta Principal")}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{t("master.financial.stripe_desc", "Todas as taxas e comissões caem nesta conta")}</p>
                    </div>
                </div>

                <div className="p-8 bg-gradient-to-br from-gold-400/10 to-transparent rounded-[32px] border border-gold-400/20 space-y-6">
                    <div className="flex items-start gap-4">
                        <ShieldCheck className="text-gold-400 mt-1" size={24} />
                        <div>
                            <h4 className="text-white font-bold">{t("master.financial.platform_account", "Conta da Plataforma")}</h4>
                            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                                {t("master.financial.platform_account_desc", "Esta é a conta bancária principal que recebe automaticamente as taxas de serviço (comissão) de cada transação feita por museus, teatros, secretarias e prestadores na plataforma.")}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center py-10 bg-black/20 rounded-[24px] border border-white/5">
                        {settings.stripeConnectId ? (
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-2">
                                    <CheckCircle size={32} />
                                </div>
                                <h5 className="text-lg font-black text-white italic">ID: {settings.stripeConnectId}</h5>
                                <Badge className="bg-green-500/10 text-green-400 border-green-500/20">{t("master.financial.operational", "OPERACIONAL")}</Badge>
                                <div className="pt-4 flex gap-3 justify-center">
                                    <Button variant="glass" className="rounded-xl border-white/5">
                                        <ArrowUpRight size={14} className="mr-2" />
                                        {t("master.financial.open_stripe", "Abrir Stripe Dashboard")}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center space-y-4 max-w-sm">
                                <CreditCard className="text-slate-700 mx-auto" size={48} />
                                <p className="text-sm text-slate-400">{t("master.financial.connect_prompt", "Conecte sua conta bancária para começar a receber as taxas e comissões de toda a plataforma.")}</p>
                                <Button 
                                    className="w-full bg-gold-400 text-slate-950 font-black rounded-xl h-14 text-sm"
                                    onClick={async () => {
                                        try {
                                            const { data } = await api.get('/stripe/onboarding-link?type=MASTER');
                                            if (data && data.url) window.location.href = data.url;
                                        } catch (err) {
                                            toast.error(t("master.financial.stripe_error", "Erro ao gerar link do Stripe"));
                                        }
                                    }}
                                >
                                    {t("master.financial.connect_now", "CONECTAR CONTA BANCÁRIA")}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
                <Button 
                    onClick={handleSave}
                    isLoading={saving}
                    className="h-16 px-12 rounded-[24px] bg-gold-400 text-slate-950 font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-gold-400/20 hover:scale-105 transition-all"
                    leftIcon={<Save size={20} />}
                >
                    {t("master.financial.save", "Salvar Configurações")}
                </Button>
            </div>
        </AnimateIn>
    );
};
