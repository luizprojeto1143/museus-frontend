import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { 
    Trophy, 
    PlusCircle, 
    Edit, 
    Trash2, 
    Image as ImageIcon,
    Target,
    Zap,
    ShieldCheck,
    Globe,
    Layers,
    ArrowUpRight,
    Search,
    ChevronRight,
    Star,
    Award,
    Crown,
    Medal,
    Gem,
    Sparkles,
    SearchCode,
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

interface Tenant {
    id: string;
    name: string;
}

interface Achievement {
    id: string;
    code: string;
    title: string;
    description: string;
    imageUrl?: string;
}

export const MasterAchievements: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [selectedTenantId, setSelectedTenantId] = useState<string>("");
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(false);
    const [tenantsLoading, setTenantsLoading] = useState(true);

    const loadTenants = useCallback(async () => {
        try {
            setTenantsLoading(true);
            const res = await api.get("/tenants");
            setTenants(res.data);
            if (res.data.length > 0) {
                setSelectedTenantId(res.data[0].id);
            }
        } catch (err: any) {
            toast.error("Erro ao sincronizar domínios municipais.");
        } finally {
            setTenantsLoading(false);
        }
    }, []);

    const loadAchievements = useCallback(async (tenantId: string) => {
        setLoading(true);
        try {
            const res = await api.get(`/achievements?tenantId=${tenantId}`);
            setAchievements(res.data);
        } catch (err: any) {
            toast.error("Erro na leitura do cofre de medalhas.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTenants();
    }, [loadTenants]);

    useEffect(() => {
        if (selectedTenantId) {
            loadAchievements(selectedTenantId);
        } else {
            setAchievements([]);
        }
    }, [selectedTenantId, loadAchievements]);

    const handleDelete = async (id: string) => {
        if (!confirm("PROTOCOL: Deseja expurgar esta medalha do registro histórico?")) return;
        try {
            await api.delete(`/achievements/${id}`);
            toast.success("Medalha removida do cofre.");
            if (selectedTenantId) loadAchievements(selectedTenantId);
        } catch (err: any) {
            toast.error("Erro no protocolo de remoção.");
        }
    };

    if (tenantsLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">Acessando Cofre de Medalhas...</p>
        </div>
    );

    return (
        <AnimateIn className="space-y-12 pb-32">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-amber-500/10 text-amber-500 border-none px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.3em] italic">
                            Gamification Hub & Recognition Engine
                        </Badge>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic leading-none">
                        Hall de <span className="text-amber-500">Glória</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-xl max-w-3xl leading-relaxed">
                        Curadoria de conquistas, medalhas e marcos históricos para incentivar a exploração cultural em toda a rede.
                    </p>
                </div>
                
                <Button 
                    onClick={() => navigate(`/master/achievements/novo?tenantId=${selectedTenantId}`)}
                    className="h-16 px-10 rounded-2xl bg-amber-600 text-white font-black uppercase text-xs tracking-widest hover:bg-amber-500 transition-all shadow-2xl shadow-amber-600/20 active:scale-95"
                >
                    <PlusCircle size={20} className="mr-3" /> Forjar Medalha
                </Button>
            </div>

            {/* Context & Selection Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <Card className="lg:col-span-3 p-8 bg-white/[0.02] border-white/5 rounded-[40px] flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center gap-6 min-w-[280px] relative z-10">
                        <div className="w-16 h-16 rounded-[24px] bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shadow-xl group-hover:scale-110 transition-transform">
                            <Globe size={32} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-white font-black text-lg italic tracking-tight uppercase leading-none">Domínio da Rede</h4>
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] italic mt-1">Sincronização Regional</p>
                        </div>
                    </div>
                    <div className="flex-1 w-full relative z-10">
                        <select
                            value={selectedTenantId}
                            onChange={(e) => setSelectedTenantId(e.target.value)}
                            className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-8 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all appearance-none font-black uppercase tracking-widest cursor-pointer shadow-inner"
                        >
                            <option value="" className="bg-slate-900">Selecione uma Cidade...</option>
                            {tenants.map(item => (
                                <option key={item.id} value={item.id} className="bg-slate-900">{item.name.toUpperCase()}</option>
                            ))}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-amber-500">
                            <ChevronRight size={20} className="rotate-90" />
                        </div>
                    </div>
                    <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
                </Card>

                <Card className="p-8 bg-amber-600/5 border-amber-500/10 rounded-[40px] flex flex-col justify-center gap-2 group relative overflow-hidden shadow-2xl">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest leading-none">Ativos no Cofre</p>
                        <Award size={24} className="text-amber-500/30 group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-4xl font-black text-white tracking-tighter italic leading-none">
                        <AnimatedCounter value={achievements.length} />
                    </p>
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                </Card>
            </div>

            {/* Medal Showcase Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="h-[450px] bg-white/5 rounded-[56px] animate-pulse border border-white/5" />
                        ))
                    ) : achievements.length === 0 ? (
                        <div className="lg:col-span-3 py-40 text-center flex flex-col items-center gap-8 group">
                            <div className="w-32 h-32 rounded-[48px] bg-white/[0.02] border border-white/5 flex items-center justify-center text-slate-800 group-hover:text-amber-500/20 transition-colors duration-1000">
                                <Trophy size={64} />
                            </div>
                            <div className="space-y-2">
                                <p className="text-xl font-black text-slate-700 uppercase tracking-[0.3em] italic">Cofre de Glória Silencioso</p>
                                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest italic">Nenhuma medalha forjada para este domínio</p>
                            </div>
                            <Button 
                                onClick={() => navigate(`/master/achievements/novo?tenantId=${selectedTenantId}`)}
                                variant="glass" 
                                className="h-14 px-8 rounded-2xl border-white/5 text-amber-500/50 hover:text-amber-500 hover:bg-amber-500/5 transition-all font-black uppercase text-[10px] tracking-widest"
                            >
                                <PlusCircle size={16} className="mr-3" /> Iniciar Gamificação
                            </Button>
                        </div>
                    ) : (
                        achievements.map((ach, idx) => (
                            <motion.div
                                key={ach.id}
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                transition={{ delay: idx * 0.05, ease: "circOut" }}
                            >
                                <Card className="h-full bg-[#0b1120]/60 border-2 border-white/5 rounded-[56px] p-12 flex flex-col items-center text-center group hover:bg-white/[0.03] hover:border-amber-500/30 transition-all duration-500 shadow-2xl relative overflow-hidden">
                                    {/* Control Overlay */}
                                    <div className="absolute top-10 right-10 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 z-30 translate-y-2 group-hover:translate-y-0">
                                        <button 
                                            onClick={() => navigate(`/master/achievements/${ach.id}`)}
                                            className="w-12 h-12 rounded-2xl bg-white/5 text-slate-400 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center border border-white/10 shadow-2xl backdrop-blur-md"
                                        >
                                            <Settings2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(ach.id)}
                                            className="w-12 h-12 rounded-2xl bg-white/5 text-rose-500/40 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center border border-white/10 shadow-2xl backdrop-blur-md"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    {/* Protocol Badge */}
                                    <Badge variant="glass" className="bg-amber-500/5 border-amber-500/10 text-amber-500/40 text-[9px] font-black uppercase tracking-[0.3em] mb-12 italic px-4 py-2 rounded-xl group-hover:text-amber-500 group-hover:border-amber-500/20 transition-all">
                                        {ach.code}
                                    </Badge>

                                    {/* Medal Core */}
                                    <div className="relative mb-12">
                                        <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-slate-900 via-[#0b1120] to-slate-800 border-2 border-white/10 flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] group-hover:scale-110 group-hover:border-amber-500/40 transition-all duration-1000 relative z-10 overflow-hidden">
                                            {ach.imageUrl ? (
                                                <img
                                                    src={ach.imageUrl.startsWith("http") ? ach.imageUrl : `${import.meta.env.VITE_API_URL}${ach.imageUrl}`}
                                                    alt={ach.title}
                                                    className="w-24 h-24 object-contain drop-shadow-[0_0_20px_rgba(245,158,11,0.4)] group-hover:rotate-12 transition-transform duration-1000"
                                                />
                                            ) : (
                                                <Medal size={64} className="text-amber-500/20 group-hover:text-amber-500 transition-all duration-700" />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        {/* Radial Glow System */}
                                        <div className="absolute inset-[-40%] bg-amber-500/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                                        <div className="absolute inset-[-10%] bg-amber-500/10 rounded-full blur-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse pointer-events-none" />
                                    </div>

                                    {/* Content Matrix */}
                                    <div className="space-y-6 flex-1 relative z-20">
                                        <h3 className="text-3xl font-black text-white italic tracking-tighter group-hover:text-amber-500 transition-colors duration-500 uppercase leading-none">{ach.title}</h3>
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed italic line-clamp-3 group-hover:text-slate-400 transition-colors">
                                            "{ach.description}"
                                        </p>
                                    </div>

                                    {/* Footer Certification */}
                                    <div className="mt-12 pt-8 border-t border-white/5 w-full flex justify-center gap-6">
                                        <div className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-widest italic group-hover:text-amber-500/60 transition-colors">
                                            <Gem size={14} className="text-amber-500/40" /> Elite Tier
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-widest italic group-hover:text-blue-500/60 transition-colors">
                                            <Sparkles size={14} className="text-blue-500/40" /> Multi-Node
                                        </div>
                                    </div>

                                    {/* Ambient Background Aura */}
                                    <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-amber-600/5 rounded-full blur-[100px] pointer-events-none group-hover:opacity-100 opacity-20 transition-opacity" />
                                </Card>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Governance Technology Footer */}
            <div className="bg-[#0f172a]/60 p-12 rounded-[56px] border border-amber-500/10 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group shadow-2xl">
                <div className="flex items-center gap-8 relative z-10">
                    <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-500 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 border border-amber-500/20 shadow-xl">
                        <Crown size={40} />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-white font-black text-2xl italic tracking-tighter uppercase italic leading-none">Protocolo de Reconhecimento Master</h4>
                        <p className="text-sm text-slate-500 font-medium max-w-xl leading-relaxed italic mt-2">
                            A curadoria de medalhas globais estabelece o padrão de excelência gamificada da rede MSV, incentivando a retenção e o engajamento cívico-cultural.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-4 relative z-10">
                    <Badge variant="glass" className="bg-amber-500/10 text-amber-500 border-none px-8 py-4 text-[11px] font-black uppercase tracking-[0.3em] italic rounded-2xl flex items-center gap-3 shadow-xl">
                        <ShieldCheck size={18} /> Global Hall: Sovereign Access
                    </Badge>
                </div>
                <div className="absolute top-[-50%] right-[-10%] w-[700px] h-[700px] bg-amber-500/5 rounded-full blur-[180px] pointer-events-none" />
            </div>
        </AnimateIn>
    );
};
