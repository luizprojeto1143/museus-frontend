import React, { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "../../../api/client";
import { useTranslation } from "react-i18next";
import { 
    HandMetal, 
    Plus, 
    Edit, 
    Trash2, 
    CheckCircle, 
    Clock, 
    XCircle,
    Globe,
    Zap,
    ShieldCheck,
    Layers,
    ArrowUpRight,
    Search,
    X,
    MessageSquare,
    Calendar,
    Users,
    MapPin,
    Activity,
    Briefcase,
    Navigation,
    Boxes,
    HardHat,
    LifeBuoy,
    Contact,
    ShieldAlert,
    History,
    RefreshCw,
    SearchCheck,
    Fingerprint,
    Building,
    ExternalLink
} from "lucide-react";
import { 
    Button, 
    Input, 
    Select, 
    Textarea, 
    Card, 
    Badge, 
    AnimateIn,
    AnimatedCounter
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

interface InPersonService {
    id: string;
    name: string;
    description: string | null;
    active: boolean;
    tenantId: string;
}

interface BookingRequest {
    id: string;
    date: string;
    startTime: string | null;
    endTime: string | null;
    status: string;
    participants: number | null;
    inPersonService: InPersonService;
    tenant: { name: string };
    space: { name: string } | null;
    event: { title: string } | null;
    user: { name: string; email: string };
}

export const MasterInPersonServices: React.FC = () => {
    const { t } = useTranslation();
    const [services, setServices] = useState<InPersonService[]>([]);
    const [requests, setRequests] = useState<BookingRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editService, setEditService] = useState<InPersonService | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        active: true,
        tenantId: "8cc9b546-7f7d-4908-a6cf-acdd7b86982b" // QS Inclusão default
    });

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [servicesRes, requestsRes] = await Promise.all([
                api.get("/in-person-services?tenantId=8cc9b546-7f7d-4908-a6cf-acdd7b86982b"),
                api.get("/bookings/in-person?tenantId=8cc9b546-7f7d-4908-a6cf-acdd7b86982b")
            ]);
            setServices(servicesRes.data || []);
            setRequests(requestsRes.data || []);
        } catch (error: any) {
            toast.error("Erro ao sincronizar operações de campo.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSaveService = async () => {
        if (!formData.name) return toast.error("O nome do serviço é obrigatório.");

        try {
            if (editService) {
                await api.put(`/in-person-services/${editService.id}`, formData);
                toast.success("Catálogo operacional atualizado.");
            } else {
                await api.post("/in-person-services", formData);
                toast.success("Novo serviço integrado ao node regional.");
            }
            setIsAddModalOpen(false);
            setEditService(null);
            setFormData({ name: "", description: "", active: true, tenantId: "8cc9b546-7f7d-4908-a6cf-acdd7b86982b" });
            loadData();
        } catch (error: any) {
            toast.error("Erro no protocolo de salvamento tático.");
        }
    };

    const handleDeleteService = async (id: string) => {
        if (!window.confirm("PROTOCOL: Deseja desativar permanentemente este serviço do node?")) return;
        try {
            await api.delete(`/in-person-services/${id}`);
            toast.success("Serviço removido do inventário operacional.");
            loadData();
        } catch (error: any) {
            toast.error("Falha na desativação do protocolo.");
        }
    };

    const openEditModal = (service: InPersonService) => {
        setEditService(service);
        setFormData({ name: service.name, description: service.description || "", active: service.active, tenantId: service.tenantId });
        setIsAddModalOpen(true);
    };

    const handleUpdateBookingStatus = async (id: string, newStatus: string) => {
        try {
            await api.put(`/bookings/${id}`, { status: newStatus });
            toast.success(`Protocolo ${newStatus}: Processamento finalizado.`);
            loadData();
        } catch (error: any) {
            toast.error("Falha na atualização do despacho logístico.");
        }
    };

    if (loading && services.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
            <p className="text-slate-500 font-black animate-pulse uppercase tracking-[0.3em] text-[10px] italic">Sincronizando Operações de Campo...</p>
        </div>
    );

    return (
        <AnimateIn className="space-y-12 pb-32">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-blue-600/10 text-blue-400 border-none px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.4em] italic">
                            Field Operations & Physical Inclusion Sovereignty
                        </Badge>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic leading-none">
                        Operações <span className="text-blue-600">Presenciais</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-xl max-w-3xl leading-relaxed">
                        Gerenciamento tático de serviços locais, mediação de acessibilidade e demandas físicas integradas em toda a rede global.
                    </p>
                </div>
                
                <Card className="p-10 bg-blue-600/5 border-2 border-blue-500/20 rounded-[48px] flex items-center gap-10 group min-w-[320px] shadow-2xl relative overflow-hidden border-t-white/10">
                    <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-all duration-500 shadow-xl border border-blue-500/20">
                        <Navigation size={36} />
                    </div>
                    <div className="space-y-1 relative z-10">
                        <p className="text-[11px] font-black text-blue-400/50 uppercase tracking-[0.3em] italic leading-none mb-1">Solicitações Ativas</p>
                        <p className="text-5xl font-black text-white tracking-tighter italic leading-none">
                            <AnimatedCounter value={requests.length} />
                        </p>
                    </div>
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-600/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-blue-600/10 transition-all" />
                </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                {/* Catalog Section - Elite Service Repository */}
                <Card className="xl:col-span-1 p-12 bg-[#0b1120]/60 border-2 border-white/5 rounded-[64px] space-y-12 h-fit shadow-2xl relative overflow-hidden border-t-white/10">
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[24px] bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-xl">
                                <Briefcase size={32} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tighter italic uppercase leading-none">Catálogo Master</h3>
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] italic mt-1">Serviços Habilitados</p>
                            </div>
                        </div>
                        <Button 
                            onClick={() => {
                                setEditService(null);
                                setFormData({ name: "", description: "", active: true, tenantId: "8cc9b546-7f7d-4908-a6cf-acdd7b86982b" });
                                setIsAddModalOpen(true);
                            }}
                            className="w-14 h-14 p-0 rounded-[22px] bg-blue-600 hover:bg-blue-500 text-white shadow-2xl shadow-blue-600/20 active:scale-95 group transition-all"
                        >
                            <Plus size={28} className="group-hover:rotate-90 transition-transform" />
                        </Button>
                    </div>

                    <div className="space-y-6 relative z-10">
                        {services.length === 0 ? (
                            <div className="py-20 text-center opacity-30 flex flex-col items-center gap-6">
                                <Boxes size={48} className="text-slate-600" />
                                <p className="text-[10px] font-black uppercase tracking-widest italic">Repositório de serviços vazio</p>
                            </div>
                        ) : (
                            services.map((srv, idx) => (
                                <motion.div 
                                    key={srv.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-8 bg-white/[0.02] border-2 border-white/5 rounded-[32px] group hover:bg-white/[0.05] hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden"
                                >
                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div className="space-y-2">
                                            <h4 className="text-lg font-black text-white uppercase tracking-tight italic group-hover:text-blue-400 transition-colors leading-none">{srv.name}</h4>
                                            <div className="flex items-center gap-2">
                                                <Badge className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest italic border-none ${srv.active ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                                                    {srv.active ? "Node Ativo" : "Protocolo Inativo"}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                                            <button onClick={() => openEditModal(srv)} className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all shadow-xl group/btn">
                                                <Edit size={16} className="group-hover/btn:scale-110" />
                                            </button>
                                            <button onClick={() => handleDeleteService(srv.id)} className="w-10 h-10 rounded-xl bg-rose-600/10 text-rose-500/50 flex items-center justify-center border border-rose-500/20 hover:bg-rose-600 hover:text-white transition-all shadow-xl group/btn">
                                                <Trash2 size={16} className="group-hover/btn:scale-110" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-medium italic leading-relaxed line-clamp-2 relative z-10 group-hover:text-slate-400 transition-colors">
                                        "{srv.description || "Diretrizes táticas de atendimento presencial pendentes de definição institucional."}"
                                    </p>
                                    <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-blue-600/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.div>
                            ))
                        )}
                    </div>
                    <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] pointer-events-none" />
                </Card>

                {/* Bookings Section - Tactical Dispatch Manifest */}
                <Card className="xl:col-span-2 p-0 bg-[#0b1120]/60 border-2 border-white/5 rounded-[64px] overflow-hidden shadow-2xl relative border-t-white/10">
                    <div className="p-14 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-10 bg-white/[0.02] relative">
                        <div className="flex items-center gap-8 relative z-10">
                            <div className="w-20 h-20 rounded-[28px] bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shadow-xl group-hover:scale-110 transition-transform">
                                <Calendar size={40} />
                            </div>
                            <div>
                                <h3 className="text-4xl font-black text-white tracking-tighter italic uppercase leading-none">Linha de Atendimento</h3>
                                <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] italic mt-3">Manifesto de Despacho Logístico</p>
                            </div>
                        </div>
                        <Badge variant="glass" className="bg-amber-500/10 text-amber-500 border-none px-10 py-5 text-[11px] font-black uppercase tracking-[0.3em] italic rounded-2xl flex items-center gap-4 shadow-xl border border-amber-500/20">
                            <Activity size={20} className="animate-pulse" /> Dispatch Matrix: Real-Time
                        </Badge>
                        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/[0.02]">
                                    <th className="px-14 py-10 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Instituição / Node</th>
                                    <th className="px-14 py-10 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Serviço Operacional</th>
                                    <th className="px-14 py-10 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Data / Contexto Logístico</th>
                                    <th className="px-14 py-10 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Status</th>
                                    <th className="px-14 py-10 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] italic text-right">Ações de Comando</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {requests.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-14 py-32 text-center opacity-30">
                                            <div className="flex flex-col items-center gap-10">
                                                <div className="w-24 h-24 rounded-[40px] bg-white/5 flex items-center justify-center border-2 border-white/5">
                                                    <SearchCheck size={64} className="text-slate-700" />
                                                </div>
                                                <div className="space-y-4">
                                                    <p className="text-2xl font-black uppercase tracking-[0.4em] text-slate-500 italic leading-none">Terminal Limpo</p>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-700 italic">Nenhuma solicitação presencial pendente de despacho.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    requests.map((req, idx) => (
                                        <tr key={req.id} className="group hover:bg-white/[0.03] transition-all duration-500 cursor-default">
                                            <td className="px-14 py-12">
                                                <div className="flex flex-col gap-2">
                                                    <span className="font-black text-white text-xl tracking-tighter italic uppercase group-hover:text-blue-400 transition-colors leading-none">{req.tenant.name}</span>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 border border-white/5 group-hover:border-blue-500/30 transition-all">
                                                            <Contact size={14} />
                                                        </div>
                                                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest font-mono italic leading-none">{req.user.name}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-14 py-12">
                                                <div className="flex items-center gap-4 group-hover:translate-x-1 transition-transform">
                                                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-500 flex items-center justify-center border border-blue-500/20 shadow-xl group-hover:scale-110 transition-transform">
                                                        <HardHat size={20} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-white font-black text-xs uppercase italic tracking-widest leading-none">{req.inPersonService.name}</span>
                                                        <span className="text-[8px] text-slate-700 font-bold uppercase mt-1">Svc_Code: {req.inPersonService.id.slice(0,6).toUpperCase()}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-14 py-12">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3 text-[11px] font-black text-slate-400 uppercase italic group-hover:text-white transition-colors">
                                                        <Calendar size={16} className="text-amber-500/50" /> {new Date(req.date).toLocaleDateString('pt-BR')}
                                                    </div>
                                                    {req.startTime && (
                                                        <div className="flex items-center gap-3 text-[10px] font-black text-blue-400 uppercase tracking-widest font-mono italic">
                                                            <Clock size={14} className="opacity-40" />
                                                            {new Date(req.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                                                            <span className="mx-2 opacity-20">→</span>
                                                            {req.endTime ? new Date(req.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'END_TS_PENDING'}
                                                        </div>
                                                    )}
                                                    {req.space && (
                                                        <Badge variant="glass" className="bg-white/5 border-2 border-white/5 text-[8px] font-black text-slate-500 px-3 py-1 rounded-lg uppercase tracking-widest italic group-hover:text-blue-300 transition-colors">
                                                            <MapPin size={10} className="mr-2" /> {req.space.name}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-14 py-12">
                                                <span className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] italic shadow-xl ${
                                                    req.status === "PENDING" ? "bg-amber-500/10 text-amber-500 shadow-amber-500/10" : 
                                                    req.status === "CONFIRMED" ? "bg-emerald-500/10 text-emerald-500 shadow-emerald-500/10" : 
                                                    "bg-rose-500/10 text-rose-500 shadow-rose-500/10"
                                                }`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="px-14 py-12 text-right">
                                                <div className="flex gap-4 justify-end items-center">
                                                    {req.status === "PENDING" && (
                                                        <button
                                                            onClick={() => handleUpdateBookingStatus(req.id, "CONFIRMED")}
                                                            className="w-14 h-14 rounded-2xl bg-emerald-500/5 text-emerald-500 border-2 border-emerald-500/20 hover:bg-emerald-600 hover:text-white transition-all shadow-2xl active:scale-95 group/btn"
                                                            title="Confirmar Protocolo"
                                                        >
                                                            <CheckCircle size={24} className="group-hover/btn:scale-110 transition-transform" />
                                                        </button>
                                                    )}
                                                    {(req.status === "PENDING" || req.status === "CONFIRMED") && (
                                                        <button
                                                            onClick={() => handleUpdateBookingStatus(req.id, "CANCELLED")}
                                                            className="w-14 h-14 rounded-2xl bg-rose-500/5 text-rose-500/50 border-2 border-rose-500/20 hover:bg-rose-600 hover:text-white transition-all shadow-2xl active:scale-95 group/btn"
                                                            title="Abortar Missão"
                                                        >
                                                            <XCircle size={24} className="group-hover/btn:scale-110 transition-transform" />
                                                        </button>
                                                    )}
                                                    <div className="w-px h-10 bg-white/5 mx-2" />
                                                    <button className="w-14 h-14 rounded-2xl bg-white/5 text-slate-500 border-2 border-white/5 hover:bg-white hover:text-black transition-all shadow-2xl active:scale-95 group/btn">
                                                        <ExternalLink size={24} className="group-hover/btn:scale-110" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Strategic SOC Footer */}
            <div className="bg-[#0f172a]/80 p-14 rounded-[64px] border-2 border-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group shadow-2xl border-t-white/10">
                <div className="flex items-center gap-10 relative z-10">
                    <div className="w-24 h-24 bg-blue-600/10 rounded-[32px] flex items-center justify-center text-blue-500 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 border border-blue-500/20 shadow-2xl relative overflow-hidden">
                        <LifeBuoy size={48} />
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent" />
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-white font-black text-3xl italic tracking-tighter uppercase italic leading-none">Soberania de Atendimento Local</h4>
                        <p className="text-sm text-slate-500 font-medium max-w-2xl leading-relaxed italic mt-2">
                            A coordenação de serviços presenciais garante a paridade de acesso físico em toda a malha de museus federados. O despacho tático assegura que a inclusão seja palpável em cada node regional.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-6 relative z-10">
                    <Badge variant="glass" className="bg-blue-500/10 text-blue-400 border-none px-12 py-6 text-[12px] font-black uppercase tracking-[0.4em] italic rounded-[24px] flex items-center gap-4 shadow-2xl border border-blue-500/20">
                        <Fingerprint size={24} /> Ops Status: Sovereign Verified
                    </Badge>
                </div>
                <div className="absolute top-[-50%] right-[-10%] w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[200px] pointer-events-none" />
                <div className="absolute left-[-5%] bottom-[-10%] w-[300px] h-[300px] bg-amber-600/5 rounded-full blur-[120px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Protocol Definition Tablet - Elite Modal UI */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-10 bg-black/90 backdrop-blur-3xl">
                        <motion.div 
                            initial={{ scale: 0.9, y: 30, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 30, opacity: 0 }}
                            transition={{ duration: 0.5, ease: "circOut" }}
                            className="bg-[#0b1120] border-2 border-white/10 rounded-[72px] p-16 max-w-2xl w-full relative overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.2)] z-10 border-t-white/20"
                        >
                            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]" />
                            
                            <button 
                                onClick={() => setIsAddModalOpen(false)}
                                className="absolute top-10 right-10 w-16 h-16 rounded-[24px] bg-white/5 text-slate-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center border-2 border-white/5 group"
                            >
                                <X size={32} className="group-hover:rotate-90 transition-transform" />
                            </button>

                            <div className="text-center mb-16 space-y-3">
                                <h3 className="text-white font-black text-4xl tracking-tighter italic uppercase leading-none">{editService ? "Revisar Protocolo" : "Novo Serviço Tático"}</h3>
                                <p className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] mt-1 italic">Definição de Atendimento de Campo Master</p>
                            </div>
                            
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-8 italic">Identificação Institucional do Serviço</label>
                                    <Input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: Mediação de Acessibilidade Plena"
                                        className="h-16 bg-white/5 border-2 border-white/10 rounded-[28px] px-8 text-white font-black italic tracking-tight uppercase focus:border-blue-500/50 transition-all"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-8 italic">Diretrizes Operacionais de Atendimento</label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        rows={4}
                                        placeholder="Descreva o escopo, requisitos e diretrizes táticas deste serviço presencial..."
                                        className="bg-white/5 border-2 border-white/10 rounded-[32px] p-8 text-white font-medium italic leading-relaxed resize-none min-h-[160px] focus:border-blue-500/50 transition-all"
                                    />
                                </div>

                                <div className="p-8 bg-white/5 rounded-[32px] border-2 border-white/10 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${formData.active ? "bg-emerald-500/10 text-emerald-500 shadow-lg shadow-emerald-500/10" : "bg-white/5 text-slate-700"}`}>
                                            <Zap size={24} fill={formData.active ? "currentColor" : "none"} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black text-white uppercase tracking-[0.2em] italic">Disponibilidade Global</span>
                                            <span className="text-[9px] font-bold text-slate-600 uppercase mt-1 italic tracking-widest">Habilitar agendamento em todos os nodes</span>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={formData.active}
                                        onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                        className="w-10 h-10 accent-blue-600 cursor-pointer scale-125"
                                    />
                                </div>

                                <div className="flex gap-6 pt-6">
                                    <Button
                                        onClick={() => setIsAddModalOpen(false)}
                                        variant="glass"
                                        className="h-20 flex-1 rounded-[28px] border-white/10 text-slate-500 font-black uppercase text-xs tracking-widest hover:text-white"
                                    >
                                        Abortar Protocolo
                                    </Button>
                                    <Button
                                        onClick={handleSaveService}
                                        className="h-20 flex-[2] rounded-[28px] bg-blue-600 text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/30 hover:bg-blue-500 transition-all flex items-center justify-center gap-4 group/save"
                                    >
                                        {editService ? 'Confirmar Revisão' : 'Integrar ao Node Global'} <ShieldCheck size={24} className="group-hover/save:scale-110" />
                                    </Button>
                                </div>
                            </div>
                            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AnimateIn>
    );
};
