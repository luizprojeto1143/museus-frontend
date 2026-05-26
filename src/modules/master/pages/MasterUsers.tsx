import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { 
    Users, 
    Edit, 
    ShieldCheck, 
    Database, 
    PlusCircle, 
    Search, 
    Terminal, 
    Fingerprint, 
    ShieldAlert, 
    MapPin, 
    Mail, 
    UserPlus,
    Activity,
    Lock,
    SearchCheck,
    Cpu,
    Zap,
    Shield,
    Globe,
    FileText,
    Key,
    UserCheck,
    UserX,
    Filter,
    RefreshCw,
    ExternalLink,
    Crown,
} from "lucide-react";
import { 
    Button, 
    Card, 
    Badge, 
    AnimateIn,
    AnimatedCounter
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

type UserItem = {
    id: string;
    name: string;
    email: string;
    role: string;
    active?: boolean;
    termsAcceptedAt?: string;
    termsAcceptedIp?: string;
    tenant?: {
        name: string;
    };
};

export const MasterUsers: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get("/users");
            setUsers(res.data || []);
        } catch (error) {
            toast.error("Erro ao sincronizar identidades globais.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const filteredUsers = useMemo(() => {
        return users.filter(u => 
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.tenant?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    if (loading && users.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(99,102,241,0.4)]" />
            <p className="text-slate-500 font-black animate-pulse uppercase tracking-[0.3em] text-[10px] italic">Auditando Identidades Globais...</p>
        </div>
    );

    return (
        <AnimateIn className="space-y-12 pb-32">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-indigo-600/10 text-indigo-400 border-none px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.4em] italic">
                            IAM Protocol & Sovereign Agent Directory
                        </Badge>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic leading-none">
                        Gestão de <span className="text-indigo-600">Agentes</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-xl max-w-3xl leading-relaxed">
                        Supervisão centralizada de autoridades, níveis de acesso e auditoria forense de termos legais em toda a malha federada.
                    </p>
                </div>
                
                <div className="flex items-center gap-6">
                    <Button 
                        onClick={() => navigate("/master/users/novo")}
                        className="h-20 px-12 rounded-[32px] bg-indigo-600 text-white font-black uppercase text-xs tracking-[0.3em] hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 active:scale-95 flex items-center gap-4 group"
                    >
                        <UserPlus size={24} className="group-hover:scale-110 transition-transform" /> Registrar Autoridade
                    </Button>
                </div>
            </div>

            {/* Tactical Intelligence Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                <Card className="lg:col-span-3 p-3 bg-[#0b1120]/60 border-2 border-white/5 rounded-[40px] flex items-center gap-6 shadow-2xl border-t-white/10">
                    <div className="relative group flex-1 ml-4">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-all duration-500" size={24} />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Filtrar por nome, email ou node institucional..."
                            className="w-full bg-white/5 border-2 border-transparent rounded-[28px] py-6 pl-18 pr-8 text-sm text-white focus:outline-none focus:border-indigo-500/30 focus:bg-white/[0.08] transition-all placeholder:text-slate-700 font-black italic tracking-tight"
                        />
                    </div>
                    <div className="h-12 w-px bg-white/5 mx-2" />
                    <button onClick={loadUsers} className="w-16 h-16 rounded-[22px] bg-white/5 text-slate-500 hover:text-white transition-all flex items-center justify-center group/refresh">
                        <RefreshCw size={24} className={`group-hover/refresh:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </Card>
                
                <Card className="p-10 bg-indigo-600/5 border-2 border-indigo-500/20 rounded-[40px] flex items-center justify-between group shadow-2xl border-t-white/10 relative overflow-hidden">
                    <div className="space-y-1 relative z-10">
                        <p className="text-[11px] font-black text-indigo-400/50 uppercase tracking-[0.3em] italic leading-none mb-1">Agentes Ativos</p>
                        <p className="text-4xl font-black text-white tracking-tighter italic leading-none">
                            <AnimatedCounter value={users.length} />
                        </p>
                    </div>
                    <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform duration-500 border border-indigo-500/20 shadow-xl relative z-10">
                        <Users size={32} />
                    </div>
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-600/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-indigo-600/10 transition-all" />
                </Card>
            </div>

            {/* Sovereign Identity Matrix - High-Fidelity Table */}
            <Card className="p-0 bg-[#0b1120]/60 border-2 border-white/5 rounded-[64px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.8)] border-t-white/10 relative">
                <div className="p-14 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-10 bg-white/[0.02] relative">
                    <div className="flex items-center gap-8 relative z-10">
                        <div className="w-20 h-20 rounded-[28px] bg-indigo-600/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 shadow-xl group-hover:scale-110 transition-transform">
                            <Lock size={40} />
                        </div>
                        <div>
                            <h3 className="text-4xl font-black text-white tracking-tighter italic uppercase leading-none">Diretório de Agentes</h3>
                            <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] italic mt-3">Rastro de Auditoria e Níveis de Autoridade</p>
                        </div>
                    </div>
                    <Badge variant="glass" className="bg-indigo-500/10 text-indigo-400 border-none px-10 py-5 text-[11px] font-black uppercase tracking-[0.3em] italic rounded-2xl flex items-center gap-4 shadow-xl border border-indigo-500/20">
                        <UserCheck size={20} className="text-indigo-400" /> Access Sovereignty: Verified
                    </Badge>
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02]">
                                <th className="px-14 py-10 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Agente Autoridade</th>
                                <th className="px-14 py-10 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Vinculação de Node</th>
                                <th className="px-14 py-10 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Nível de Acesso</th>
                                <th className="px-14 py-10 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Digital Print (Forense)</th>
                                <th className="px-14 py-10 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] italic text-right">Ações de Comando</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence mode="popLayout">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-14 py-32 text-center opacity-30">
                                            <div className="flex flex-col items-center gap-10">
                                                <div className="w-24 h-24 rounded-[40px] bg-white/5 flex items-center justify-center border-2 border-white/5">
                                                    <SearchCheck size={64} className="text-slate-700" />
                                                </div>
                                                <p className="text-2xl font-black uppercase tracking-[0.4em] text-slate-500 italic leading-none">Nenhum agente localizado</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((u, idx) => (
                                        <motion.tr 
                                            key={u.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: idx * 0.05, ease: "circOut" }}
                                            className="group hover:bg-white/[0.03] transition-all duration-500 cursor-default"
                                        >
                                            <td className="px-14 py-12">
                                                <div className="flex items-center gap-8">
                                                    <div className="w-20 h-20 rounded-[28px] bg-gradient-to-tr from-slate-900 to-indigo-950 border-2 border-white/10 flex items-center justify-center overflow-hidden relative shadow-2xl group-hover:border-indigo-500/30 transition-all">
                                                        <div className={`absolute inset-0 bg-[url('https://api.dicebear.com/7.x/initials/svg?seed=${u.name}')] bg-cover opacity-60 group-hover:scale-110 transition-transform duration-1000`} />
                                                        <div className="absolute inset-0 bg-indigo-600/5 group-hover:opacity-0 transition-opacity" />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <span className="text-white font-black text-2xl tracking-tighter italic group-hover:text-indigo-400 transition-colors leading-none uppercase">{u.name}</span>
                                                        <div className="flex items-center gap-3">
                                                            <Mail size={14} className="text-indigo-500/50" />
                                                            <span className="text-slate-600 text-[11px] font-bold lowercase tracking-widest italic leading-none">{u.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-14 py-12">
                                                {u.tenant ? (
                                                    <div className="flex items-center gap-4 group-hover:translate-x-1 transition-transform">
                                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-indigo-500/40 border border-white/5 group-hover:border-indigo-500/30 transition-all">
                                                            <MapPin size={20} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-white font-black text-xs uppercase italic tracking-widest leading-none">{u.tenant.name}</span>
                                                            <span className="text-[8px] text-slate-700 font-bold uppercase mt-1">Institutional_Node</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <Badge variant="glass" className="bg-amber-500/10 text-amber-500 border-none px-6 py-2 text-[10px] font-black uppercase tracking-[0.3em] italic rounded-xl shadow-xl border border-amber-500/20">
                                                        <Crown size={14} className="mr-3" /> Master Central
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-14 py-12">
                                                <Badge variant="glass" className={`px-6 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-[0.3em] border-none flex items-center gap-4 w-fit shadow-2xl italic ${
                                                    u.role === 'MASTER' 
                                                    ? 'bg-amber-500/10 text-amber-500' 
                                                    : 'bg-indigo-600/10 text-indigo-400'
                                                }`}>
                                                    {u.role === 'MASTER' ? <ShieldCheck size={16} /> : <Key size={16} />}
                                                    {u.role}
                                                </Badge>
                                            </td>
                                            <td className="px-14 py-12">
                                                <div className="flex flex-col gap-3 font-mono">
                                                    <div className="flex items-center gap-4 text-[12px] text-slate-500 group-hover:text-white transition-colors">
                                                        <Fingerprint size={16} className="text-indigo-500/40" />
                                                        <span className="tracking-widest italic">{u.termsAcceptedIp || "0.0.0.0"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-[9px] text-slate-700 font-bold uppercase tracking-widest">
                                                        <Activity size={14} className="opacity-40" />
                                                        {u.termsAcceptedAt ? new Date(u.termsAcceptedAt).toLocaleString('pt-BR') : "NO_RECORD_FOUND"}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-14 py-12 text-right">
                                                <div className="flex gap-4 justify-end items-center">
                                                    <button
                                                        onClick={() => navigate(`/master/users/${u.id}`)}
                                                        className="w-14 h-14 rounded-2xl bg-white/5 text-slate-500 border-2 border-white/5 hover:bg-indigo-600 hover:text-white transition-all shadow-2xl active:scale-95 group/btn"
                                                        title="Editar Credenciais"
                                                    >
                                                        <Edit size={24} className="group-hover/btn:scale-110 group-hover/btn:rotate-12 transition-transform" />
                                                    </button>
                                                    <button className="w-14 h-14 rounded-2xl bg-white/5 text-slate-500 border-2 border-white/5 hover:bg-white hover:text-black transition-all shadow-2xl active:scale-95 group/btn">
                                                        <ExternalLink size={24} className="group-hover/btn:scale-110" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Identity SOC Footer */}
            <div className="bg-[#0f172a]/80 p-14 rounded-[64px] border-2 border-indigo-500/10 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group shadow-2xl border-t-white/10">
                <div className="flex items-center gap-10 relative z-10">
                    <div className="w-24 h-24 bg-indigo-600/10 rounded-[32px] flex items-center justify-center text-indigo-500 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 border border-indigo-500/20 shadow-2xl relative overflow-hidden">
                        <Terminal size={48} />
                        <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/10 to-transparent" />
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-white font-black text-3xl italic tracking-tighter uppercase italic leading-none">Soberania de Identidade Global</h4>
                        <p className="text-sm text-slate-500 font-medium max-w-2xl leading-relaxed italic mt-2">
                            A governança de agentes assegura a integridade operacional de toda a rede MSV. Cada acesso ao nível Master é logado em tempo real com hash de autenticação e geolocalização do endpoint de origem.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-6 relative z-10">
                    <Badge variant="glass" className="bg-indigo-500/10 text-indigo-400 border-none px-12 py-6 text-[12px] font-black uppercase tracking-[0.4em] italic rounded-[24px] flex items-center gap-4 shadow-2xl border border-indigo-500/20">
                        <ShieldAlert size={24} /> Audit Status: Sovereign Secure
                    </Badge>
                </div>
                <div className="absolute top-[-50%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[200px] pointer-events-none" />
                <div className="absolute left-[-5%] bottom-[-10%] w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </AnimateIn>
    );
};
