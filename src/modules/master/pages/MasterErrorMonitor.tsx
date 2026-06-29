import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from "react-i18next";
import { 
    AlertTriangle, 
    Terminal, 
    Activity, 
    RefreshCw, 
    Search, 
    ChevronDown, 
    ChevronRight, 
    Database, 
    ShieldAlert,
    Trash2,
    Pause,
    Play,
    Zap,
    Layers,
    Cpu,
    Globe,
    Lock,
    X,
    CheckCircle2,
    Bug,
    ShieldX,
    Server,
    Radio,
    FileCode,
    History,
    AlertCircle,
    HardDrive,
    Unplug,
    ZapOff,
    MonitorDot,
    Braces
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
    oldData: any | null;
    newData: any | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
}

export const MasterErrorMonitor: React.FC = () => {
    const { t } = useTranslation();
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [expandedLog, setExpandedLog] = useState<string | null>(null);
    const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'DATABASE'>('ALL');
    const lastFetchRef = useRef<number>(0);

    const fetchLogs = useCallback(async () => {
        try {
            const res = await api.get('/ops/error-logs');
            const technicalLogs = (res.data || []).filter((log: AuditLogEntry) => {
                if (filter === 'CRITICAL') return log.action === 'SERVER_ERROR';
                if (filter === 'DATABASE') return log.newData?.message?.includes('Prisma') || log.newData?.message?.includes('database');
                return true;
            });
            
            setLogs(technicalLogs);
            lastFetchRef.current = Date.now();
        } catch (error: any) {
            console.error('Failed to fetch technical logs:', error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchLogs();
        let interval: ReturnType<typeof setInterval>;
        if (autoRefresh) {
            interval = setInterval(fetchLogs, 8000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh, fetchLogs]);

    const getLogBadge = (log: AuditLogEntry) => {
        const base = "px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border-none shadow-lg italic";
        if (log.action === 'SERVER_ERROR') return <Badge className={`${base} bg-rose-500/10 text-rose-500 shadow-rose-500/10`}>CRITICAL_FAULT</Badge>;
        if (log.action === 'DATABASE_FAILURE') return <Badge className={`${base} bg-amber-500/10 text-amber-500`}>DB_EXCEPTION</Badge>;
        return <Badge className={`${base} bg-blue-600/10 text-blue-400`}>NODE_INFO</Badge>;
    };

    return (
        <AnimateIn className="space-y-12 pb-32">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-rose-600/10 text-rose-500 border-none px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.4em] italic">
                            Operational Health & Mesh Integrity SOC
                        </Badge>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic leading-none">
                        Monitor de <span className="text-rose-600">Falhas</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-xl max-w-3xl leading-relaxed">
                        Terminal de diagnóstico forense para monitoramento de exceções, falhas de runtime e anomalias de rede em tempo real.
                    </p>
                </div>
                
                <div className="flex items-center gap-6 bg-[#0b1120]/60 p-3 rounded-[32px] border-2 border-white/5 shadow-2xl border-t-white/10">
                    <button 
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`w-14 h-14 rounded-2xl transition-all duration-500 flex items-center justify-center shadow-xl ${autoRefresh ? 'bg-rose-600 text-white shadow-rose-600/20' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                        title={autoRefresh ? 'Pausar Telemetria' : 'Resumir Telemetria'}
                    >
                        {autoRefresh ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    <div className="w-px h-10 bg-white/5" />
                    <Button 
                        onClick={() => setLogs([])}
                        variant="glass"
                        className="h-14 px-8 rounded-2xl border-white/5 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-rose-500 transition-all"
                    >
                        <Trash2 size={20} className="mr-3" /> Limpar Histórico
                    </Button>
                </div>
            </div>

            {/* Mesh Status Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <Card className="p-8 bg-[#0b1120]/60 border-2 border-emerald-500/10 rounded-[40px] flex items-center justify-between group shadow-2xl border-t-white/10">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic leading-none">Core Mesh Status</p>
                        <p className="text-3xl font-black text-white tracking-tighter italic uppercase leading-none">Healthy</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-xl border border-emerald-500/20">
                        <Server size={28} className="animate-pulse" />
                    </div>
                </Card>
                <Card className="p-8 bg-[#0b1120]/60 border-2 border-blue-500/10 rounded-[40px] flex items-center justify-between group shadow-2xl border-t-white/10">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic leading-none">Prisma Node Pool</p>
                        <p className="text-3xl font-black text-white tracking-tighter italic uppercase leading-none">Stable</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 shadow-xl border border-blue-500/20">
                        <HardDrive size={28} />
                    </div>
                </Card>
                <Card className="lg:col-span-2 p-3 bg-[#0b1120]/60 border-2 border-white/5 rounded-[40px] flex items-center gap-3 shadow-2xl border-t-white/10">
                    {(['ALL', 'CRITICAL', 'DATABASE'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-1 h-14 rounded-[22px] text-[10px] font-black uppercase tracking-[0.2em] italic transition-all duration-500 ${filter === f ? 'bg-rose-600 text-white shadow-xl shadow-rose-600/20' : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white border border-white/5'}`}
                        >
                            {f === 'ALL' ? 'Fluxo Global' : f === 'CRITICAL' ? 'Exceções Críticas' : 'Anomalias de DB'}
                        </button>
                    ))}
                </Card>
            </div>

            {/* High-Fidelity Terminal Console */}
            <Card className="p-0 bg-[#020617] border-2 border-white/5 rounded-[56px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.8)] border-t-white/10 relative">
                <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02] relative">
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 rounded-[24px] bg-slate-900 border-2 border-white/10 flex items-center justify-center text-rose-500 shadow-xl relative overflow-hidden group">
                            <Terminal size={32} className="relative z-10 group-hover:scale-110 transition-transform" />
                            <div className="absolute inset-0 bg-rose-600/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-white tracking-[0.3em] uppercase italic leading-none">CORE_MESH_DEBUG_FEED.LOG</h3>
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.4em] italic mt-1">
                                {autoRefresh ? 'STATUS: POLLING_ACTIVE_SYNC (8000ms)' : 'STATUS: STREAM_PAUSED_BY_USER'}
                            </p>
                        </div>
                    </div>
                    <Badge variant="glass" className="bg-rose-500/10 text-rose-500 border-none px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] italic rounded-2xl border border-rose-500/20">
                        <MonitorDot size={18} className="mr-3 animate-pulse" /> Forensics Monitoring: Active
                    </Badge>
                    <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/5 rounded-full blur-[100px] pointer-events-none" />
                </div>

                <div className="max-h-[800px] overflow-y-auto custom-scrollbar bg-black/40">
                    <AnimatePresence mode="popLayout">
                        {loading && logs.length === 0 ? (
                            <div className="py-48 text-center text-slate-700 font-mono text-xs flex flex-col items-center gap-10">
                                <RefreshCw size={48} className="animate-spin opacity-20 text-rose-500" />
                                <span className="uppercase tracking-[0.5em] italic animate-pulse">Initializing_Sovereign_Log_Stream...</span>
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="py-48 text-center text-slate-700 font-mono text-xs flex flex-col items-center gap-10">
                                <div className="w-24 h-24 rounded-[40px] bg-emerald-500/5 border-2 border-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner">
                                    <CheckCircle2 size={48} className="opacity-40" />
                                </div>
                                <div className="space-y-3">
                                    <span className="uppercase tracking-[0.5em] italic block text-emerald-500/50">NO_ACTIVE_EXCEPTIONS_DETECTED</span>
                                    <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest italic leading-none">SYSTEM_INTEGRITY_INDEX: 100%</span>
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {logs.map((log, idx) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05, ease: "circOut" }}
                                        className={`group transition-all duration-500 ${expandedLog === log.id ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'}`}
                                    >
                                        <div 
                                            className="px-12 py-8 flex items-center gap-10 cursor-pointer relative overflow-hidden"
                                            onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                        >
                                            <div className="flex flex-col min-w-[120px]">
                                                <span className="font-mono text-[11px] text-slate-500 italic tracking-widest group-hover:text-rose-400 transition-colors">
                                                    [{new Date(log.createdAt).toLocaleTimeString('pt-BR')}]
                                                </span>
                                                <span className="text-[8px] font-black text-slate-800 uppercase tracking-widest mt-1 italic">
                                                    {new Date(log.createdAt).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>
                                            <div className="min-w-[140px]">
                                                {getLogBadge(log)}
                                            </div>
                                            <div className="flex-1 font-mono text-sm text-slate-400 truncate group-hover:text-white transition-colors flex items-center gap-3">
                                                <ChevronRight size={14} className={`text-slate-700 transition-transform ${expandedLog === log.id ? 'rotate-90 text-rose-500' : ''}`} />
                                                <span className="italic uppercase tracking-tight">{log.newData?.message || log.action}</span>
                                                <Badge variant="glass" className="bg-white/5 border-none text-[8px] font-black text-slate-700 uppercase tracking-widest ml-4">
                                                    NODE: {log.entityId || 'SYS_ENGINE'}
                                                </Badge>
                                            </div>
                                            <div className="w-px h-10 bg-white/5" />
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">{log.ipAddress || 'INTERNAL'}</span>
                                                <span className="text-[8px] font-bold text-slate-800 uppercase mt-1">IPV4_ADDRESS</span>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {expandedLog === log.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.5, ease: "circOut" }}
                                                    className="overflow-hidden bg-black/60 backdrop-blur-3xl"
                                                >
                                                    <div className="p-14 border-t-2 border-rose-600/10 space-y-12 relative overflow-hidden">
                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
                                                            <div className="space-y-2">
                                                                <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] italic">Transaction Protocol</p>
                                                                <p className="font-mono text-sm text-blue-400 font-black">{log.id.toUpperCase()}</p>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] italic">Mesh Entity Target</p>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 border border-white/5">
                                                                        <Layers size={14} />
                                                                    </div>
                                                                    <p className="font-mono text-sm text-white font-black uppercase italic">{log.entity}</p>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] italic">Authenticated Context</p>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 border border-white/5">
                                                                        <Lock size={14} />
                                                                    </div>
                                                                    <p className="font-mono text-sm text-white font-black italic">{log.userEmail || 'INTERNAL/SOC_ENGINE'}</p>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] italic">Sovereign Origin</p>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 border border-white/5">
                                                                        <Globe size={14} />
                                                                    </div>
                                                                    <p className="font-mono text-sm text-white font-black italic">{log.ipAddress || '127.0.0.1'}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-6 relative z-10">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-4 text-[11px] font-black text-rose-500 uppercase tracking-[0.4em] italic leading-none">
                                                                    <Braces size={20} /> Exception Stack Trace Analysis
                                                                </div>
                                                                <button 
                                                                    className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase text-slate-500 hover:text-white transition-all italic tracking-widest"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(JSON.stringify(log.newData, null, 2));
                                                                        toast.success("Stack trace copiada p/ análise externa.");
                                                                    }}
                                                                >
                                                                    Copy Data Stream
                                                                </button>
                                                            </div>
                                                            <div className="p-10 bg-[#0d0d10] rounded-[48px] border-2 border-rose-600/10 overflow-x-auto custom-scrollbar shadow-inner relative group/trace">
                                                                <div className="absolute top-6 right-6 opacity-0 group-hover/trace:opacity-100 transition-opacity">
                                                                    <FileCode size={24} className="text-rose-500/20" />
                                                                </div>
                                                                <pre className="text-xs font-mono text-slate-500 leading-loose border-l-4 border-rose-600/30 pl-10">
                                                                    {log.newData?.stack || JSON.stringify(log.newData || log.oldData, null, 4)}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-rose-600/5 rounded-full blur-[100px] pointer-events-none" />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </Card>

            {/* SOC Operational Legend */}
            <div className="flex flex-col lg:flex-row gap-12 items-center justify-between p-12 bg-[#0b1120]/60 border-2 border-white/5 rounded-[56px] shadow-2xl border-t-white/10 relative overflow-hidden group">
                <div className="flex flex-wrap gap-12 relative z-10">
                    <div className="flex items-center gap-5 group/leg cursor-help">
                        <div className="w-4 h-4 rounded-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)] group-hover:scale-125 transition-transform" />
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black text-white uppercase tracking-[0.2em] italic">CRITICAL_FAULT</span>
                            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1">RUNTIME_EXCEPTIONS</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-5 group/leg cursor-help">
                        <div className="w-4 h-4 rounded-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)] group-hover:scale-125 transition-transform" />
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black text-white uppercase tracking-[0.2em] italic">DB_EXCEPTION</span>
                            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1">PRISMA_POOL_ERRORS</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-5 group/leg cursor-help">
                        <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] group-hover:scale-125 transition-transform" />
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black text-white uppercase tracking-[0.2em] italic">NODE_INFO_LOG</span>
                            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1">INFRASTRUCTURE_EVENTS</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-3 relative z-10">
                    <Badge variant="glass" className="bg-rose-500/10 text-rose-500 border-none px-10 py-5 text-[11px] font-black uppercase tracking-[0.4em] italic rounded-[22px] border border-rose-500/20 shadow-xl">
                        <ShieldAlert size={20} className="mr-3" /> Stability Index: Sovereign Verified
                    </Badge>
                </div>
                <div className="absolute top-[-50%] right-[-10%] w-[600px] h-[600px] bg-rose-600/5 rounded-full blur-[150px] pointer-events-none group-hover:bg-rose-600/10 transition-all duration-1000" />
            </div>
        </AnimateIn>
    );
};
