import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, isDemoMode } from "../../../api/client";
import { 
    PlusCircle, 
    Trash2, 
    Edit, 
    Building2, 
    Search, 
    ChevronRight, 
    Database, 
    ShieldAlert, 
    Activity, 
    Calendar,
    Globe,
    ExternalLink,
    Zap,
    Filter,
    Layers,
    MapPin,
    ArrowUpRight,
    Server,
    ShieldCheck,
    Terminal,
    Settings2
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

type TenantItem = {
    id: string;
    name: string;
    slug: string;
    createdAt?: string;
    type?: string;
    plan?: string;
};

export const TenantsList: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [tenants, setTenants] = useState<TenantItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get("/tenants");
            const data = Array.isArray(res.data) ? res.data : [];
            setTenants(data);
        } catch (err: any) {
            toast.error("Erro na sincronização de instâncias.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredTenants = useMemo(() => {
        return tenants.filter(t => 
            t.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
            t.slug.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
    }, [tenants, debouncedSearchTerm]);

    const handleDelete = async (id: string) => {
        const tenant = tenants.find(t => t.id === id);
        if (!tenant) return;
        if (!window.confirm(`PROTOCOL DE SEGURANÇA: Tem certeza que deseja eliminar a instância "${tenant.name}"? Esta ação é IRREVERSÍVEL.`)) return;

        try {
            await api.delete(`/tenants/${id}?hard=true&confirm=${tenant.slug}`);
            setTenants(prev => prev.filter(x => x.id !== id));
            toast.success(`Instância ${tenant.slug} eliminada.`);
        } catch (err: any) {
            toast.error("Falha no protocolo de exclusão.");
        }
    };

    const handleCleanDemo = async () => {
        if (!window.confirm("MANUTENÇÃO: Deseja purgar todas as instâncias de demonstração?")) return;
        try {
            await api.delete("/tenants/utils/demo");
            fetchData();
            toast.success("Ambiente demo purgado.");
        } catch (err: any) {
            toast.error("Falha na limpeza de infraestrutura.");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">Mapeando Infraestrutura Global...</p>
        </div>
    );

    return (
        <AnimateIn className="space-y-12 pb-32">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-blue-600/10 text-blue-400 border-none px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.3em] italic">
                            Network Registry & Global Nodes
                        </Badge>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic leading-none">
                        Rede de <span className="text-blue-600">Nodos</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-xl max-w-3xl leading-relaxed">
                        Diretório centralizado de instâncias municipais, órgãos culturais e museus homologados na rede global.
                    </p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                    <Button 
                        variant="glass"
                        onClick={handleCleanDemo}
                        className="h-16 px-8 rounded-2xl border-white/5 text-rose-500 font-black uppercase text-[10px] tracking-widest hover:bg-rose-500/10 transition-all active:scale-95 shadow-xl"
                    >
                        <Database size={18} className="mr-3" /> Purgar Demos
                    </Button>
                    <Button 
                        onClick={() => navigate("/master/tenants/novo")}
                        className="h-16 px-10 rounded-2xl bg-blue-600 text-white font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/20 active:scale-95"
                    >
                        <PlusCircle size={20} className="mr-3" /> Implantar Node
                    </Button>
                </div>
            </div>

            {/* Matrix & Stats Header */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <Card className="lg:col-span-3 p-8 bg-white/[0.02] border-white/5 rounded-[40px] flex items-center gap-8 shadow-2xl">
                    <div className="relative group flex-1">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Buscar por nome de cidade, slug ou identificador de node..."
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-16 pr-6 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700 font-medium"
                        />
                    </div>
                    <div className="hidden md:flex gap-3">
                        <Button variant="glass" className="h-14 px-6 rounded-2xl border-white/5 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-white/10">
                            <Filter size={16} className="mr-2" /> Filtros
                        </Button>
                    </div>
                </Card>
                <Card className="p-8 bg-blue-600/5 border-blue-500/10 rounded-[40px] flex flex-col justify-center gap-2 group relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Nodos Ativos</p>
                        <Globe size={24} className="text-blue-500/30 group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-4xl font-black text-white tracking-tighter italic leading-none">
                        <AnimatedCounter value={tenants.length} />
                    </p>
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-600/5 rounded-full blur-2xl pointer-events-none" />
                </Card>
            </div>

            {/* Network Table */}
            <Card className="p-0 bg-white/[0.02] border-white/5 rounded-[48px] overflow-hidden shadow-2xl border-t-2 border-t-blue-500/20">
                <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-400 flex items-center justify-center">
                            <Server size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tighter italic uppercase">Registro Global de Instâncias</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">Audit Log: Master Clearance Level Required</p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.01]">
                                <th className="px-10 py-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Entidade / Node</th>
                                <th className="px-10 py-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Identificador (Slug)</th>
                                <th className="px-10 py-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Plano / Status</th>
                                <th className="px-10 py-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Data de Ativação</th>
                                <th className="px-10 py-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Controles Master</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence mode="popLayout">
                                {filteredTenants.map((tenant, idx) => (
                                    <motion.tr 
                                        key={tenant.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group hover:bg-white/[0.02] transition-colors"
                                    >
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-950 border border-white/10 flex items-center justify-center text-white/40 font-black text-xs group-hover:border-blue-500/30 group-hover:text-blue-400 transition-all shadow-xl">
                                                    {tenant.name.substring(0,2).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-white font-black text-sm tracking-tight group-hover:text-blue-400 transition-colors uppercase italic">{tenant.name}</span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <MapPin size={10} className="text-slate-600" />
                                                        <span className="text-slate-600 text-[9px] font-bold uppercase tracking-widest">{tenant.type || "Independent Node"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 font-mono">
                                            <div className="flex items-center gap-3">
                                                <span className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black text-blue-400 tracking-widest">
                                                    /{tenant.slug}
                                                </span>
                                                {tenant.slug.includes('demo') && (
                                                    <Badge className="bg-amber-500/10 text-amber-500 border-none text-[8px] font-black uppercase italic">Sandbox</Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="glass" className={`px-4 py-1.5 rounded-xl border-none text-[8px] font-black uppercase tracking-widest ${
                                                    tenant.plan === 'ENTERPRISE' ? 'bg-purple-600/10 text-purple-400' : 
                                                    tenant.plan === 'PRO' ? 'bg-blue-600/10 text-blue-400' : 
                                                    'bg-emerald-600/10 text-emerald-400'
                                                }`}>
                                                    <Zap size={10} className="mr-2" /> {tenant.plan || "BASIC"}
                                                </Badge>
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col">
                                                <span className="text-white font-black text-[11px] tracking-tight flex items-center gap-2">
                                                    <Calendar size={12} className="text-slate-600" />
                                                    {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString('pt-BR') : "Legado/01.01.2024"}
                                                </span>
                                                <span className="text-[9px] text-slate-700 font-bold uppercase tracking-widest ml-5">Registered</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-20 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => navigate(`/master/tenants/${tenant.id}`)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 border border-white/5 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all active:scale-95 shadow-lg"
                                                >
                                                    <Settings2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(tenant.id)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-rose-500/50 border border-white/5 hover:bg-rose-600 hover:text-white hover:border-rose-500 transition-all active:scale-95 shadow-lg"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {filteredTenants.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-10 py-32 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-30 gap-6">
                                            <div className="w-24 h-24 rounded-[40px] bg-white/5 flex items-center justify-center border border-white/5">
                                                <Layers size={48} className="text-slate-500" />
                                            </div>
                                            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Nenhuma instância detectada no diretório</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Governance Tech Footer */}
            <div className="bg-blue-600/5 p-12 rounded-[56px] border border-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden group">
                <div className="flex items-center gap-8 relative z-10">
                    <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center text-blue-500 group-hover:rotate-12 transition-transform duration-500">
                        <Terminal size={40} />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-white font-black text-2xl italic tracking-tight uppercase">Protocolo de Infraestrutura</h4>
                        <p className="text-sm text-slate-500 font-medium max-w-xl leading-relaxed italic">
                            O provisionamento de novos nodes injeta automaticamente os esquemas de banco de dados, políticas de segurança RBAC e endpoints de cache de borda.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-3 relative z-10">
                    <Badge variant="glass" className="bg-blue-500/10 text-blue-400 border-none px-8 py-4 text-[10px] font-black uppercase tracking-widest italic flex items-center gap-3">
                        <Activity size={16} /> Global Network Health: 100%
                    </Badge>
                </div>
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
            </div>
        </AnimateIn>
    );
};
