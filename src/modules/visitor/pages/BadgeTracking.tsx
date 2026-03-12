import React, { useState, useEffect } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Package, Truck, CheckCircle, Clock, AlertCircle, ChevronRight, BadgeCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BadgeRequest {
    id: string;
    level: number;
    status: string;
    trackingCode: string | null;
    requestedAt: string;
    skinImageUrl: string;
}

const statusConfig: Record<string, { label: string, color: string, icon: any }> = {
    PENDING: { label: "Em Análise", color: "text-amber-500", icon: Clock },
    APPROVED: { label: "Aprovado", color: "text-blue-500", icon: BadgeCheck },
    PRINTING: { label: "Em Impressão", color: "text-purple-500", icon: Package },
    SHIPPED: { label: "Enviado", color: "text-green-500", icon: Truck },
    DELIVERED: { label: "Entregue", color: "text-emerald-500", icon: CheckCircle },
    REJECTED: { label: "Recusado", color: "text-red-500", icon: AlertCircle },
};

const levelNames = ["", "Bronze", "Prata", "Ouro", "Platina"];

export const BadgeTracking: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [requests, setRequests] = useState<BadgeRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get("/badges/my");
                setRequests(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (isAuthenticated) load();
    }, [isAuthenticated]);

    if (loading) return <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Consultando Registros...</div>;

    return (
        <div className="p-6 pb-32 max-w-2xl mx-auto min-h-screen">
            <header className="mb-12">
                <h1 className="text-4xl font-black text-white tracking-tighter mb-2 italic">Rastreio de Crachá</h1>
                <p className="text-slate-500 font-medium leading-relaxed">Acompanhe o status do seu reconhecimento físico.</p>
            </header>

            <div className="space-y-6">
                {requests.map((req) => {
                    const config = statusConfig[req.status] || statusConfig.PENDING;
                    const Icon = config.icon;

                    return (
                        <motion.div 
                            key={req.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-900/60 border border-white/10 rounded-[40px] p-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Icon size={120} className={config.color} />
                            </div>

                            <div className="flex gap-8 items-center relative z-10">
                                <div className="w-24 h-24 bg-slate-950 rounded-[32px] border-4 border-white/5 flex items-center justify-center p-4 shadow-inner">
                                    <img src={req.skinImageUrl} className="h-full object-contain drop-shadow-2xl" alt="Skin" />
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-xl bg-white/5 ${config.color}`}>
                                            <Icon size={18} />
                                        </div>
                                        <span className={`font-black text-xs uppercase tracking-[0.2em] ${config.color}`}>
                                            {config.label}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-black text-white mb-1">Passaporte {levelNames[req.level]}</h3>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                        Solicitado em {new Date(req.requestedAt).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            </div>

                            {req.trackingCode && (
                                <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-center bg-white/5 -mx-8 px-8 group-hover:bg-white/10 transition-colors">
                                    <div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Código de Rastreio</span>
                                        <code className="text-blue-400 font-mono font-bold text-sm tracking-widest">{req.trackingCode}</code>
                                    </div>
                                    <button className="p-3 bg-blue-500 rounded-2xl text-white shadow-xl shadow-blue-500/20">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    );
                })}

                {requests.length === 0 && (
                    <div className="text-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10">
                        <div className="w-20 h-20 bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                            <Truck className="text-slate-700" size={32} />
                        </div>
                        <h3 className="text-white font-black uppercase text-xs tracking-[0.2em] mb-2">Nenhum Pedido</h3>
                        <p className="text-slate-500 text-xs font-medium px-12 leading-relaxed">
                            Você ainda não solicitou um crachá físico. Atinja 100k XP para desbloquear esta recompensa especial.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
