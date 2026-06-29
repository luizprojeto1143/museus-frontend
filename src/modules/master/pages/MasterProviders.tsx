import React, { useEffect, useState, useCallback, useMemo } from "react";
import { api } from "../../../api/client";
import { 
    Trash2, 
    Plus, 
    Search, 
    CheckCircle, 
    ShieldCheck, 
    Star, 
    Mail, 
    Phone, 
    Info, 
    Wrench, 
    Briefcase, 
    Target, 
    Activity, 
    Zap, 
    Globe, 
    ArrowUpRight,
    X,
    UserCheck,
    Layers,
    Award,
    Verified,
    Contact,
    Building,
    ExternalLink,
    SearchCheck,
    CloudCheck,
    Handshake,
    RefreshCw
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { 
    Button, 
    Input, 
    Textarea, 
    EmptyState, 
    Card, 
    Badge, 
    AnimateIn,
    AnimatedCounter
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

type Provider = {
    id: string;
    name: string;
    description: string;
    email: string;
    phone: string;
    services: string[];
    active: boolean;
    rating: number;
    completedJobs: number;
    tenantId?: string;
};

const serviceLabels: Record<string, string> = {
    "LIBRAS_INTERPRETATION": "Libras",
    "AUDIO_DESCRIPTION": "Audiodescrição",
    "CAPTIONING": "Legendagem",
    "BRAILLE": "Braille",
    "TACTILE_MODEL": "Maquete Tátil",
    "EASY_READING": "Leitura Simples"
};

const serviceOptions = Object.keys(serviceLabels);

export const MasterProviders: React.FC = () => {
    const { t } = useTranslation();
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        email: "",
        phone: "",
        services: [] as string[],
        tenantId: ""
    });

    const fetchProviders = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get("/providers");
            setProviders(res.data || []);
        } catch (err: unknown) {
            toast.error("Erro na sincronização do ecossistema.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

    const filteredProviders = useMemo(() => {
        return providers.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.services.some(s => serviceLabels[s]?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [providers, searchTerm]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/providers", formData);
            setModalOpen(false);
            setFormData({ name: "", description: "", email: "", phone: "", services: [], tenantId: "" });
            fetchProviders();
            toast.success("Parceiro homologado no ecossistema!");
        } catch (err: unknown) {
            toast.error("Erro na autorização do parceiro.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("PROTOCOL: Deseja desativar este parceiro do ecossistema global?")) return;
        try {
            await api.delete(`/providers/${id}`);
            setProviders(prev => prev.filter(p => p.id !== id));
            toast.success("Parceiro removido do registro histórico.");
        } catch (err: unknown) {
            toast.error("Erro no protocolo de remoção.");
        }
    };

    const handleToggleService = (service: string) => {
        setFormData(prev => ({
            ...prev,
            services: prev.services.includes(service)
                ? prev.services.filter(s => s !== service)
                : [...prev.services, service]
        }));
    };

    if (loading && providers.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
            <p className="text-slate-500 font-black animate-pulse uppercase tracking-[0.3em] text-[10px] italic">Mapeando Ecossistema de Parceiros...</p>
        </div>
    );

    return (
        <AnimateIn className="space-y-12 pb-32">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-blue-600/10 text-blue-400 border-none px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.4em] italic">
                            Ecosystem Sovereignty & Global Partners
                        </Badge>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic leading-none">
                        Hub de <span className="text-blue-600">Parceiros</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-xl max-w-3xl leading-relaxed">
                        Curadoria global de prestadores homologados para serviços de acessibilidade, infraestrutura e produção cultural de elite.
                    </p>
                </div>
                
                <Button 
                    onClick={() => setModalOpen(true)}
                    className="h-16 px-10 rounded-2xl bg-blue-600 text-white font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/20 active:scale-95 flex items-center gap-4 group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" /> Homologar Parceiro
                </Button>
            </div>

            {/* Metrics & Search Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <Card className="lg:col-span-3 p-8 bg-[#0b1120]/60 border-2 border-white/5 rounded-[40px] flex items-center gap-8 shadow-2xl relative overflow-hidden border-t-white/10">
                    <div className="relative group flex-1 z-10">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={24} />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Buscar parceiro por nome, competência ou especialidade técnica..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-8 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700 font-bold uppercase tracking-widest"
                        />
                    </div>
                    <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
                </Card>
                <Card className="p-8 bg-blue-600/5 border-blue-500/10 rounded-[40px] flex flex-col justify-center gap-2 group relative overflow-hidden shadow-2xl">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Nodes Ativos</p>
                        <UserCheck size={28} className="text-blue-500/30 group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-4xl font-black text-white tracking-tighter italic leading-none">
                        <AnimatedCounter value={providers.length} />
                    </p>
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-600/5 rounded-full blur-2xl pointer-events-none" />
                </Card>
            </div>

            {/* Partners Showcase Grid */}
            <AnimatePresence mode="popLayout">
                {filteredProviders.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Card className="p-40 bg-white/[0.01] border-2 border-white/5 rounded-[64px] text-center flex flex-col items-center gap-10 opacity-30 shadow-inner">
                            <div className="w-24 h-24 rounded-[40px] bg-white/5 flex items-center justify-center border border-white/5 text-slate-700">
                                <Handshake size={64} />
                            </div>
                            <div className="space-y-4">
                                <p className="text-2xl font-black text-slate-500 uppercase tracking-[0.4em] italic leading-none">Vácuo de Ecossistema</p>
                                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest italic">Nenhum parceiro homologado atende aos critérios de busca</p>
                            </div>
                        </Card>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredProviders.map((provider, idx) => (
                            <motion.div
                                key={provider.id}
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                                transition={{ delay: idx * 0.05, ease: "circOut" }}
                            >
                                <Card className="h-full bg-[#0b1120]/60 border-2 border-white/5 rounded-[56px] p-12 flex flex-col group hover:bg-white/[0.04] hover:border-blue-500/30 transition-all duration-500 shadow-2xl relative overflow-hidden border-t-white/10">
                                    {/* Provider Identity Header */}
                                    <div className="flex justify-between items-start mb-10 relative z-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 rounded-[28px] bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-950 border-2 border-white/10 flex items-center justify-center text-blue-500 shadow-[0_0_40px_rgba(0,0,0,0.4)] group-hover:border-blue-500/40 group-hover:rotate-6 transition-all duration-700 relative overflow-hidden">
                                                <Award size={40} className="relative z-10 group-hover:scale-110 transition-transform" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none group-hover:text-blue-400 transition-colors">{provider.name}</h3>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1.5 text-amber-500">
                                                        <Star size={14} fill="currentColor" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">{provider.rating?.toFixed(1) || "NEW"}</span>
                                                    </div>
                                                    <div className="w-1 h-1 rounded-full bg-slate-800" />
                                                    <Badge variant="glass" className="bg-emerald-500/10 text-emerald-400 border-none text-[8px] font-black uppercase italic px-3 py-1 rounded-lg">
                                                        {provider.completedJobs} Entregas
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 translate-y-[-10px] opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                                            <button
                                                onClick={() => handleDelete(provider.id)}
                                                className="w-12 h-12 rounded-2xl bg-white/5 text-rose-500/40 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center border border-white/10 shadow-2xl backdrop-blur-md group/del"
                                            >
                                                <Trash2 size={20} className="group-hover/del:scale-110 transition-transform" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Competency Matrix */}
                                    <div className="space-y-8 flex-1 relative z-10">
                                        <div className="flex flex-wrap gap-2.5">
                                            {provider.services.map(s => (
                                                <Badge key={s} variant="glass" className="bg-blue-600/5 border-blue-500/10 text-blue-400/60 text-[9px] font-black uppercase tracking-[0.2em] italic px-4 py-2 rounded-xl group-hover:text-blue-300 transition-colors">
                                                    {serviceLabels[s] || s}
                                                </Badge>
                                            ))}
                                        </div>
                                        
                                        <div className="space-y-4 pt-8 border-t border-white/5">
                                            <div className="flex items-center gap-4 text-slate-500 hover:text-white transition-all cursor-pointer group/contact">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover/contact:border-blue-500/30 transition-all">
                                                    <Mail size={16} className="text-blue-500/40" />
                                                </div>
                                                <span className="text-[11px] font-black uppercase tracking-widest italic truncate">{provider.email || "NO_REGISTERED_EMAIL"}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-slate-500 hover:text-white transition-all cursor-pointer group/contact">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover/contact:border-blue-500/30 transition-all">
                                                    <Phone size={16} className="text-blue-500/40" />
                                                </div>
                                                <span className="text-[11px] font-black uppercase tracking-widest italic">{provider.phone || "NO_PHONE_RECORD"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Partner Strategy Description */}
                                    <div className="mt-10 pt-8 border-t border-white/5 relative z-10">
                                        <p className="text-[13px] text-slate-500 font-medium leading-relaxed italic line-clamp-2 group-hover:text-slate-400 transition-colors">
                                            "{provider.description || "Parceiro estratégico de infraestrutura cultural integrado via Master Hub Protocol."}"
                                        </p>
                                    </div>

                                    {/* Operational Pulse Indicator */}
                                    {provider.active && (
                                        <div className="absolute top-10 right-10 flex items-center gap-2">
                                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity italic">Active Node</span>
                                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.6)]" />
                                        </div>
                                    )}

                                    {/* Ambient Background Aura */}
                                    <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none group-hover:opacity-100 opacity-20 transition-opacity duration-1000" />
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* SOC Sovereignty Footer */}
            <div className="bg-[#0f172a]/80 p-12 rounded-[56px] border border-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group shadow-2xl border-t-white/10">
                <div className="flex items-center gap-8 relative z-10">
                    <div className="w-20 h-20 bg-blue-600/10 rounded-[28px] flex items-center justify-center text-blue-500 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 border border-blue-500/20 shadow-xl">
                        <Handshake size={40} />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-white font-black text-2xl italic tracking-tighter uppercase italic leading-none">Ecossistema de Parcerias Master</h4>
                        <p className="text-sm text-slate-500 font-medium max-w-xl leading-relaxed italic mt-2">
                            A rede de parceiros homologados garante a paridade de excelência técnica em toda a federação MSV. Novos nodes de serviço exigem validação de governança soberana.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-4 relative z-10">
                    <Badge variant="glass" className="bg-blue-500/10 text-blue-400 border-none px-8 py-4 text-[11px] font-black uppercase tracking-[0.3em] italic rounded-2xl flex items-center gap-3 shadow-xl border border-blue-500/20">
                        <ShieldCheck size={18} /> Network Trust: Sovereign Verified
                    </Badge>
                </div>
                <div className="absolute top-[-50%] right-[-10%] w-[700px] h-[700px] bg-blue-600/5 rounded-full blur-[180px] pointer-events-none" />
            </div>

            {/* Modal de Homologação - Elite Onboarding UI */}
            <AnimatePresence>
                {modalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#0b1120] border-2 border-white/10 w-full max-w-4xl rounded-[64px] shadow-[0_0_80px_rgba(37,99,235,0.2)] overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="p-12 border-b border-white/5 flex items-center justify-between bg-white/[0.02] relative">
                                <div className="flex items-center gap-6 relative z-10">
                                    <div className="w-16 h-16 rounded-[24px] bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-xl">
                                        <Verified size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase leading-none">Homologar Parceiro</h2>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mt-2 italic">Protocolo de Onboarding Global: Nível Soberano</p>
                                    </div>
                                </div>
                                <button onClick={() => setModalOpen(false)} className="w-14 h-14 rounded-2xl bg-white/5 text-slate-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center border border-white/5 group">
                                    <X size={24} className="group-hover:rotate-90 transition-transform" />
                                </button>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
                            </div>

                            <form onSubmit={handleSubmit} className="p-12 overflow-y-auto custom-scrollbar space-y-12 bg-black/20">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4 md:col-span-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic">Nome da Instituição/Prestador</label>
                                        <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="EX: Consultoria de Inclusão Global" className="h-16 bg-white/5 border-white/10 rounded-2xl px-8 text-white font-black italic tracking-tight uppercase" />
                                    </div>

                                    <div className="space-y-4 md:col-span-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic">Proposta de Valor / Bio Estratégica</label>
                                        <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} placeholder="Resumo executivo das competências e diferencial técnico..." className="bg-white/5 border-white/10 rounded-[32px] p-8 text-white font-medium italic leading-relaxed resize-none min-h-[140px]" />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic">Email de Contato Corporativo</label>
                                        <div className="relative">
                                            <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="h-16 bg-white/5 border-white/10 rounded-2xl pl-16 pr-8 font-black text-blue-400 font-mono text-[11px] uppercase tracking-widest" />
                                            <Mail size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic">Telefone/WhatsApp Master</label>
                                        <div className="relative">
                                            <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="h-16 bg-white/5 border-white/10 rounded-2xl pl-16 pr-8 font-black text-blue-400" />
                                            <Phone size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8 p-10 bg-white/[0.01] border-2 border-white/5 rounded-[48px]">
                                    <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] flex items-center gap-4 italic mb-4 leading-none">
                                        <Layers size={18} /> Matriz de Competências Técnicas
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {serviceOptions.map(opt => (
                                            <button
                                                key={opt}
                                                type="button"
                                                onClick={() => handleToggleService(opt)}
                                                className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-500 group/btn ${
                                                    formData.services.includes(opt) 
                                                    ? 'bg-blue-600/10 border-blue-500/40 text-white shadow-[0_0_30px_rgba(37,99,235,0.1)]' 
                                                    : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'
                                                }`}
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-widest italic">{serviceLabels[opt]}</span>
                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${formData.services.includes(opt) ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5'}`}>
                                                    {formData.services.includes(opt) && <CheckCircle size={14} />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-6 pt-10">
                                    <Button variant="glass" type="button" onClick={() => setModalOpen(false)} className="h-20 flex-1 rounded-[24px] border-white/5 text-slate-500 font-black uppercase text-xs tracking-widest hover:bg-rose-500/10 hover:text-rose-500 transition-all shadow-xl">
                                        Abortar Homologação
                                    </Button>
                                    <Button type="submit" className="h-20 flex-[1.5] rounded-[24px] bg-blue-600 text-white font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-blue-600/30 hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center gap-4 group">
                                        Confirmar Node de Serviço <CloudCheck size={20} className="group-hover:scale-110 transition-transform" />
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AnimateIn>
    );
};
