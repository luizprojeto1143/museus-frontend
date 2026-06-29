import {
useTranslation } from "react-i18next";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    Activity, 
    Server, 
    Database, 
    Cpu, 
    HardDrive, 
    RefreshCw, 
    CheckCircle, 
    XCircle,
    ShieldCheck,
    Zap,
    Globe,
    Lock,
    Terminal,
    Layers,
    ArrowUpRight,
    Search,
    AlertCircle,
    ActivitySquare,
    Signal,
    Box,
    Gauge,
    Binary,
    Code,
    History,
    Network,
    MonitorCheck
} from "lucide-react";
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

interface HealthData {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    uptime: number;
    services: {
        database: {
            status: string;
            latency?: string;
            error?: string;
        };
    };
    system: {
        hostname: string;
        platform: string;
        memory: {
            total: string;
            free: string;
            used: string;
        };
        cpu: string;
    };
    version: string;
}

export const MasterSystemHealth: React.FC = () => {
    const { t } = useTranslation();
    const [health, setHealth] = useState<HealthData | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const fetchHealth = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/health');
            setHealth(res.data);
            setLastUpdate(new Date());
        } catch (error: unknown) {
            setHealth({
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                uptime: 0,
                services: {
                    database: { status: 'disconnected', error: 'Connection failed' }
                },
                system: { hostname: 'Node-Offline', platform: 'Unknown', memory: { total: '0', free: '0', used: '0' }, cpu: '0' },
                version: 'Unknown'
            });
            toast.error("Alerta: Core de governança offline.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHealth();
        let interval: ReturnType<typeof setInterval>;
        if (autoRefresh) {
            interval = setInterval(fetchHealth, 30000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh, fetchHealth]);

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (days > 0) return `${days}d ${hours}h ${mins}m`;
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m`;
    };

    const isHealthy = health?.status === 'healthy';

    if (loading && !health) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
            <p className="text-slate-500 font-black animate-pulse uppercase tracking-[0.3em] text-[10px] italic">Auditando Integridade do Cluster...</p>
        </div>
    );

    return (
        <AnimateIn className="space-y-12 pb-32">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-blue-600/10 text-blue-400 border-none px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.4em] italic">
                            System Sovereignty & Health Monitor
                        </Badge>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic leading-none">
                        Status do <span className="text-blue-600">Sistema</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-xl max-w-3xl leading-relaxed">
                        Nerve Center de governança global. Monitoramento clínico de latência, integridade de serviços e paridade tecnológica em tempo real.
                    </p>
                </div>
                
                <div className="flex items-center gap-4 bg-white/[0.02] p-2.5 rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-xl">
                    <button 
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${autoRefresh ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                    >
                        <Signal size={14} className={autoRefresh ? 'animate-pulse' : ''} /> Auto-Refresh: {autoRefresh ? 'Active' : 'Standby'}
                    </button>
                    <Button 
                        onClick={fetchHealth}
                        className="h-14 px-10 rounded-2xl bg-white/5 text-blue-400 border border-white/5 hover:bg-white hover:text-black transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-xl"
                    >
                        <RefreshCw size={18} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform'}`} /> Sincronizar
                    </Button>
                </div>
            </div>

            {/* Core Vitality Terminal */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "circOut" }}
            >
                <Card className={`p-16 border-2 rounded-[64px] relative overflow-hidden transition-all duration-1000 group ${
                    isHealthy 
                    ? 'bg-emerald-600/[0.03] border-emerald-500/20 shadow-[0_0_60px_rgba(16,185,129,0.05)]' 
                    : 'bg-rose-600/[0.03] border-rose-500/20 shadow-[0_0_60px_rgba(244,63,94,0.05)]'
                }`}>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-16">
                        <div className={`w-48 h-48 rounded-full flex items-center justify-center relative shadow-2xl border-4 ${
                            isHealthy ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                        }`}>
                            <div className="relative z-10 group-hover:scale-110 transition-transform duration-700">
                                {isHealthy ? <CheckCircle size={80} /> : <AlertCircle size={80} />}
                            </div>
                            {/* Neural Pulse Rings */}
                            {[1, 2, 3].map(i => (
                                <motion.div 
                                    key={i}
                                    className={`absolute inset-0 rounded-full border-2 ${isHealthy ? 'border-emerald-500' : 'border-rose-500'}`}
                                    animate={{ scale: [1, 1.4, 1.8], opacity: [0.6, 0.2, 0] }}
                                    transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.4 }}
                                />
                            ))}
                        </div>
                        <div className="space-y-6 text-center md:text-left">
                            <div className="space-y-2">
                                <p className={`text-[11px] font-black uppercase tracking-[0.4em] italic ${isHealthy ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {isHealthy ? 'Protocolo de Integridade: Ativo' : 'Protocolo de Crise: Ativo'}
                                </p>
                                <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic leading-none">
                                    {isHealthy ? 'SISTEMA' : 'FALHA DE'} <span className={isHealthy ? 'text-emerald-500' : 'text-rose-500'}>{isHealthy ? 'ESTÁVEL' : 'CORE'}</span>
                                </h2>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                                <Badge variant="glass" className="bg-white/5 border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-xl italic">
                                    Last Mutation: {lastUpdate?.toLocaleTimeString('pt-BR') || 'N/A'}
                                </Badge>
                                <Badge variant="glass" className="bg-white/5 border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-xl italic">
                                    Region: South-1 (Brazil)
                                </Badge>
                                <Badge variant="glass" className={`border-none text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-xl italic ${isHealthy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                    Kernel: {health?.version || 'v1.0.0-gold'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    {/* Atmospheric Glow */}
                    <div className={`absolute -right-20 -top-20 w-[600px] h-[600px] rounded-full blur-[180px] opacity-20 transition-all duration-1000 ${isHealthy ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                    <div className="absolute left-[-10%] bottom-[-10%] w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
                </Card>
            </motion.div>

            {/* Metrics Telemetry Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {/* Database Node Diagnostic */}
                <Card className="p-12 bg-[#0b1120]/60 border-2 border-white/5 rounded-[56px] space-y-12 group hover:bg-white/[0.04] transition-all duration-500 shadow-2xl relative overflow-hidden border-t-white/10">
                    <div className="flex justify-between items-start relative z-10">
                        <div className="w-16 h-16 bg-purple-600/10 text-purple-400 rounded-2xl flex items-center justify-center border border-purple-500/20 shadow-xl group-hover:scale-110 transition-transform">
                            <Database size={32} />
                        </div>
                        <Badge className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border-none shadow-lg ${
                            health?.services?.database?.status === 'connected' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400 shadow-rose-500/20'
                        }`}>
                            {health?.services?.database?.status === 'connected' ? 'Synced' : 'Critical Failure'}
                        </Badge>
                    </div>
                    <div className="space-y-3 relative z-10">
                        <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] italic leading-none">Database Layer Latency</p>
                        <p className="text-5xl font-black text-white tracking-tighter italic leading-none">
                            {health?.services?.database?.latency ? (
                                <>
                                    <AnimatedCounter value={parseInt(health.services.database.latency)} />
                                    <span className="text-lg ml-2 text-slate-600 uppercase tracking-widest not-italic opacity-50">ms</span>
                                </>
                            ) : (
                                <span className="text-rose-500 text-3xl">PROTOCOL_OFF</span>
                            )}
                        </p>
                    </div>
                    <div className="space-y-4 relative z-10">
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                            <motion.div 
                                className="h-full bg-gradient-to-r from-purple-600 to-indigo-400 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.4)]" 
                                initial={{ width: 0 }} 
                                animate={{ width: isHealthy ? '85%' : '5%' }} 
                                transition={{ duration: 1.5, ease: "circOut" }}
                            />
                        </div>
                        <div className="flex justify-between text-[9px] font-black text-slate-700 uppercase tracking-[0.2em] italic">
                            <span>Sincronismo Global</span>
                            <span className="text-purple-400">99.9% Uptime Goal</span>
                        </div>
                    </div>
                </Card>

                {/* Uptime Engine Diagnostic */}
                <Card className="p-12 bg-[#0b1120]/60 border-2 border-white/5 rounded-[56px] space-y-12 group hover:bg-white/[0.04] transition-all duration-500 shadow-2xl relative overflow-hidden border-t-white/10">
                    <div className="flex justify-between items-start relative z-10">
                        <div className="w-16 h-16 bg-blue-600/10 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-xl group-hover:scale-110 transition-transform">
                            <ActivitySquare size={32} />
                        </div>
                        <Badge variant="glass" className="bg-blue-600/10 text-blue-400 border-none text-[9px] font-black uppercase tracking-widest px-5 py-2 rounded-xl italic shadow-lg">Continuity Tier</Badge>
                    </div>
                    <div className="space-y-3 relative z-10">
                        <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] italic leading-none">System Sovereignty Age</p>
                        <p className="text-4xl font-black text-white tracking-tighter italic leading-none uppercase">
                            {health ? formatUptime(health.uptime) : "00:00:00"}
                        </p>
                    </div>
                    <div className="space-y-4 relative z-10">
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                            <motion.div 
                                className="h-full bg-gradient-to-r from-blue-600 to-sky-400 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                                initial={{ width: 0 }} 
                                animate={{ width: '100%' }} 
                                transition={{ duration: 2, ease: "circOut" }}
                            />
                        </div>
                        <div className="flex justify-between text-[9px] font-black text-slate-700 uppercase tracking-[0.2em] italic">
                            <span>Estabilidade de Node</span>
                            <span className="text-blue-400">Sovereign Active</span>
                        </div>
                    </div>
                </Card>

                {/* System Host Diagnostic */}
                <Card className="p-12 bg-[#0b1120]/60 border-2 border-white/5 rounded-[56px] space-y-12 group hover:bg-white/[0.04] transition-all duration-500 shadow-2xl relative overflow-hidden border-t-white/10">
                    <div className="flex justify-between items-start relative z-10">
                        <div className="w-16 h-16 bg-amber-600/10 text-amber-500 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-xl group-hover:scale-110 transition-transform">
                            <Server size={32} />
                        </div>
                        <Badge variant="glass" className="bg-amber-600/10 text-amber-500 border-none text-[9px] font-black uppercase tracking-widest px-5 py-2 rounded-xl italic shadow-lg">Cloud Infrastructure</Badge>
                    </div>
                    <div className="space-y-3 relative z-10">
                        <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] italic leading-none">Active Cluster Node ID</p>
                        <p className="text-2xl font-black text-white tracking-tighter italic font-mono truncate bg-white/5 p-4 rounded-xl border border-white/5 group-hover:text-amber-500 transition-colors">
                            {health?.system?.hostname || "Unknown_Kernel_Host"}
                        </p>
                    </div>
                    <div className="space-y-4 relative z-10">
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                            <motion.div 
                                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.4)]" 
                                initial={{ width: 0 }} 
                                animate={{ width: '92%' }} 
                                transition={{ duration: 1.8, ease: "circOut" }}
                            />
                        </div>
                        <div className="flex justify-between text-[9px] font-black text-slate-700 uppercase tracking-[0.2em] italic">
                            <span>Distribuição Geográfica</span>
                            <span className="text-amber-400">AWS Region Secured</span>
                        </div>
                    </div>
                </Card>

                {/* Advanced Resource Telemetry */}
                <Card className="md:col-span-2 p-14 bg-black/60 border-2 border-white/5 rounded-[64px] grid grid-cols-1 md:grid-cols-2 gap-16 relative overflow-hidden border-t-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <div className="space-y-10 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-pink-600/10 text-pink-500 rounded-[20px] flex items-center justify-center border border-pink-500/20 shadow-xl group-hover:scale-110 transition-transform">
                                <HardDrive size={32} />
                            </div>
                            <div>
                                <h4 className="text-white font-black text-2xl italic tracking-tighter uppercase leading-none">Memory Pool</h4>
                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em] italic mt-2">Allocation vs Real Consumption</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="flex justify-between items-end text-[11px] font-black uppercase tracking-widest italic">
                                <span className="text-slate-500">Current Load: <span className="text-white">{health?.system?.memory?.used || '0Mb'}</span></span>
                                <span className="text-pink-500 text-lg">{health?.system?.memory?.total || '0Mb'} <span className="text-[10px] text-slate-700">MAX</span></span>
                            </div>
                            <div className="h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/10 shadow-inner">
                                <motion.div 
                                    className="h-full bg-gradient-to-r from-pink-600 via-rose-500 to-pink-400 rounded-full shadow-[0_0_30px_rgba(236,72,153,0.3)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: (health?.system?.memory?.used && health?.system?.memory?.total) ? `${(parseInt(health.system.memory.used) / parseInt(health.system.memory.total)) * 100}%` : '0%' }}
                                    transition={{ duration: 2.5, ease: "circOut" }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-10 relative z-10 flex flex-col justify-center">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-sky-600/10 text-sky-500 rounded-[20px] flex items-center justify-center border border-sky-500/20 shadow-xl group-hover:scale-110 transition-transform">
                                <Cpu size={32} />
                            </div>
                            <div>
                                <h4 className="text-white font-black text-2xl italic tracking-tighter uppercase leading-none">Processor Load</h4>
                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em] italic mt-2">Virtual Core Computing Power</p>
                            </div>
                        </div>
                        <div className="text-center md:text-left space-y-2">
                            <p className="text-7xl font-black text-white tracking-tighter italic leading-none drop-shadow-2xl">
                                {health?.system?.cpu || "0%"}
                            </p>
                            <Badge variant="glass" className="bg-sky-500/10 text-sky-400 border-none px-6 py-2 text-[10px] font-black uppercase tracking-[0.3em] italic rounded-xl shadow-lg">
                                {health?.system?.platform || "Cloud Linux"} Kernel Optimized
                            </Badge>
                        </div>
                    </div>
                    <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[120px] pointer-events-none" />
                </Card>

                {/* Audit & Forensic Module */}
                <Card className="p-12 bg-indigo-600/5 border-2 border-indigo-500/10 rounded-[64px] flex flex-col justify-between group relative overflow-hidden shadow-2xl border-t-white/5">
                    <div className="space-y-6 relative z-10">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                            <Terminal size={32} />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-white font-black text-2xl italic tracking-tighter uppercase leading-none">Sovereign Audit</h4>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed italic mt-4">
                                Cada batimento do core global é assinado criptograficamente para garantir a imutabilidade entre instâncias de governança.
                            </p>
                        </div>
                    </div>
                    <Button 
                        variant="glass" 
                        className="w-full h-16 rounded-[24px] border-indigo-500/20 text-indigo-400 text-[11px] font-black uppercase tracking-[0.3em] italic mt-10 relative z-10 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500/40 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                    >
                        Access Forensics <MonitorCheck size={18} />
                    </Button>
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-indigo-600/20 transition-all duration-1000" />
                </Card>
            </div>

            {/* Strategic SOC Footer */}
            <div className="bg-[#0f172a]/80 p-12 rounded-[56px] border border-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group shadow-2xl border-t-white/10">
                <div className="flex items-center gap-8 relative z-10">
                    <div className="w-20 h-20 bg-blue-600/10 rounded-[28px] flex items-center justify-center text-blue-500 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 border border-blue-500/20 shadow-xl">
                        <Network size={40} />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-white font-black text-2xl italic tracking-tighter uppercase italic leading-none">Infraestrutura Distribuída Master</h4>
                        <p className="text-sm text-slate-500 font-medium max-w-xl leading-relaxed italic mt-2">
                            A vitalidade do sistema é garantida por uma malha redundante de nodes globais. Qualquer anomalia de paridade aciona automaticamente os protocolos de contingência da rede MSV.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-4 relative z-10">
                    <Badge variant="glass" className="bg-emerald-500/10 text-emerald-400 border-none px-8 py-4 text-[11px] font-black uppercase tracking-[0.3em] italic rounded-2xl flex items-center gap-3 shadow-xl border border-emerald-500/20">
                        <ShieldCheck size={18} /> Cluster Integrity: Secured
                    </Badge>
                </div>
                <div className="absolute top-[-50%] right-[-10%] w-[700px] h-[700px] bg-blue-600/5 rounded-full blur-[180px] pointer-events-none" />
            </div>
        </AnimateIn>
    );
};
