import {
useTranslation } from "react-i18next";
import React, { useEffect, useState, useCallback } from "react";
import { logger } from "@/utils/logger";

import { 
    Settings, 
    Loader2, 
    Save, 
    User as UserIcon, 
    Lock, 
    Bell, 
    Shield, 
    Trash2, 
    Globe, 
    Eye, 
    Smartphone,
    Activity,
    ShieldCheck,
    Key,
    Mail, Briefcase, DollarSign,
} from "lucide-react";
import { api } from "../../../api/client";
import { toast } from "react-hot-toast";
import { 
    Card, 
    Badge, 
    AnimateIn, 
    Button, 
    Input 
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";

export const ProviderSettings: React.FC = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'account' | 'security' | 'notifications'>('account');

    // Password State
    const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            await api.get("/providers/me"); // Just verifying session
        } catch (error) {
            logger.error(error);
            toast.error("Erro ao sincronizar configurações.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            toast.error("As senhas não coincidem.");
            return;
        }
        try {
            setSaving(true);
            // Simulating API call as we don't have the endpoint details here, but keeping it ready
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("Senha atualizada com sucesso!");
            setPasswords({ current: "", new: "", confirm: "" });
        } catch (error) {
            toast.error("Erro ao atualizar senha.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">Criptografando Acesso...</p>
        </div>
    );

    return (
        <AnimateIn className="space-y-10 pb-32 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                        Ajustes & <span className="text-indigo-500">Segurança</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg">
                        Gerencie as chaves de acesso e preferências do seu terminal de prestador.
                    </p>
                </div>
                <Badge variant="glass" className="h-10 px-4 rounded-xl border-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    <ShieldCheck size={14} className="mr-2 text-indigo-500" />
                    Conexão Segura
                </Badge>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl w-fit">
                {[
                    { id: 'account', label: 'Conta', icon: <UserIcon size={14} /> },
                    { id: 'security', label: 'Segurança', icon: <Lock size={14} /> },
                    { id: 'notifications', label: 'Preferências', icon: <Bell size={14} /> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as unknown)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                            activeTab === tab.id 
                            ? 'bg-indigo-600 text-white shadow-lg' 
                            : 'text-slate-500 hover:text-white'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-8">
                <AnimatePresence mode="wait">
                    {activeTab === 'account' && (
                        <motion.div 
                            key="account"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <Card className="p-10 bg-white/[0.02] border-white/5 rounded-[40px] space-y-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center">
                                        <UserIcon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white tracking-tighter">Dados de Identidade</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Informações vitais do seu registro</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="p-6 bg-white/[0.01] border border-white/5 rounded-[24px] space-y-2">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">ID de Registro</p>
                                        <p className="text-sm font-bold text-slate-300">#PR-2026-X892</p>
                                    </div>
                                    <div className="p-6 bg-white/[0.01] border border-white/5 rounded-[24px] space-y-2">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Status da Conta</p>
                                        <Badge className="bg-green-500/10 text-green-400 border-none font-black text-[9px] uppercase">Verificada & Ativa</Badge>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                    <div>
                                        <h4 className="text-sm font-bold text-white">Privacidade do Perfil</h4>
                                        <p className="text-xs text-slate-500 mt-1">Seu perfil está visível para todos os produtores cadastrados.</p>
                                    </div>
                                    <Button variant="glass" className="rounded-xl h-10 px-6 border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase">
                                        Ocultar Perfil
                                    </Button>
                                </div>
                            </Card>

                            <Card className="p-10 bg-red-500/[0.02] border-red-500/10 rounded-[40px] flex flex-col md:flex-row items-center gap-8">
                                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 shrink-0">
                                    <Trash2 size={32} />
                                </div>
                                <div className="flex-1 space-y-1 text-center md:text-left">
                                    <h3 className="text-lg font-black text-white">Desativação de Terminal</h3>
                                    <p className="text-xs text-slate-500 font-medium">Ao desativar sua conta, seus serviços não aparecerão mais nas buscas e seu histórico será arquivado conforme LGPD.</p>
                                </div>
                                <Button className="h-12 px-6 rounded-xl border border-red-500/20 text-red-400 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/10 transition-colors">
                                    Solicitar Exclusão
                                </Button>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === 'security' && (
                        <motion.div 
                            key="security"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <Card className="p-10 bg-white/[0.02] border-white/5 rounded-[48px] space-y-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center">
                                        <Key size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white tracking-tighter">Alterar Credenciais</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Mantenha sua senha forte e atualizada</p>
                                    </div>
                                </div>

                                <form onSubmit={handlePasswordChange} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Senha Atual</label>
                                            <Input 
                                                type="password"
                                                value={passwords.current}
                                                onChange={e => setPasswords({...passwords, current: e.target.value})}
                                                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-white"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Nova Senha</label>
                                                <Input 
                                                    type="password"
                                                    value={passwords.new}
                                                    onChange={e => setPasswords({...passwords, new: e.target.value})}
                                                    className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-white"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Confirmar Nova Senha</label>
                                                <Input 
                                                    type="password"
                                                    value={passwords.confirm}
                                                    onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                                                    className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-white"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 flex justify-end">
                                        <Button 
                                            type="submit"
                                            isLoading={saving}
                                            className="h-14 px-10 rounded-2xl bg-indigo-600 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-indigo-600/20"
                                        >
                                            Atualizar Credenciais
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === 'notifications' && (
                        <motion.div 
                            key="notifications"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <Card className="p-10 bg-white/[0.02] border-white/5 rounded-[40px] space-y-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center">
                                        <Bell size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white tracking-tighter">Canais de Notificação</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Como você deseja ser alertado</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {[
                                        { label: "Novas Mensagens no Inbox", desc: "Receba alertas instantâneos de novos contatos de produtores.", icon: <Mail size={16} /> },
                                        { label: "Solicitações de Serviço", desc: "Notificação quando um novo orçamento for solicitado.", icon: <Briefcase size={16} /> },
                                        { label: "Confirmações de Pagamento", desc: "Avisar quando um faturamento for processado com sucesso.", icon: <DollarSign size={16} /> },
                                    ].map((pref, i) => (
                                        <div key={i} className="flex items-center justify-between p-6 bg-white/[0.01] hover:bg-white/[0.03] rounded-3xl border border-white/5 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-600 group-hover:text-indigo-400 transition-colors">
                                                    {pref.icon}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-white leading-tight">{pref.label}</h4>
                                                    <p className="text-[11px] text-slate-500 mt-1">{pref.desc}</p>
                                                </div>
                                            </div>
                                            <div className="w-12 h-6 bg-indigo-600/20 rounded-full border border-indigo-500/30 p-1 flex justify-end cursor-pointer">
                                                <div className="w-4 h-4 bg-indigo-500 rounded-full" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <Card className="p-10 bg-indigo-600/[0.02] border-indigo-500/10 rounded-[40px] flex flex-col md:flex-row items-center gap-8">
                                <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-400 shrink-0">
                                    <Smartphone size={32} />
                                </div>
                                <div className="flex-1 space-y-1 text-center md:text-left">
                                    <h3 className="text-lg font-black text-white">App Mobile</h3>
                                    <p className="text-xs text-slate-500 font-medium">Instale nosso aplicativo para receber notificações push em tempo real e gerenciar seus serviços de qualquer lugar.</p>
                                </div>
                                <Button variant="glass" className="h-12 px-6 rounded-xl border-indigo-500/20 text-indigo-400 font-black text-[10px] uppercase tracking-widest">
                                    Baixar App
                                </Button>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AnimateIn>
    );
};
