import { useTranslation } from "react-i18next";
import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../api/client";
import { useAuth } from "../auth/AuthContext";
import { 
    Loader2, 
    Plus, 
    Building2, 
    FileText, 
    Calendar, 
    Users, 
    Star, 
    ArrowRight, 
    MapPin, 
    Globe, 
    Phone, 
    Mail, 
    Clock, 
    Image, 
    Shield, 
    Hash, 
    LayoutDashboard, 
    Settings as SettingsIcon,
    Save,
    Palette,
    Zap,
    ShieldCheck,
    Smartphone,
    CreditCard,
    CheckCircle
} from "lucide-react";
import { 
    Button, 
    Badge, 
    AnimateIn, 
    Card, 
    Input 
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export const MunicipalSettings: React.FC = () => {
    const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState<'identity' | 'channels' | 'branding' | 'financeiro'>('identity');

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/tenants/${tenantId}/settings`);
            setSettings(res.data || {});
        } catch (error) {
            console.error(error);
            toast.error(t("municipal.settings.error_load", "Erro ao carregar preferências."));
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
            toast.success(t("municipal.settings.save_success", "Parâmetros salvos com sucesso!"));
        } catch (error) {
            toast.error(t("municipal.settings.save_error", "Erro ao salvar alterações."));
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field: string, value: any) => {
        setSettings((prev: any) => ({ ...prev, [field]: value }));
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">{t("municipal.settings.loading", "Configurando Terminal...")}</p>
        </div>
    );

    const sections = [
        { id: 'identity', label: t("municipal.settings.tab_identity", 'Identidade'), icon: <Building2 size={16} /> },
        { id: 'channels', label: t("municipal.settings.tab_channels", 'Canais Digitais'), icon: <Globe size={16} /> },
        { id: 'branding', label: t("municipal.settings.tab_branding", 'White-Label'), icon: <Palette size={16} /> },
        { id: 'financeiro', label: t("municipal.settings.tab_financial", 'Financeiro'), icon: <CreditCard size={16} /> },
    ];

    return (
        <AnimateIn className="space-y-12 pb-32 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                            {t("municipal.settings.title_parameters", "Parâmetros")} <span className="text-emerald-500">{t("municipal.settings.title_strategic", "Estratégicos")}</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 font-medium text-lg">{t("municipal.settings.subtitle", "Definições globais de identidade, governança e experiência do cidadão.")}</p>
                </div>
                <Badge variant="glass" className="h-10 px-4 rounded-xl border-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    <ShieldCheck size={14} className="mr-2 text-emerald-500" />
                    {t("municipal.settings.authenticated_env", "Ambiente Autenticado")}
                </Badge>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl w-fit">
                {sections.map(section => (
                    <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id as any)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                            activeSection === section.id 
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                            : 'text-slate-500 hover:text-white'
                        }`}
                    >
                        {section.icon}
                        {section.label}
                    </button>
                ))}
            </div>

            {/* Form Content */}
            <div className="grid grid-cols-1 gap-8">
                <AnimatePresence mode="wait">
                    {activeSection === 'identity' && (
                        <motion.div
                            key="identity"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <Card className="p-10 bg-white/[0.02] border-white/5 rounded-[48px] space-y-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center">
                                        <Building2 size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white tracking-tighter">{t("municipal.settings.institutional_identity", "Identidade Institucional")}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{t("municipal.settings.jurisdiction_data", "Dados vitais da jurisdição municipal")}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">{t("municipal.settings.managing_entity", "Entidade Gestora")}</label>
                                        <Input 
                                            value={settings.name || ""}
                                            onChange={e => updateField("name", e.target.value)}
                                            className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-white"
                                            placeholder={t("municipal.settings.entity_placeholder", "Ex: Secretaria de Cultura")}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">{t("municipal.settings.headquarters_address", "Endereço Sede")}</label>
                                        <Input 
                                            value={settings.address || ""}
                                            onChange={e => updateField("address", e.target.value)}
                                            className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-white"
                                            placeholder={t("municipal.settings.address_placeholder", "Rua/Praça, Nº")}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">{t("municipal.settings.mission_directive", "Diretriz de Missão")}</label>
                                    <textarea 
                                        rows={4}
                                        value={settings.mission || ""}
                                        onChange={e => updateField("mission", e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-[32px] p-6 text-white text-sm font-medium focus:outline-none focus:border-emerald-500/50 transition-all resize-none placeholder:text-slate-700"
                                        placeholder={t("municipal.settings.mission_placeholder", "Descreva o propósito da instituição para os cidadãos...")}
                                    />
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">{t("municipal.settings.cnpj", "CNPJ")}</label>
                                        <Input value={settings.cnpj || ""} onChange={e => updateField("cnpj", e.target.value)} className="h-12 bg-white/5 border-white/5 rounded-xl px-4 text-xs" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">{t("municipal.settings.nature", "Natureza")}</label>
                                        <Input value={settings.legalNature || ""} onChange={e => updateField("legalNature", e.target.value)} className="h-12 bg-white/5 border-white/5 rounded-xl px-4 text-xs" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">{t("municipal.settings.typology", "Tipologia")}</label>
                                        <Input value={settings.typology || ""} onChange={e => updateField("typology", e.target.value)} className="h-12 bg-white/5 border-white/5 rounded-xl px-4 text-xs" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">{t("municipal.settings.foundation_year", "Fundação (Ano)")}</label>
                                        <Input type="number" value={settings.foundationYear || ""} onChange={e => updateField("foundationYear", e.target.value)} className="h-12 bg-white/5 border-white/5 rounded-xl px-4 text-xs" />
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {activeSection === 'channels' && (
                        <motion.div
                            key="channels"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <Card className="p-10 bg-white/[0.02] border-white/5 rounded-[48px] space-y-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center">
                                        <Globe size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white tracking-tighter">{t("municipal.settings.service_channels", "Canais de Atendimento")}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{t("municipal.settings.contact_point", "Ponto de contato com o cidadão")}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">{t("municipal.settings.official_email", "Email Oficial")}</label>
                                        <Input value={settings.email || ""} onChange={e => updateField("email", e.target.value)} className="h-14 bg-white/5 border-white/5 rounded-2xl px-6"  />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">{t("municipal.settings.whatsapp_gov", "WhatsApp Gov")}</label>
                                        <Input value={settings.whatsapp || ""} onChange={e => updateField("whatsapp", e.target.value)} className="h-14 bg-white/5 border-white/5 rounded-2xl px-6"  />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">{t("municipal.settings.transparency_portal", "Portal Transparência")}</label>
                                        <Input value={settings.website || ""} onChange={e => updateField("website", e.target.value)} className="h-14 bg-white/5 border-white/5 rounded-2xl px-6"  />
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-10 bg-emerald-600/[0.02] border-emerald-500/10 rounded-[40px] flex flex-col md:flex-row items-center gap-8 shadow-2xl">
                                <div className="w-16 h-16 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-400 shrink-0">
                                    <Smartphone size={32} />
                                </div>
                                <div className="flex-1 space-y-1 text-center md:text-left">
                                    <h3 className="text-lg font-black text-white">{t("municipal.settings.inspection_app", "App de Fiscalização")}</h3>
                                    <p className="text-xs text-slate-500 font-medium">{t("municipal.settings.inspection_app_desc", "Os canais acima serão automaticamente sincronizados com o aplicativo móvel de fiscalização municipal.")}</p>
                                </div>
                                <Button variant="glass" className="h-12 px-6 rounded-xl border-emerald-500/20 text-emerald-400 font-black text-[10px] uppercase tracking-widest">
                                    {t("municipal.settings.configure_push", "Configurar Push")}
                                </Button>
                            </Card>
                        </motion.div>
                    )}

                    {activeSection === 'branding' && (
                        <motion.div
                            key="branding"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <Card className="p-10 bg-white/[0.02] border-white/5 rounded-[48px] space-y-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center">
                                        <Palette size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white tracking-tighter">{t("municipal.settings.whitelabel_design", "White-Label & Design")}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{t("municipal.settings.personalize_interface", "Personalização da interface municipal")}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-4">{t("municipal.settings.accent_color", "Cor de Acento do Portal")}</label>
                                        <div className="flex items-center gap-6 bg-white/[0.03] p-6 rounded-[32px] border border-white/5 group">
                                            <div className="relative">
                                                <input 
                                                    type="color" 
                                                    value={settings.primaryColor || "#10b981"} 
                                                    onChange={e => updateField("primaryColor", e.target.value)} 
                                                    className="h-20 w-20 bg-transparent cursor-pointer border-none rounded-2xl overflow-hidden" 
                                                />
                                                <div className="absolute inset-0 pointer-events-none border-4 border-white/10 rounded-2xl" />
                                            </div>
                                            <div>
                                                <span className="block text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">{settings.primaryColor || "#10b981"}</span>
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{t("municipal.settings.hex_code", "Código Hexadecimal")}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-8 bg-white/[0.01] border border-white/5 rounded-[32px] flex flex-col justify-center space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Zap size={20} className="text-amber-400" />
                                            <h4 className="text-sm font-black text-white">{t("municipal.settings.dynamic_preview", "Preview Dinâmico")}</h4>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed font-medium">{t("municipal.settings.dynamic_preview_desc", "A cor selecionada será aplicada em botões, links e indicadores de destaque em todo o portal do cidadão vinculado a esta secretaria.")}</p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {activeSection === 'financeiro' && (
                        <motion.div
                            key="financeiro"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <Card className="p-10 bg-white/[0.02] border-white/5 rounded-[48px] space-y-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center">
                                        <CreditCard size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white tracking-tighter">{t("municipal.settings.payment_gateway", "Gateway de Pagamentos")}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{t("municipal.settings.bank_account_desc", "Cadastre sua conta bancária para receber taxas e repasses")}</p>
                                    </div>
                                </div>

                                <div className="p-8 bg-gradient-to-br from-emerald-600/10 to-transparent rounded-[32px] border border-emerald-500/20 space-y-6">
                                    <div className="flex items-start gap-4">
                                        <ShieldCheck className="text-emerald-400 mt-1" size={24} />
                                        <div>
                                            <h4 className="text-white font-bold">{t("municipal.settings.stripe_connect", "Stripe Connect")}</h4>
                                            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                                                {t("municipal.settings.stripe_connect_desc", "Conecte a conta bancária da Secretaria para receber automaticamente as taxas de serviço, repasses de ingressos e doações de todos os museus vinculados.")}
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
                                                <Badge className="bg-green-500/10 text-green-400 border-green-500/20">{t("municipal.settings.operational", "OPERACIONAL")}</Badge>
                                                <div className="pt-4">
                                                    <Button variant="glass" className="rounded-xl border-white/5">{t("municipal.settings.access_stripe", "Acessar Dashboard Stripe")}</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center space-y-4 max-w-xs">
                                                <CreditCard className="text-slate-700 mx-auto" size={48} />
                                                <p className="text-sm text-slate-400">{t("municipal.settings.connect_bank", "Conecte sua conta bancária para começar a receber as taxas e repasses do sistema.")}</p>
                                                <Button 
                                                    className="w-full bg-emerald-600 text-white font-black rounded-xl h-12"
                                                    onClick={async () => {
                                                        try {
                                                            const { data } = await api.get('/stripe/onboarding-link?type=MUNICIPAL');
                                                            if (data && data.url) window.location.href = data.url;
                                                        } catch (err) {
                                                            toast.error(t("municipal.settings.stripe_error", "Erro ao gerar link do Stripe"));
                                                        }
                                                    }}
                                                >
                                                    {t("municipal.settings.connect_now", "CONECTAR AGORA")}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Save Button Overlay (Sticky if needed, but fixed at bottom for now) */}
                <div className="flex justify-end pt-8">
                    <Button 
                        onClick={handleSave}
                        isLoading={saving}
                        className="h-16 px-12 rounded-[24px] bg-emerald-600 text-white font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-emerald-600/20 hover:scale-105 transition-all"
                        leftIcon={<Save size={20} />}
                    >
                        {t("municipal.settings.save_parameters", "Salvar Parâmetros")}
                    </Button>
                </div>
            </div>
        </AnimateIn>
    );
};
