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
    Smartphone
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
    const [activeSection, setActiveSection] = useState<'identity' | 'channels' | 'branding'>('identity');

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/tenants/${tenantId}/settings`);
            setSettings(res.data || {});
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar preferências.");
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
            toast.success("Parâmetros salvos com sucesso!");
        } catch (error) {
            toast.error("Erro ao salvar alterações.");
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
            <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">Configurando Terminal...</p>
        </div>
    );

    const sections = [
        { id: 'identity', label: 'Identidade', icon: <Building2 size={16} /> },
        { id: 'channels', label: 'Canais Digitais', icon: <Globe size={16} /> },
        { id: 'branding', label: 'White-Label', icon: <Palette size={16} /> },
    ];

    return (
        <AnimateIn className="space-y-12 pb-32 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                            Parâmetros <span className="text-emerald-500">Estratégicos</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 font-medium text-lg">Definições globais de identidade, governança e experiência do cidadão.</p>
                </div>
                <Badge variant="glass" className="h-10 px-4 rounded-xl border-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    <ShieldCheck size={14} className="mr-2 text-emerald-500" />
                    Ambiente Autenticado
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
                                        <h3 className="text-xl font-black text-white tracking-tighter">Identidade Institucional</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Dados vitais da jurisdição municipal</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Entidade Gestora</label>
                                        <Input 
                                            value={settings.name || ""}
                                            onChange={e => updateField("name", e.target.value)}
                                            className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-white"
                                            placeholder="Ex: Secretaria de Cultura"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Endereço Sede</label>
                                        <Input 
                                            value={settings.address || ""}
                                            onChange={e => updateField("address", e.target.value)}
                                            className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-white"
                                            placeholder="Rua/Praça, Nº"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Diretriz de Missão</label>
                                    <textarea 
                                        rows={4}
                                        value={settings.mission || ""}
                                        onChange={e => updateField("mission", e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-[32px] p-6 text-white text-sm font-medium focus:outline-none focus:border-emerald-500/50 transition-all resize-none placeholder:text-slate-700"
                                        placeholder="Descreva o propósito da instituição para os cidadãos..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">CNPJ</label>
                                        <Input value={settings.cnpj || ""} onChange={e => updateField("cnpj", e.target.value)} className="h-12 bg-white/5 border-white/5 rounded-xl px-4 text-xs" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Natureza</label>
                                        <Input value={settings.legalNature || ""} onChange={e => updateField("legalNature", e.target.value)} className="h-12 bg-white/5 border-white/5 rounded-xl px-4 text-xs" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Tipologia</label>
                                        <Input value={settings.typology || ""} onChange={e => updateField("typology", e.target.value)} className="h-12 bg-white/5 border-white/5 rounded-xl px-4 text-xs" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Fundação (Ano)</label>
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
                                        <h3 className="text-xl font-black text-white tracking-tighter">Canais de Atendimento</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Ponto de contato com o cidadão</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Email Oficial</label>
                                        <Input value={settings.email || ""} onChange={e => updateField("email", e.target.value)} className="h-14 bg-white/5 border-white/5 rounded-2xl px-6" icon={<Mail size={16} />} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">WhatsApp Gov</label>
                                        <Input value={settings.whatsapp || ""} onChange={e => updateField("whatsapp", e.target.value)} className="h-14 bg-white/5 border-white/5 rounded-2xl px-6" icon={<Phone size={16} />} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Portal Transparência</label>
                                        <Input value={settings.website || ""} onChange={e => updateField("website", e.target.value)} className="h-14 bg-white/5 border-white/5 rounded-2xl px-6" icon={<Globe size={16} />} />
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-10 bg-emerald-600/[0.02] border-emerald-500/10 rounded-[40px] flex flex-col md:flex-row items-center gap-8 shadow-2xl">
                                <div className="w-16 h-16 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-400 shrink-0">
                                    <Smartphone size={32} />
                                </div>
                                <div className="flex-1 space-y-1 text-center md:text-left">
                                    <h3 className="text-lg font-black text-white">App de Fiscalização</h3>
                                    <p className="text-xs text-slate-500 font-medium">Os canais acima serão automaticamente sincronizados com o aplicativo móvel de fiscalização municipal.</p>
                                </div>
                                <Button variant="glass" className="h-12 px-6 rounded-xl border-emerald-500/20 text-emerald-400 font-black text-[10px] uppercase tracking-widest">
                                    Configurar Push
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
                                        <h3 className="text-xl font-black text-white tracking-tighter">White-Label & Design</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Personalização da interface municipal</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-4">Cor de Acento do Portal</label>
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
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Código Hexadecimal</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-8 bg-white/[0.01] border border-white/5 rounded-[32px] flex flex-col justify-center space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Zap size={20} className="text-amber-400" />
                                            <h4 className="text-sm font-black text-white">Preview Dinâmico</h4>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed font-medium">A cor selecionada será aplicada em botões, links e indicadores de destaque em todo o portal do cidadão vinculado a esta secretaria.</p>
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
                        Salvar Parâmetros
                    </Button>
                </div>
            </div>
        </AnimateIn>
    );
};
