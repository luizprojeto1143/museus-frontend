import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from "react-i18next";
import { api } from '../../../api/client';
import { 
    Users, 
    Trash2, 
    PlayCircle, 
    Activity, 
    Zap, 
    ShieldAlert,
    Globe,
    Layers,
    ArrowUpRight,
    Search,
    X,
    Database,
    Cpu,
    Sparkles,
    BarChart3,
    History,
    Dna,
    AlertCircle,
    CheckCircle2,
    FlaskConical,
    Binary,
    Workflow,
    ShieldCheck,
    ZapOff,
    Fingerprint,
    Boxes,
    Server,
    Waves
} from 'lucide-react';
import { 
    Button, 
    Input, 
    Select, 
    Card, 
    Badge, 
    AnimateIn,
    AnimatedCounter
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

type TenantOption = { id: string; name: string; slug: string };

export const MasterSeeder: React.FC = () => {
    const { t } = useTranslation();
    const [tenantId, setTenantId] = useState('');
    const [count, setCount] = useState(10);
    const [loading, setLoading] = useState(false);
    const [lastResult, setLastResult] = useState<{ visits: number; stamps: number; achievements: number; guestbook: number; reviews: number } | null>(null);
    const [tenants, setTenants] = useState<TenantOption[]>([]);
    const [loadingTenants, setLoadingTenants] = useState(true);

    const [simSettings, setSimSettings] = useState({
        visitors: 20,
        minVisits: 2,
        maxVisits: 6
    });

    const loadTenants = useCallback(async () => {
        try {
            setLoadingTenants(true);
            const res = await api.get('/tenants/public');
            const data: TenantOption[] = Array.isArray(res.data) ? res.data : [];
            setTenants(data);
            if (data.length > 0 && !tenantId) setTenantId(data[0].id);
        } catch (err: any) {
            toast.error("Falha ao sincronizar nodes de museus.");
        } finally {
            setLoadingTenants(false);
        }
    }, [tenantId]);

    useEffect(() => {
        loadTenants();
    }, [loadTenants]);

    const handleGenerate = async () => {
        if (!tenantId) return toast.error("Selecione um node de destino.");
        setLoading(true);
        try {
            const res = await api.post('/seeder/generate', { tenantId, count });
            toast.success(`Protocolo Gênesis: ${res.data.message}`);
        } catch (error: any) {
            toast.error("Falha na injeção de visitantes.");
        } finally {
            setLoading(false);
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm("CONFIRMAÇÃO DE PROTOCOLO: Deseja expurgar todos os dados simulados deste node? Esta ação é irreversível.")) return;
        if (!tenantId) return toast.error("Selecione um node de destino.");
        setLoading(true);
        try {
            const res = await api.delete('/seeder/bulk', { data: { tenantId } });
            toast.success(`Protocolo Expurgar: ${res.data.message}`);
        } catch (error: any) {
            toast.error("Erro no expurgo de dados sintéticos.");
        } finally {
            setLoading(false);
        }
    };

    const handleSimulate = async () => {
        if (!tenantId) return toast.error("Selecione um node de destino.");
        setLoading(true);
        setLastResult(null);
        try {
            const res = await api.post('/seeder/simulate-traffic', {
                tenantId,
                visitorCount: simSettings.visitors,
                minVisits: simSettings.minVisits,
                maxVisits: simSettings.maxVisits
            });
            toast.success(`Simulação de Tráfego Concluída.`);
            if (res.data.stats) setLastResult(res.data.stats);
        } catch (e: any) {
            toast.error("Falha na simulação de tráfego.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimateIn className="space-y-12 pb-32">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-blue-600/10 text-blue-400 border-none px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.4em] italic">
                            Genesis Engine & Neural Data Provisioning
                        </Badge>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic leading-none">
                        Motor de <span className="text-blue-500">Gênese</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-xl max-w-3xl leading-relaxed">
                        Provisionamento de vida digital e simulação tática de tráfego para validação de infraestrutura e dashboards em tempo real.
                    </p>
                </div>
                
                <Card className="p-10 bg-blue-600/5 border-2 border-blue-500/20 rounded-[48px] flex items-center gap-10 group min-w-[340px] shadow-2xl relative overflow-hidden border-t-white/10">
                    <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-xl border border-blue-500/20 relative z-10 overflow-hidden">
                        <Dna size={36} className="animate-pulse relative z-10" />
                        <div className="absolute inset-0 bg-blue-600/5 blur-xl" />
                    </div>
                    <div className="space-y-1 relative z-10">
                        <p className="text-[11px] font-black text-blue-400/50 uppercase tracking-[0.3em] italic leading-none mb-1">Node Selecionado</p>
                        <p className="text-2xl font-black text-white tracking-tighter italic truncate max-w-[200px] leading-none uppercase">
                            {tenants.find(t => t.id === tenantId)?.name || 'AGUARDANDO_NODE'}
                        </p>
                    </div>
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-600/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-blue-600/10 transition-all" />
                </Card>
            </div>

            {/* Tactical Configuration Panel */}
            <div className="bg-[#0b1120]/60 p-8 rounded-[48px] border-2 border-white/5 shadow-2xl backdrop-blur-xl border-t-white/10 flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1 w-full space-y-4">
                    <div className="flex items-center gap-4 ml-8">
                        <Server size={18} className="text-blue-500/50" />
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic leading-none">Alinhamento de Infraestrutura de Destino</label>
                    </div>
                    <div className="relative group">
                        <Select
                            value={tenantId}
                            onChange={e => setTenantId(e.target.value)}
                            className="h-16 bg-white/5 border-2 border-white/10 rounded-[28px] px-8 text-white text-sm font-black uppercase tracking-widest italic hover:border-blue-500/30 transition-all appearance-none cursor-pointer"
                            disabled={loadingTenants}
                        >
                            {loadingTenants ? (
                                <option>Sincronizando Nodes Regionais...</option>
                            ) : (
                                tenants.map(item => (
                                    <option key={item.id} value={item.id} className="bg-[#0f172a]">
                                        {item.name} // NODE_{item.slug.toUpperCase()}
                                    </option>
                                ))
                            )}
                        </Select>
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 group-hover:text-blue-500 transition-colors">
                            <ArrowUpRight size={24} />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-3 pr-4">
                    <Badge variant="glass" className="bg-emerald-500/10 text-emerald-500 border-none px-10 py-5 text-[11px] font-black uppercase tracking-[0.4em] italic rounded-[22px] border border-emerald-500/20 shadow-xl">
                        <ShieldCheck size={20} className="mr-3" /> System Ready for Provisioning
                    </Badge>
                </div>
            </div>

            {/* Genesis Modules Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* GENERATE - LIFE MODULE */}
                <Card className="p-12 bg-[#0b1120]/60 border-2 border-blue-500/10 rounded-[64px] flex flex-col h-full group hover:bg-white/[0.04] hover:border-blue-500/30 transition-all duration-700 relative overflow-hidden shadow-2xl border-t-white/10">
                    <div className="flex items-center gap-6 mb-12 relative z-10">
                        <div className="w-18 h-18 rounded-[28px] bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                            <Users size={36} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase leading-none">Geração de Vida</h3>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] italic mt-2">Mock Identity Provisioning</p>
                        </div>
                    </div>
                    
                    <p className="text-[13px] text-slate-500 font-medium leading-relaxed italic mb-12 relative z-10 group-hover:text-slate-400 transition-colors">
                        Provisionamento cirúrgico de perfis de visitantes simulados com identidades brasileiras válidas, avatares dinâmicos e registros de autenticação forense.
                    </p>

                    <div className="space-y-10 mt-auto relative z-10">
                        <div className="space-y-6">
                            <div className="flex justify-between items-center px-4">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Volume de Injeção</span>
                                <span className="text-xl font-black text-blue-400 italic tracking-tighter">{count} <span className="text-[10px] opacity-40 uppercase">Entidades</span></span>
                            </div>
                            <div className="relative group/slider px-2">
                                <input
                                    type="range"
                                    min="1" max="100"
                                    value={count}
                                    onChange={e => setCount(Number(e.target.value))}
                                    className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer accent-blue-600 group-hover/slider:bg-white/10 transition-colors"
                                />
                                <div className="absolute -top-1 left-0 h-1.5 bg-blue-500 rounded-full pointer-events-none opacity-20" style={{ width: `${count}%` }} />
                            </div>
                        </div>
                        
                        <Button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full h-20 rounded-[28px] bg-blue-600 text-white font-black uppercase tracking-[0.3em] text-xs hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-4 group/btn"
                        >
                            {loading ? <Activity className="animate-spin" size={24} /> : <><Zap size={24} className="text-amber-400 group-hover:scale-125 transition-transform" /> Injetar Visitantes</>}
                        </Button>
                    </div>

                    <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-blue-600/10 transition-all duration-1000" />
                </Card>

                {/* SIMULATE - TACTICAL ACTIVITY */}
                <Card className="p-12 bg-[#0b1120]/60 border-2 border-purple-500/10 rounded-[64px] flex flex-col h-full group hover:bg-white/[0.04] hover:border-purple-500/30 transition-all duration-700 relative overflow-hidden shadow-2xl border-t-white/10">
                    <div className="flex items-center gap-6 mb-12 relative z-10">
                        <div className="w-18 h-18 rounded-[28px] bg-purple-600/10 text-purple-400 flex items-center justify-center border border-purple-500/20 shadow-xl group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                            <Cpu size={36} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase leading-none">Simulação Tática</h3>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] italic mt-2">Neural Traffic Simulation</p>
                        </div>
                    </div>
                    
                    <p className="text-[13px] text-slate-500 font-medium leading-relaxed italic mb-12 relative z-10 group-hover:text-slate-400 transition-colors">
                        Simulação forense de fluxos de visitação: interações com acervos, estampagem de passaportes, desbloqueio de conquistas e reviews de sistema em escala.
                    </p>

                    <div className="grid grid-cols-3 gap-6 mb-12 relative z-10">
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest text-center block italic">Ativos</label>
                            <Input
                                type="number"
                                value={simSettings.visitors}
                                onChange={e => setSimSettings({ ...simSettings, visitors: Number(e.target.value) })}
                                className="h-14 bg-white/5 border-2 border-white/10 rounded-2xl text-center text-sm font-black text-white focus:border-purple-500/50 transition-all italic"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest text-center block italic">Min Op</label>
                            <Input
                                type="number"
                                value={simSettings.minVisits}
                                onChange={e => setSimSettings({ ...simSettings, minVisits: Number(e.target.value) })}
                                className="h-14 bg-white/5 border-2 border-white/10 rounded-2xl text-center text-sm font-black text-white focus:border-purple-500/50 transition-all italic"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest text-center block italic">Max Op</label>
                            <Input
                                type="number"
                                value={simSettings.maxVisits}
                                onChange={e => setSimSettings({ ...simSettings, maxVisits: Number(e.target.value) })}
                                className="h-14 bg-white/5 border-2 border-white/10 rounded-2xl text-center text-sm font-black text-white focus:border-purple-500/50 transition-all italic"
                            />
                        </div>
                    </div>

                    <div className="space-y-8 mt-auto relative z-10">
                        <Button
                            onClick={handleSimulate}
                            disabled={loading}
                            className="w-full h-20 rounded-[28px] bg-purple-600 text-white font-black uppercase tracking-[0.3em] text-xs hover:bg-purple-500 transition-all shadow-2xl shadow-purple-600/30 flex items-center justify-center gap-4 group/btn"
                        >
                            {loading ? <Activity className="animate-spin" size={24} /> : <><PlayCircle size={24} className="group-hover:scale-125 transition-transform" /> Iniciar Simulação</>}
                        </Button>

                        <AnimatePresence>
                            {lastResult && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className="p-8 bg-purple-600/10 border-2 border-purple-500/20 rounded-[40px] space-y-6 shadow-inner relative overflow-hidden"
                                >
                                    <div className="flex items-center gap-4 text-[11px] font-black text-purple-400 uppercase tracking-[0.3em] italic">
                                        <FlaskConical size={18} /> Genesis Output Log
                                    </div>
                                    <div className="grid grid-cols-2 gap-6 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl"><span>Visitas</span> <span className="text-white text-sm font-black">{lastResult.visits}</span></div>
                                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl"><span>Selos</span> <span className="text-white text-sm font-black">{lastResult.stamps}</span></div>
                                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl"><span>Awards</span> <span className="text-white text-sm font-black">{lastResult.achievements}</span></div>
                                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl"><span>Reviews</span> <span className="text-white text-sm font-black">{lastResult.reviews}</span></div>
                                    </div>
                                    <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-purple-600/10 rounded-full blur-xl" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="absolute -left-20 -top-20 w-80 h-80 bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />
                </Card>

                {/* CLEANUP - DANGER ZONE */}
                <Card className="p-12 bg-[#0b1120]/60 border-2 border-rose-500/10 rounded-[64px] flex flex-col h-full group hover:bg-white/[0.04] hover:border-rose-500/30 transition-all duration-700 relative overflow-hidden shadow-2xl border-t-white/10">
                    <div className="flex items-center gap-6 mb-12 relative z-10">
                        <div className="w-18 h-18 rounded-[28px] bg-rose-600/10 text-rose-500 flex items-center justify-center border border-rose-500/20 shadow-xl group-hover:scale-110 group-hover:skew-x-3 transition-all duration-500">
                            <ShieldAlert size={36} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase leading-none">Zona de Perigo</h3>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] italic mt-2">Neural Data Cleanup</p>
                        </div>
                    </div>
                    
                    <p className="text-[13px] text-slate-500 font-medium leading-relaxed italic mb-12 relative z-10 group-hover:text-slate-400 transition-colors">
                        Remoção cirúrgica de entidades e interações simuladas. Apenas dados marcados como <code className="text-rose-500 px-2 bg-rose-500/10 rounded-lg font-black uppercase text-[10px]">isMock</code> serão expurgados do node.
                    </p>

                    <div className="mt-auto space-y-8 relative z-10">
                        <div className="p-8 bg-rose-500/5 border-2 border-rose-500/10 rounded-[32px] flex items-center gap-6 group/alert hover:bg-rose-500/10 transition-all duration-500">
                            <div className="w-12 h-12 rounded-2xl bg-rose-600/10 flex items-center justify-center text-rose-500 shadow-lg border border-rose-500/20">
                                <ZapOff size={24} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black text-rose-500 uppercase tracking-[0.2em] italic">Aviso de Protocolo</span>
                                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest italic leading-relaxed mt-1">Esta operação executará o expurgo imutável dos registros sintéticos do node selecionado.</p>
                            </div>
                        </div>
                        <Button
                            onClick={handleBulkDelete}
                            disabled={loading}
                            className="w-full h-20 rounded-[28px] bg-white/5 text-rose-500 border-2 border-rose-500/20 hover:bg-rose-600 hover:text-white transition-all font-black uppercase tracking-[0.3em] text-xs shadow-2xl flex items-center justify-center gap-4 group/del"
                        >
                            <Trash2 size={24} className="group-hover/del:scale-110 group-hover/del:-rotate-12 transition-transform" /> Expurgar Dados Mock
                        </Button>
                    </div>
                    <div className="absolute top-[-50%] right-[-10%] w-[400px] h-[400px] bg-rose-600/5 rounded-full blur-[120px] pointer-events-none" />
                </Card>
            </div>

            {/* Governance & Integrity Footer */}
            <div className="bg-[#0f172a]/80 p-14 rounded-[64px] border-2 border-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group shadow-2xl border-t-white/10">
                <div className="flex items-center gap-10 relative z-10">
                    <div className="w-24 h-24 bg-blue-600/10 rounded-[32px] flex items-center justify-center text-blue-500 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 border border-blue-500/20 shadow-2xl relative overflow-hidden">
                        <History size={48} />
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent" />
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-white font-black text-3xl italic tracking-tighter uppercase italic leading-none">Protocolo de Integridade Neural</h4>
                        <p className="text-sm text-slate-500 font-medium max-w-2xl leading-relaxed italic mt-2">
                            As operações de gênese são monitoradas e registradas nos logs de auditoria forense global para garantir que os dados de produção permaneçam isolados da malha de simulação tática.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-6 relative z-10">
                    <Badge variant="glass" className="bg-blue-500/10 text-blue-400 border-none px-12 py-6 text-[12px] font-black uppercase tracking-[0.4em] italic rounded-[24px] flex items-center gap-4 shadow-2xl border border-blue-500/20">
                        <Fingerprint size={24} /> Neural Integrity: Secured
                    </Badge>
                </div>
                <div className="absolute top-[-50%] right-[-10%] w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[200px] pointer-events-none" />
                <div className="absolute left-[-5%] bottom-[-10%] w-[300px] h-[300px] bg-amber-600/5 rounded-full blur-[120px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </AnimateIn>
    );
};
