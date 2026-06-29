import React, { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "../../../api/client";
import { 
    BadgeCheck, 
    Clock, 
    CheckCircle, 
    XCircle, 
    Truck, 
    Download, 
    Search, 
    User, 
    Eye, 
    X, 
    Star,
    Globe,
    Zap,
    ShieldCheck,
    Layers,
    ArrowUpRight,
    MapPin,
    Hash,
    Printer,
    Package,
    ShieldAlert,
    Navigation,
    Boxes,
    Scan,
    FileSearch,
    RefreshCw,
    Fingerprint,
    Activity,
    CreditCard
} from "lucide-react";
import { 
    Button, 
    Input, 
    Card, 
    Badge, 
    AnimateIn,
    AnimatedCounter
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

interface BadgeRequest {
    id: string;
    level: number;
    status: string;
    requestedAt: string;
    addressName: string;
    addressStreet: string;
    addressCity: string;
    addressZip: string;
    xpAtRequest: number;
    trackingCode?: string;
    pdfUrl?: string;
    visitor: {
        name: string;
        email: string;
        skins?: { equipped: boolean; skin: { imageUrl: string } }[];
    };
    tenant: {
        name: string;
    }
}

export const MasterBadgeQueue: React.FC = () => {
    const [requests, setRequests] = useState<BadgeRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("PENDING");
    const [previewBadge, setPreviewBadge] = useState<BadgeRequest | null>(null);

    const loadRequests = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get("/badges/queue");
            setRequests(res.data || []);
        } catch (err: any) {
            toast.error("Erro ao sincronizar terminal logístico.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    const handleUpdateStatus = async (id: string, status: string) => {
        let trackingCode = "";
        if (status === "SHIPPED") {
            trackingCode = window.prompt("PROTOCOL: Informe o código de rastreamento oficial:") || "";
            if (!trackingCode) return;
        }

        try {
            await api.put(`/badges/${id}/status`, { status, trackingCode });
            toast.success(`Logística: ${status} processado.`);
            loadRequests();
        } catch (err: any) {
            toast.error("Falha no protocolo de atualização.");
        }
    };

    const filtered = useMemo(() => {
        return requests.filter(r => filter === "ALL" || r.status === filter);
    }, [requests, filter]);

    const getStatusBadge = (status: string) => {
        const baseClass = "px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border-none shadow-lg italic";
        switch(status) {
            case "PENDING": return <Badge className={`${baseClass} bg-amber-500/10 text-amber-500`}>Aguardando Triagem</Badge>;
            case "APPROVED": return <Badge className={`${baseClass} bg-blue-600/10 text-blue-400`}>Pronto p/ Produção</Badge>;
            case "SHIPPED": return <Badge className={`${baseClass} bg-indigo-600/10 text-indigo-400 animate-pulse`}>Em Trânsito</Badge>;
            case "DELIVERED": return <Badge className={`${baseClass} bg-emerald-500/10 text-emerald-500`}>Entregue</Badge>;
            case "REJECTED": return <Badge className={`${baseClass} bg-rose-500/10 text-rose-500`}>Negado</Badge>;
            default: return <Badge variant="glass">{status}</Badge>;
        }
    };

    if (loading && requests.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(79,70,229,0.4)]" />
            <p className="text-slate-500 font-black animate-pulse uppercase tracking-[0.3em] text-[10px] italic">Sincronizando Nodes Logísticos...</p>
        </div>
    );

    return (
        <AnimateIn className="space-y-12 pb-32">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-indigo-600/10 text-indigo-400 border-none px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.4em] italic">
                            Phygital Logistics & Reward Sovereignty
                        </Badge>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic leading-none">
                        Fila de <span className="text-indigo-500">Crachás</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-xl max-w-3xl leading-relaxed">
                        Gerenciamento global de emissão, produção e logística de identificações físicas para os embaixadores da rede cultural.
                    </p>
                </div>
                
                <Card className="p-10 bg-indigo-600/5 border-2 border-indigo-500/20 rounded-[48px] flex items-center gap-10 group min-w-[320px] shadow-2xl relative overflow-hidden border-t-white/10">
                    <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-all duration-500 shadow-xl border border-indigo-500/20">
                        <Package size={36} />
                    </div>
                    <div className="space-y-1 relative z-10">
                        <p className="text-[11px] font-black text-indigo-400/50 uppercase tracking-[0.3em] italic leading-none mb-1">Pendentes em Triagem</p>
                        <p className="text-5xl font-black text-white tracking-tighter italic leading-none">
                            <AnimatedCounter value={requests.filter(r => r.status === 'PENDING').length} />
                        </p>
                    </div>
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-600/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-indigo-600/10 transition-all" />
                </Card>
            </div>

            {/* Logistics Terminal Filters */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-10 bg-[#0b1120]/60 p-5 rounded-[40px] border-2 border-white/5 shadow-2xl backdrop-blur-xl border-t-white/10">
                <div className="flex flex-wrap items-center gap-4">
                    {["PENDING", "APPROVED", "SHIPPED", "ALL"].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-10 py-5 rounded-[22px] text-[10px] font-black uppercase tracking-[0.2em] italic transition-all duration-500 shadow-lg ${filter === s ? 'bg-indigo-600 text-white shadow-indigo-600/20' : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white border border-white/5'}`}
                        >
                            {s === "ALL" ? "Manifesto Global" : s === "PENDING" ? "Triagem" : s === "APPROVED" ? "Produção" : "Em Trânsito"}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-6 pr-6">
                    <Button onClick={loadRequests} variant="glass" className="h-14 px-8 rounded-2xl border-white/10 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all">
                        <RefreshCw size={18} className={`mr-3 ${loading ? 'animate-spin' : ''}`} /> Sincronizar
                    </Button>
                    <Badge variant="glass" className="bg-emerald-500/10 text-emerald-500 border-none px-6 py-3 text-[9px] font-black uppercase tracking-[0.3em] italic rounded-xl flex items-center gap-3">
                        <Globe size={14} className="animate-pulse" /> Logística: Online
                    </Badge>
                </div>
            </div>

            {/* Operations Matrix */}
            <Card className="p-0 bg-[#0b1120]/60 border-2 border-white/5 rounded-[64px] overflow-hidden shadow-2xl border-t-white/10">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02]">
                                <th className="px-14 py-10 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Embaixador / Node Destino</th>
                                <th className="px-14 py-10 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Prestígio & Rank</th>
                                <th className="px-14 py-10 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Data Protocolo</th>
                                <th className="px-14 py-10 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Status Operacional</th>
                                <th className="px-14 py-10 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic text-right">Ações de Comando</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map((req, idx) => (
                                <tr key={req.id} className="group hover:bg-white/[0.03] transition-all duration-500 cursor-default">
                                    <td className="px-14 py-12">
                                        <div className="flex items-center gap-8">
                                            <div className="w-20 h-20 rounded-[28px] bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-950 border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-2xl group-hover:border-indigo-500/40 group-hover:rotate-6 transition-all duration-700 relative">
                                                <img src={req.visitor.skins?.[0]?.skin?.imageUrl || "/default_avatar.png"} className="h-[85%] object-contain drop-shadow-[0_0_15px_rgba(37,99,235,0.3)] z-10" alt="" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <span className="font-black text-white text-2xl tracking-tighter italic group-hover:text-indigo-400 transition-colors leading-none">{req.addressName}</span>
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="glass" className="bg-indigo-600/10 text-indigo-400 border-none text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg italic">{req.tenant.name}</Badge>
                                                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest font-mono italic truncate max-w-[200px]">{req.visitor.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-14 py-12">
                                        <div className={`flex flex-col gap-2 font-black italic group-hover:translate-x-1 transition-transform ${
                                            req.level === 4 ? "text-amber-500" : req.level === 3 ? "text-purple-400" : "text-blue-400"
                                        }`}>
                                            <div className="flex items-center gap-2 text-lg tracking-[0.2em] leading-none uppercase">
                                                <Star size={18} fill="currentColor" className="drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" /> Rank {req.level}
                                            </div>
                                            <span className="text-[9px] text-slate-600 uppercase tracking-widest not-italic italic">{req.xpAtRequest} XP Sincronizado</span>
                                        </div>
                                    </td>
                                    <td className="px-14 py-12">
                                        <div className="flex flex-col gap-1 text-slate-400 font-black text-sm uppercase italic tracking-widest group-hover:text-white transition-colors">
                                            {new Date(req.requestedAt).toLocaleDateString('pt-BR')}
                                            <span className="text-[9px] text-slate-700">PROTO_ID: {req.id.slice(0,8).toUpperCase()}</span>
                                        </div>
                                    </td>
                                    <td className="px-14 py-12">
                                        {getStatusBadge(req.status)}
                                    </td>
                                    <td className="px-14 py-12 text-right">
                                        <div className="flex gap-4 justify-end items-center">
                                            <button 
                                                className="w-14 h-14 flex items-center justify-center bg-white/5 text-blue-400 rounded-2xl border-2 border-white/5 hover:bg-blue-600 hover:text-white hover:border-blue-500/30 transition-all shadow-2xl active:scale-95 group/btn" 
                                                title="Inspeção de Identidade"
                                                onClick={() => setPreviewBadge(req)}
                                            >
                                                <Eye size={24} className="group-hover/btn:scale-110 transition-transform" />
                                            </button>
                                            
                                            <div className="w-px h-10 bg-white/5 mx-2" />

                                            <div className="flex gap-2">
                                                {req.status === "PENDING" && (
                                                    <>
                                                        <button className="w-14 h-14 flex items-center justify-center bg-emerald-500/5 text-emerald-500 rounded-2xl border-2 border-emerald-500/10 hover:bg-emerald-600 hover:text-white transition-all shadow-xl active:scale-95 group/btn" title="Aprovar Protocolo" onClick={() => handleUpdateStatus(req.id, "APPROVED")}>
                                                            <CheckCircle size={24} className="group-hover/btn:scale-110 transition-transform" />
                                                        </button>
                                                        <button className="w-14 h-14 flex items-center justify-center bg-rose-500/5 text-rose-500 rounded-2xl border-2 border-rose-500/10 hover:bg-rose-600 hover:text-white transition-all shadow-xl active:scale-95 group/btn" title="Rejeitar Protocolo" onClick={() => handleUpdateStatus(req.id, "REJECTED")}>
                                                            <XCircle size={24} className="group-hover/btn:scale-110 transition-transform" />
                                                        </button>
                                                    </>
                                                )}
                                                {req.status === "APPROVED" && (
                                                    <button className="w-14 h-14 flex items-center justify-center bg-indigo-600/10 text-indigo-400 rounded-2xl border-2 border-indigo-500/20 hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95 group/btn" title="Despachar Logística" onClick={() => handleUpdateStatus(req.id, "SHIPPED")}>
                                                        <Truck size={24} className="group-hover/btn:scale-110 transition-transform" />
                                                    </button>
                                                )}
                                                <button 
                                                    className="w-14 h-14 flex items-center justify-center bg-white/5 text-slate-500 rounded-2xl border-2 border-white/5 hover:bg-white hover:text-black transition-all shadow-xl active:scale-95 group/btn" 
                                                    title="Imprimir Protocolo Físico" 
                                                    onClick={() => window.open(`${import.meta.env.VITE_API_URL}/badges/${req.id}/print`)}
                                                >
                                                    <Printer size={24} className="group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Strategic SOC Footer */}
            <div className="bg-[#0f172a]/80 p-14 rounded-[64px] border-2 border-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group shadow-2xl border-t-white/10">
                <div className="flex items-center gap-10 relative z-10">
                    <div className="w-24 h-24 bg-indigo-600/10 rounded-[32px] flex items-center justify-center text-indigo-500 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 border border-indigo-500/20 shadow-2xl relative overflow-hidden">
                        <Navigation size={48} />
                        <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent" />
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-white font-black text-3xl italic tracking-tighter uppercase italic leading-none">Logística Phygital Master</h4>
                        <p className="text-sm text-slate-500 font-medium max-w-2xl leading-relaxed italic mt-2">
                            A emissão de recompensas físicas é o elo final entre a experiência digital e a honra institucional. O terminal de despacho garante a integridade de entrega em toda a rede global.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-6 relative z-10">
                    <Badge variant="glass" className="bg-indigo-500/10 text-indigo-400 border-none px-12 py-6 text-[12px] font-black uppercase tracking-[0.4em] italic rounded-[24px] flex items-center gap-4 shadow-2xl border border-indigo-500/20">
                        <Boxes size={24} /> Supply Chain: Secured
                    </Badge>
                </div>
                <div className="absolute top-[-50%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[200px] pointer-events-none" />
                <div className="absolute left-[-5%] bottom-[-10%] w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* BADGE INSPECTION CHAMBER - Elite Preview UI */}
            <AnimatePresence>
                {previewBadge && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-10">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#020617]/98 backdrop-blur-3xl"
                            onClick={() => setPreviewBadge(null)}
                        />
                        <motion.div 
                            initial={{ scale: 0.9, y: 30, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 30, opacity: 0 }}
                            className="bg-[#0b1120] border-2 border-white/10 rounded-[72px] p-16 max-w-2xl w-full relative overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.2)] z-10 border-t-white/20"
                        >
                            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
                            
                            <button 
                                onClick={() => setPreviewBadge(null)}
                                className="absolute top-10 right-10 w-16 h-16 rounded-[24px] bg-white/5 text-slate-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center border-2 border-white/5 group"
                            >
                                <X size={32} className="group-hover:rotate-90 transition-transform" />
                            </button>

                            <div className="text-center mb-16 space-y-3">
                                <h3 className="text-white font-black text-4xl tracking-tighter italic uppercase leading-none">Inspeção de Identidade</h3>
                                <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] mt-1 italic">Ativo Físico v4.0: Phygital Protocol Verified</p>
                            </div>
                            
                            <div className="flex justify-center mb-16 relative">
                                <div className="aspect-[2/3] w-72 bg-[#020617] rounded-[64px] border-[12px] border-white/10 p-10 relative flex flex-col items-center shadow-2xl overflow-hidden group/badge ring-2 ring-indigo-500/20 transform hover:scale-105 transition-transform duration-700">
                                     <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-purple-600/10 opacity-50" />
                                     <div className="w-20 h-2 bg-white/10 rounded-full mb-14 shadow-inner" />
                                     
                                     <div className="w-40 h-40 bg-slate-900 rounded-[48px] border-2 border-white/10 flex items-center justify-center mb-10 relative shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]">
                                        <div className="absolute inset-0 bg-indigo-600/15 blur-3xl animate-pulse rounded-full" />
                                        <img src={previewBadge.visitor.skins?.[0]?.skin?.imageUrl || "/default_avatar.png"} className="h-[85%] object-contain drop-shadow-[0_20px_30px_rgba(37,99,235,0.5)] z-10" alt="" />
                                     </div>
                                     
                                     <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10" />
                                     
                                     <div className="font-black text-white text-3xl tracking-tighter px-4 leading-none mb-3 uppercase italic text-center drop-shadow-xl">{previewBadge.addressName.split(' ')[0]}</div>
                                     <div className="text-[10px] text-indigo-400 uppercase tracking-[0.3em] font-black mb-2 italic">CULTURAL AMBASSADOR</div>
                                     <div className="flex items-center gap-1.5 text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                                        {[...Array(previewBadge.level)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                     </div>
                                     
                                     <div className="mt-auto pt-10 flex justify-between w-full opacity-20 border-t border-white/5">
                                        <div className="text-[9px] font-black uppercase tracking-widest font-mono">NODE_{previewBadge.tenant.name.slice(0,3).toUpperCase()}</div>
                                        <div className="text-[9px] font-black font-mono tracking-widest italic">© 2026 MSV</div>
                                     </div>
                                     {/* Holographic Swipe */}
                                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full group-hover/badge:translate-x-full transition-transform duration-1000 ease-in-out" />
                                </div>
                                <div className="absolute -z-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
                            </div>

                            <div className="space-y-6">
                                <Card className="p-8 bg-black/40 border-2 border-white/5 rounded-[32px] space-y-5 shadow-inner">
                                    <div className="flex items-center gap-4 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] italic">
                                        <MapPin size={18} className="text-indigo-400" /> Logística de Destino
                                    </div>
                                    <div className="text-white text-base font-bold leading-relaxed opacity-80 italic pl-8 border-l-2 border-indigo-500/20">
                                        {previewBadge.addressStreet}<br/>
                                        {previewBadge.addressCity} - {previewBadge.addressZip}
                                    </div>
                                </Card>

                                <div className="flex gap-4">
                                    <Button 
                                        variant="glass"
                                        className="h-20 flex-1 rounded-[24px] border-white/5 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:text-white"
                                        onClick={() => setPreviewBadge(null)}
                                    >
                                        Fechar Inspeção
                                    </Button>
                                    <Button 
                                        className="h-20 flex-[2] rounded-[24px] bg-indigo-600 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all flex items-center justify-center gap-4 group/dl" 
                                        onClick={() => window.open(`${import.meta.env.VITE_API_URL}/badges/${previewBadge.id}/print`)}
                                    >
                                        Gerar Ativo p/ Impressão <Download size={22} className="group-hover/dl:translate-y-1 transition-transform" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AnimateIn>
    );
};
