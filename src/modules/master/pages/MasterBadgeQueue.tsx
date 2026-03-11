import React, { useState, useEffect } from "react";
import { api } from "../../../api/client";
import { BadgeCheck, Clock, CheckCircle, XCircle, Truck, Download, Search, User, Eye, X, Star } from "lucide-react";
import { Button, Input } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import "./MasterShared.css";

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
    const { addToast } = useToast();
    const [requests, setRequests] = useState<BadgeRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("PENDING");
    const [previewBadge, setPreviewBadge] = useState<BadgeRequest | null>(null);

    const loadRequests = async () => {
        try {
            const res = await api.get("/badges/queue");
            setRequests(res.data);
        } catch (err) {
            addToast("Erro ao carregar fila", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleUpdateStatus = async (id: string, status: string) => {
        let trackingCode = "";
        if (status === "SHIPPED") {
            trackingCode = window.prompt("Informe o código de rastreamento:") || "";
            if (!trackingCode) return;
        }

        try {
            await api.put(`/badges/${id}/status`, { status, trackingCode });
            addToast(`Status atualizado para ${status}`, "success");
            loadRequests();
        } catch (err) {
            addToast("Erro ao atualizar", "error");
        }
    };

    const filtered = requests.filter(r => filter === "ALL" || r.status === filter);

    const getStatusLabel = (status: string) => {
        const getColors = () => {
            switch(status) {
                case "PENDING": return { bg: "rgba(249, 115, 22, 0.2)", color: "#fb923c" };
                case "APPROVED": return { bg: "rgba(59, 130, 246, 0.2)", color: "#60a5fa" };
                case "SHIPPED": return { bg: "rgba(34, 197, 94, 0.2)", color: "#4ade80" };
                case "DELIVERED": return { bg: "rgba(16, 185, 129, 0.2)", color: "#10b981" };
                case "REJECTED": return { bg: "rgba(239, 68, 68, 0.2)", color: "#f87171" };
                default: return { bg: "rgba(255, 255, 255, 0.1)", color: "#fff" };
            }
        };
        const c = getColors();
        return (
            <span className="master-badge" style={{ backgroundColor: c.bg, color: c.color, border: 'none' }}>
                {status}
            </span>
        );
    };

    return (
        <div className="master-page-container">
            <section className="master-hero">
                <span className="master-badge">📫 Logística de Fidelidade</span>
                <h1 className="master-title">Fila de Crachás</h1>
                <p className="master-subtitle">Gerencie as solicitações de embaixadores culturais de todos os municípios.</p>
            </section>

            <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                {["PENDING", "APPROVED", "SHIPPED", "ALL"].map(s => (
                    <button 
                        key={s} 
                        onClick={() => setFilter(s)}
                        className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                            filter === s 
                            ? "bg-white text-slate-950 shadow-xl shadow-white/10" 
                            : "bg-white/5 text-slate-500 hover:bg-white/10"
                        }`}
                    >
                        {s === "ALL" ? "Todos" : s}
                    </button>
                ))}
            </div>

            <div className="master-card overflow-hidden border-white/10 bg-gradient-to-b from-white/5 to-transparent">
                <div className="master-table-container">
                    <table className="master-table">
                        <thead>
                            <tr>
                                <th>Solicitante</th>
                                <th>Município</th>
                                <th>Nível</th>
                                <th>Data</th>
                                <th>Status</th>
                                <th className="text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(req => (
                                <tr key={req.id} className="group hover:bg-white/5 transition-colors">
                                    <td>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-[14px] bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-blue-500/30 transition-colors">
                                                <img src={req.visitor.skins?.[0]?.skin?.imageUrl || "/default_avatar.png"} className="h-[80%] object-contain drop-shadow-lg" alt="" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-white tracking-tight">{req.addressName}</span>
                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{req.visitor.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-xs font-bold text-slate-400 inline-block">
                                            {req.tenant.name}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`flex items-center gap-1 font-black text-xs uppercase tracking-widest ${
                                            req.level === 4 ? "text-yellow-500" : req.level === 3 ? "text-purple-400" : "text-blue-400"
                                        }`}>
                                            <Star size={12} fill="currentColor" /> Lvl {req.level}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-[11px] font-bold text-slate-500">
                                            {new Date(req.requestedAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td>{getStatusLabel(req.status)}</td>
                                    <td>
                                        <div className="flex gap-2 justify-end">
                                            <button 
                                                className="p-3 hover:bg-blue-500/10 text-blue-400 rounded-[14px] transition-all border border-transparent hover:border-blue-500/20 shadow-lg" 
                                                title="Visualizar Design"
                                                onClick={() => setPreviewBadge(req)}
                                            >
                                                <Eye size={18} />
                                            </button>
                                            
                                            {req.status === "PENDING" && (
                                                <>
                                                    <button className="p-3 hover:bg-green-500/10 text-green-500 rounded-[14px] transition-all border border-transparent hover:border-green-500/20" title="Aprovar" onClick={() => handleUpdateStatus(req.id, "APPROVED")}>
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button className="p-3 hover:bg-red-500/10 text-red-500 rounded-[14px] transition-all border border-transparent hover:border-red-500/20" title="Rejeitar" onClick={() => handleUpdateStatus(req.id, "REJECTED")}>
                                                        <XCircle size={18} />
                                                    </button>
                                                </>
                                            )}
                                            {req.status === "APPROVED" && (
                                                <button className="p-3 hover:bg-purple-500/10 text-purple-400 rounded-[14px] transition-all border border-transparent hover:border-purple-500/20" title="Despachar" onClick={() => handleUpdateStatus(req.id, "SHIPPED")}>
                                                    <Truck size={18} />
                                                </button>
                                            )}
                                            <button className="p-3 hover:bg-white/10 text-slate-400 rounded-[14px] transition-all border border-transparent hover:border-white/10" title="Baixar Arte" onClick={() => window.open(req.pdfUrl)}>
                                                <Download size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* BADGE PREVIEW MODAL */}
            <AnimatePresence>
                {previewBadge && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-slate-900 border border-white/10 rounded-[48px] p-10 max-w-sm w-full text-center relative overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.8)]"
                        >
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500" />
                            
                            <button 
                                onClick={() => setPreviewBadge(null)}
                                className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <h3 className="text-white font-black text-xl mb-10 tracking-tight">Design de Impressão</h3>
                            
                            <div className="aspect-[2/3] bg-gradient-to-b from-slate-800 to-slate-950 rounded-[40px] border-[6px] border-white/5 p-8 relative flex flex-col items-center shadow-2xl overflow-hidden group">
                                 <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                 <div className="w-16 h-1.5 bg-white/5 rounded-full mb-12" />
                                 
                                 <div className="w-28 h-28 bg-white/5 rounded-[32px] border border-white/5 flex items-center justify-center mb-8 relative">
                                    <div className="absolute inset-0 bg-blue-500/10 blur-xl animate-pulse" />
                                    <img src={previewBadge.visitor.skins?.[0]?.skin?.imageUrl || "/default_avatar.png"} className="h-[85%] object-contain drop-shadow-2xl z-10" alt="" />
                                 </div>
                                 
                                 <div className="w-full h-px bg-white/5 mb-8" />
                                 
                                 <div className="font-black text-white text-2xl tracking-tighter px-4 leading-none mb-2 uppercase italic">{previewBadge.addressName.split(' ')[0]}</div>
                                 <div className="text-[9px] text-blue-400 uppercase tracking-[0.2em] font-black mb-1">Embaixador da Cultura</div>
                                 <div className="flex items-center gap-1 text-yellow-500">
                                    {[...Array(previewBadge.level)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                                 </div>
                                 
                                 <div className="mt-auto pt-8 flex justify-between w-full opacity-20 border-t border-white/5">
                                    <div className="text-[10px] font-black uppercase tracking-widest">QS SaaS</div>
                                    <div className="text-[10px] font-black">2026</div>
                                 </div>
                            </div>

                            <div className="mt-10 flex gap-4">
                                <Button className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest" onClick={() => window.open(previewBadge.pdfUrl)}>
                                    Download arte
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
