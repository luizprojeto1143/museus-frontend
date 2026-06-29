import { useTranslation } from "react-i18next";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    Clock, 
    User, 
    Database, 
    Filter, 
    ChevronDown, 
    ChevronRight, 
    Activity, 
    Search,
    ShieldAlert,
    Terminal,
    Fingerprint,
    Cpu,
    Globe,
    Zap,
    Lock,
    Eye,
    RefreshCw,
    X,
    ShieldCheck,
    Target,
    Navigation,
    Layers,
    Binary,
    Code,
    History
} from 'lucide-react';
import { api } from '../../../api/client';
import { 
    Button, 
    Card, 
    Badge, 
    AnimateIn,
    AnimatedCounter
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

interface AuditLogEntry {
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    userId: string | null;
    userEmail: string | null;
    tenantId: string;
    oldData: Record<string, unknown> | null;
    newData: Record<string, unknown> | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
}

export const MasterAuditLogs: React.FC = () => {
    const { t } = useTranslation();
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        entity: '',
        action: '',
        tenantId: ''
    });
    const [expandedLog, setExpandedLog] = useState<string | null>(null);
    const [total, setTotal] = useState(0);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.entity) params.append('entity', filters.entity);
            if (filters.action) params.append('action', filters.action);
            if (filters.tenantId) params.append('tenantId', filters.tenantId);
            params.append('limit', '100');

            const res = await api.get(`/audit-logs?${params}`);
            setLogs(res.data.logs || []);
            setTotal(res.data.total || 0);
        } catch (error: any) {
            toast.error("Falha na sincronização forense.");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const getActionBadge = (action: string) => {
        const baseClass = "border-none px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.2em] shadow-lg rounded-full";
        switch (action.toUpperCase()) {
            case 'CREATE': return <Badge className={`${baseClass} bg-emerald-500/10 text-emerald-500`}>FORGED</Badge>;
            case 'UPDATE': return <Badge className={`${baseClass} bg-blue-600/10 text-blue-400`}>REVISED</Badge>;
            case 'DELETE': return <Badge className={`${baseClass} bg-rose-500/10 text-rose-500`}>PURGED</Badge>;
            case 'LOGIN': return <Badge className={`${baseClass} bg-amber-500/10 text-amber-500 shadow-amber-500/10`}>ACCESS</Badge>;
            default: return <Badge className={`${baseClass} bg-slate-500/10 text-slate-500`}>SYSTEM</Badge>;
        }
    };

    return (
        <AnimateIn className="space-y-12 pb-32">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-blue-600/10 text-blue-400 border-none px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.3em] italic">
                            System Sovereignty & Forensic Audit
                        </Badge>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic leading-none">
                        Logs de <span className="text-blue-600">Auditoria</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-xl max-w-3xl leading-relaxed">
                        Terminal forense de alta precisão para monitoramento de ações críticas, integridade de dados e conformidade da rede global.
                    </p>
                </div>
                
                <Card className="p-8 bg-blue-600/5 border-blue-500/10 rounded-[40px] flex items-center gap-8 group min-w-[260px] shadow-2xl relative overflow-hidden">
                    <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 shadow-xl group-hover:scale-110 transition-transform">
                        <ShieldCheck size={32} />
                    </div>
                    <div className="space-y-1 relative z-10">
                        <p className="text-[10px] font-black text-blue-400/50 uppercase tracking-widest italic leading-none">Eventos Auditados</p>
                        <p className="text-4xl font-black text-white tracking-tighter italic leading-none">
                            <AnimatedCounter value={total} />
                        </p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-600/5 rounded-full blur-2xl pointer-events-none" />
                </Card>
            </div>

            {/* SOC Filter Terminal */}
            <Card className="p-10 bg-[#0b1120]/60 border-2 border-white/5 rounded-[56px] space-y-10 shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-5 text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] italic relative z-10">
                    <Binary size={18} className="animate-pulse" /> Security Operations Center Filters
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-6 italic">Entidade Alvo</label>
                        <select
                            value={filters.entity}
                            onChange={(e) => setFilters(f => ({ ...f, entity: e.target.value }))}
                            className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-8 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all appearance-none font-black uppercase tracking-widest shadow-inner"
                        >
                            <option value="" className="bg-slate-950">Todas Entidades</option>
                            <option value="Work" className="bg-slate-950">Acervo (Obras)</option>
                            <option value="Event" className="bg-slate-950">Eventos</option>
                            <option value="Visitor" className="bg-slate-950">Visitantes</option>
                            <option value="User" className="bg-slate-950">Usuários</option>
                            <option value="Tenant" className="bg-slate-950">Nodos (Tenants)</option>
                        </select>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-6 italic">Protocolo de Ação</label>
                        <select
                            value={filters.action}
                            onChange={(e) => setFilters(f => ({ ...f, action: e.target.value }))}
                            className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-8 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all appearance-none font-black uppercase tracking-widest shadow-inner"
                        >
                            <option value="" className="bg-slate-950">Todas Ações</option>
                            <option value="CREATE" className="bg-slate-950">FORGE (Create)</option>
                            <option value="UPDATE" className="bg-slate-950">REVISE (Update)</option>
                            <option value="DELETE" className="bg-slate-950">PURGE (Delete)</option>
                            <option value="LOGIN" className="bg-slate-950">ACCESS (Login)</option>
                        </select>
                    </div>

                    <div className="md:col-span-2 flex items-end gap-4">
                        <Button 
                            onClick={fetchLogs}
                            className="h-16 flex-1 rounded-2xl bg-blue-600 text-white font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-blue-600/20 hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center gap-4 group"
                        >
                            <RefreshCw size={18} className={`group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`} /> Sincronizar Forense
                        </Button>
                        <Button 
                            variant="glass"
                            onClick={() => setFilters({ entity: '', action: '', tenantId: '' })}
                            className="h-16 px-8 rounded-2xl border-white/5 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all shadow-xl"
                        >
                            <X size={18} />
                        </Button>
                    </div>
                </div>
                <div className="absolute top-[-50%] right-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />
            </Card>

            {/* Audit Feed Matrix */}
            <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                    {loading && logs.length === 0 ? (
                        [1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-28 bg-white/5 rounded-[40px] animate-pulse border border-white/5" />
                        ))
                    ) : logs.length === 0 ? (
                        <Card className="p-32 bg-white/[0.01] border-white/5 rounded-[64px] text-center flex flex-col items-center gap-8 opacity-30 shadow-inner">
                            <div className="w-24 h-24 rounded-[40px] bg-white/5 flex items-center justify-center border border-white/5">
                                <ShieldAlert size={64} className="text-slate-600" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-xl font-black text-slate-500 uppercase tracking-[0.3em] italic leading-none">Nenhum Registro Forense</p>
                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest italic">A rede global está em estado de silêncio operacional</p>
                            </div>
                        </Card>
                    ) : (
                        logs.map((log, idx) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: -20, y: 10 }}
                                animate={{ opacity: 1, x: 0, y: 0 }}
                                transition={{ delay: idx * 0.02, ease: "circOut" }}
                            >
                                <Card className={`bg-[#0b1120]/60 border-2 rounded-[32px] overflow-hidden group transition-all duration-500 hover:bg-white/[0.03] ${expandedLog === log.id ? 'border-blue-500/40 bg-white/[0.04] shadow-2xl' : 'border-white/5 shadow-xl'}`}>
                                    <div 
                                        className="p-8 flex items-center gap-10 cursor-pointer"
                                        onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                    >
                                        <div className="w-28 shrink-0 flex flex-col items-center gap-2">
                                            {getActionBadge(log.action)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-4">
                                                <span className="text-white font-black text-lg tracking-tighter uppercase italic group-hover:text-blue-400 transition-colors">{log.entity}</span>
                                                <Badge variant="glass" className="bg-white/5 border-white/10 text-slate-600 text-[8px] font-black uppercase tracking-widest px-3 py-1 font-mono">
                                                    ID: {log.id.slice(0, 12)}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-8 mt-2">
                                                <div className="flex items-center gap-2.5 text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">
                                                    <User size={14} className="text-blue-500/40" />
                                                    <span className="group-hover:text-slate-400 transition-colors">{log.userEmail || 'Kernel / System Core'}</span>
                                                </div>
                                                <div className="flex items-center gap-2.5 text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">
                                                    <Globe size={14} className="text-blue-500/40" />
                                                    <span className="group-hover:text-slate-400 transition-colors">{log.ipAddress || 'Internal Mesh'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="hidden lg:flex flex-col items-end gap-1.5 pr-6">
                                            <div className="flex items-center gap-2.5 text-[11px] text-white font-black uppercase tracking-tight italic">
                                                <Clock size={14} className="text-blue-500" />
                                                {new Date(log.createdAt).toLocaleTimeString('pt-BR')}
                                            </div>
                                            <div className="text-[9px] text-slate-600 font-black uppercase tracking-widest italic">
                                                {new Date(log.createdAt).toLocaleDateString('pt-BR')}
                                            </div>
                                        </div>

                                        <div className={`w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-slate-500 transition-all duration-500 border border-white/5 group-hover:border-blue-500/30 ${expandedLog === log.id ? 'rotate-180 bg-blue-600 text-white shadow-2xl' : ''}`}>
                                            <ChevronDown size={24} />
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {expandedLog === log.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.5, ease: "circOut" }}
                                                className="overflow-hidden border-t border-white/5"
                                            >
                                                <div className="p-12 bg-black/40 space-y-12 relative">
                                                    {/* Technical Metadata */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                                        <Card className="p-8 bg-white/[0.02] rounded-3xl border border-white/10 space-y-3 shadow-2xl">
                                                            <div className="flex items-center gap-2.5 text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] italic leading-none mb-2">
                                                                <Fingerprint size={16} /> User Agent Fingerprint
                                                            </div>
                                                            <p className="font-mono text-[10px] text-slate-500 break-all leading-relaxed bg-black/40 p-4 rounded-xl border border-white/5 italic">
                                                                {log.userAgent || "System/Core direct API protocol interaction."}
                                                            </p>
                                                        </Card>
                                                        <Card className="p-8 bg-white/[0.02] rounded-3xl border border-white/10 space-y-3 shadow-2xl">
                                                            <div className="flex items-center gap-2.5 text-[9px] font-black text-amber-500 uppercase tracking-[0.3em] italic leading-none mb-2">
                                                                <Target size={16} /> Entity Target Registry
                                                            </div>
                                                            <div className="font-mono text-[11px] text-white flex items-center gap-4 bg-black/40 p-5 rounded-xl border border-white/5 italic">
                                                                <Navigation size={14} className="text-amber-500" /> {log.entityId || "ROOT_NODE"}
                                                            </div>
                                                        </Card>
                                                        <Card className="p-8 bg-white/[0.02] rounded-3xl border border-white/10 space-y-3 shadow-2xl">
                                                            <div className="flex items-center gap-2.5 text-[9px] font-black text-purple-400 uppercase tracking-[0.3em] italic leading-none mb-2">
                                                                <Layers size={16} /> Tenant Namespace
                                                            </div>
                                                            <div className="font-mono text-[11px] text-white flex items-center gap-4 bg-black/40 p-5 rounded-xl border border-white/5 italic">
                                                                <Database size={14} className="text-purple-400" /> {log.tenantId || "MASTER_SCOPE"}
                                                            </div>
                                                        </Card>
                                                    </div>

                                                    {/* Data Forensic Comparison */}
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between px-6">
                                                                <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] italic flex items-center gap-3">
                                                                    <History size={14} /> Hash Pre-Mutation
                                                                </p>
                                                                <Badge variant="glass" className="bg-rose-500/10 text-rose-500 border-none text-[8px] font-black uppercase italic">Legacy State</Badge>
                                                            </div>
                                                            <div className="p-10 bg-[#020617] rounded-[40px] border-2 border-rose-500/10 overflow-hidden shadow-2xl relative group/data">
                                                                <pre className="text-[11px] font-mono text-slate-500 leading-loose overflow-x-auto custom-scrollbar italic">
                                                                    {log.oldData ? JSON.stringify(log.oldData, null, 2) : "/* NO PREVIOUS DATA REGISTERED IN THIS SCOPE */"}
                                                                </pre>
                                                                <Code size={48} className="absolute -right-6 -bottom-6 text-rose-500/5 group-hover/data:opacity-20 transition-opacity" />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between px-6">
                                                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] italic flex items-center gap-3">
                                                                    <Zap size={14} /> Hash Post-Mutation
                                                                </p>
                                                                <Badge variant="glass" className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black uppercase italic">Atomic Success</Badge>
                                                            </div>
                                                            <div className="p-10 bg-[#020617] rounded-[40px] border-2 border-emerald-500/10 overflow-hidden shadow-2xl relative group/data">
                                                                <pre className="text-[11px] font-mono text-blue-400 leading-loose overflow-x-auto custom-scrollbar italic font-bold">
                                                                    {log.newData ? JSON.stringify(log.newData, null, 2) : "/* NO POST-MUTATION DATA (COMMAND TYPE ACTION) */"}
                                                                </pre>
                                                                <ShieldCheck size={48} className="absolute -right-6 -bottom-6 text-emerald-500/5 group-hover/data:opacity-20 transition-opacity" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* SOC Sovereignty Footer */}
            <div className="bg-slate-950/60 p-12 rounded-[56px] border border-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group shadow-2xl">
                <div className="flex items-center gap-8 relative z-10">
                    <div className="w-20 h-20 bg-blue-600/10 rounded-[28px] flex items-center justify-center text-blue-500 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 border border-blue-500/20 shadow-xl">
                        <Terminal size={40} />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-white font-black text-2xl italic tracking-tighter uppercase italic leading-none">Security Operations Center</h4>
                        <p className="text-sm text-slate-500 font-medium max-w-xl leading-relaxed italic mt-2">
                            A trilha de auditoria forense é assinada criptograficamente em tempo real. O ecossistema MSV garante imutabilidade total para conformidade de governança municipal de nível soberano.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-4 relative z-10">
                    <Badge variant="glass" className="bg-blue-500/10 text-blue-400 border-none px-8 py-4 text-[11px] font-black uppercase tracking-[0.3em] italic rounded-2xl flex items-center gap-3 shadow-xl border border-blue-500/20">
                        <Lock size={18} /> Hash Integrity: Sovereign Verified
                    </Badge>
                </div>
                <div className="absolute top-[-50%] right-[-10%] w-[700px] h-[700px] bg-blue-600/5 rounded-full blur-[180px] pointer-events-none" />
            </div>
        </AnimateIn>
    );
};
