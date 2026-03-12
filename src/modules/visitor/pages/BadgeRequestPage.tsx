import React, { useState, useEffect } from "react";
import { api } from "../../../api/client";
import { Mail, MapPin, BadgeCheck, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import { Button, Input } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import { motion } from "framer-motion";
import { useAuth } from "../../auth/AuthContext";

export const BadgeRequestPage: React.FC = () => {
    const { addToast } = useToast();
    const { isAuthenticated, tenantId: authTenantId } = useAuth();
    const [visitorData, setVisitorData] = useState<any>(null);
    const [visitorId, setVisitorId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        addressName: "",
        addressStreet: "",
        addressCity: "",
        addressState: "",
        addressZip: ""
    });

    useEffect(() => {
        const loadVisitor = async () => {
            try {
                // Get real visitor ID
                const profileRes = await api.get("/visitors/me");
                const vid = profileRes.data.id;
                setVisitorId(vid);

                const res = await api.get(`/visitors/${vid}`);
                setVisitorData(res.data);
                setFormData(prev => ({ ...prev, addressName: res.data.name }));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if(isAuthenticated) loadVisitor();
    }, [isAuthenticated]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post("/badges", {
                visitorId,
                tenantId: authTenantId,
                ...formData
            });
            addToast("Solicitação enviada!", "success");
            // Redirect or show success
        } catch (err) {
            addToast("Erro ao solicitar", "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Carregando...</div>;

    const hasMinXp = (visitorData?.xp || 0) >= 100000;

    return (
        <div className="p-6 pb-24 max-w-xl mx-auto min-h-screen relative">
            {/* AMBIENT BACKGROUND */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full" />
            </div>

            <header className="mb-12 relative z-10">
                <div className="bg-blue-500/10 w-fit p-4 rounded-3xl border border-blue-500/20 mb-6 shadow-xl shadow-blue-500/5">
                    <BadgeCheck className="text-blue-500" size={40} />
                </div>
                <h1 className="text-4xl font-black text-white tracking-tighter mb-2 italic">Embaixador Real</h1>
                <p className="text-slate-500 font-medium leading-relaxed max-w-sm">
                    Sua jornada digital merece um reconhecimento tangível. Solicite seu crachá oficial.
                </p>
            </header>

            {!hasMinXp ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-500/5 border border-red-500/10 p-8 rounded-[40px] mb-8 backdrop-blur-xl relative overflow-hidden"
                >
                     <div className="absolute top-0 right-0 p-4 opacity-10">
                        <AlertCircle size={80} className="text-red-500" />
                     </div>
                     <h3 className="text-red-500 font-black text-xs uppercase tracking-[0.3em] mb-4">Requisito de Nível</h3>
                     <p className="text-slate-400 text-sm leading-relaxed mb-8">
                        Para portar o Crachá de Embaixador, você precisa alcançar a marca de <span className="text-white font-black">100.000 XP</span> no Acervo Global.
                     </p>
                     
                     <div className="bg-black/20 rounded-2xl p-4 border border-white/5 mb-8">
                        <div className="flex justify-between items-end mb-2">
                             <span className="text-[10px] font-black text-slate-500 uppercase">Seu Progresso Atual</span>
                             <span className="text-sm font-black text-white">{visitorData?.xp?.toLocaleString()} / 100.000</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                             <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, ((visitorData?.xp || 0) / 100000) * 100)}%` }}
                                className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
                             />
                        </div>
                     </div>

                     <button 
                        className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-colors"
                        onClick={() => window.history.back()}
                     >
                        Continuar Jornada
                     </button>
                </motion.div>
            ) : (
                <div className="space-y-12 relative z-10">
                    {/* PREVIEW CARD - HIGH FIDELITY */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="aspect-[1.58/1] w-full bg-gradient-to-br from-slate-800 to-slate-950 rounded-[32px] p-8 border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.6)] relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500"
                    >
                        {/* LIGHT EFFECTS */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.15),transparent)] opacity-50" />
                        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[100px] group-hover:bg-blue-500/20 transition-colors" />
                        
                        <div className="flex justify-between items-start relative z-10">
                             <div className="flex flex-col">
                                <span className="text-[8px] font-black text-blue-400 uppercase tracking-[0.4em] mb-1">Passaporte Oficial</span>
                                <div className="font-black text-white text-lg tracking-tighter">QS <span className="opacity-50">CULTURA</span></div>
                             </div>
                             <div className="bg-blue-500 rounded-full p-2 shadow-lg shadow-blue-500/20 border-2 border-white/10">
                                <BadgeCheck className="text-white" size={24} />
                             </div>
                        </div>

                        <div className="mt-10 flex gap-8 items-center relative z-10 px-2">
                            <div className="w-28 h-28 bg-slate-900 rounded-[32px] border-4 border-white/5 flex items-center justify-center overflow-hidden shadow-2xl relative">
                                 <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent" />
                                 <img src={visitorData?.skins?.find((s:any) => s.equipped)?.skin?.imageUrl || "/default_avatar.png"} className="h-[85%] object-contain drop-shadow-xl z-10" alt="Avatar" />
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-2xl font-black text-white tracking-tight leading-none mb-1">{visitorData?.name || "Visitante"}</h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-blue-400 font-black text-[10px] uppercase tracking-widest">Embaixador Lvl {Math.floor((visitorData?.xp || 0) / 10000)}</span>
                                    <div className="w-1 h-1 rounded-full bg-white/20" />
                                    <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Verificado</span>
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end opacity-20 relative z-10 mt-12">
                             <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent mr-20" />
                             <div className="text-[10px] font-black text-white italic">ISSUED 2026</div>
                        </div>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <Input label="Destinatário" value={formData.addressName} onChange={e => setFormData({...formData, addressName: e.target.value})} required />
                            <Input label="Rua, Número e Complemento" value={formData.addressStreet} onChange={e => setFormData({...formData, addressStreet: e.target.value})} required />
                            <div className="grid grid-cols-2 gap-4">
                                 <Input label="Cidade" value={formData.addressCity} onChange={e => setFormData({...formData, addressCity: e.target.value})} required />
                                 <Input label="Estado" value={formData.addressState} onChange={e => setFormData({...formData, addressState: e.target.value})} maxLength={2} required />
                            </div>
                            <Input label="CEP" value={formData.addressZip} onChange={e => setFormData({...formData, addressZip: e.target.value})} required />
                        </div>
                        
                        <div className="pt-6">
                            <button 
                                className="group w-full h-16 rounded-[24px] bg-white text-slate-950 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-2xl shadow-white/5 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50" 
                                type="submit" 
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <div className="w-6 h-6 border-3 border-current border-t-transparent animate-spin rounded-full" />
                                ) : (
                                    <>
                                        Solicitar Crachá Real
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};
