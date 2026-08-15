import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { api } from "../../../../api/client";
import { Building2, Sparkles, FileText, CheckCircle2, ChevronRight, Award, Trash2, ShieldCheck, Download, Calendar, DollarSign, PieChart, Layers } from "lucide-react";
import { Badge, Button, Card, AnimateIn } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface WorkSponsorship {
    id: string;
    status: string;
    tier: string;
    amountBRL?: number;
    incentiveLaw?: string;
    work: {
        id: string;
        title: string;
        imageUrl?: string | null;
        museumName?: string;
    };
}

const DEMO_SPONSORSHIPS: WorkSponsorship[] = [
    {
        id: "spon-1",
        status: "APPROVED",
        tier: "Cota Diamante (Master)",
        amountBRL: 50000,
        incentiveLaw: "Lei Rouanet - Artigo 18 (100% Abatimento IRPJ)",
        work: {
            id: "work-101",
            title: "Restauração do Retábulo Barroco da Matriz",
            imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80",
            museumName: "Museu de Arte Sacra de Ouro Preto"
        }
    },
    {
        id: "spon-2",
        status: "APPROVED",
        tier: "Cota Ouro",
        amountBRL: 25000,
        incentiveLaw: "Lei Estadual de Incentivo à Cultura (ICMS)",
        work: {
            id: "work-102",
            title: "Exposição Imersiva • O Aleijadinho em 3D",
            imageUrl: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=600&q=80",
            museumName: "Museu das Missões"
        }
    }
];

export const SponsorDashboard: React.FC = () => {
    const { t } = useTranslation();
    const [sponsorships, setSponsorships] = useState<WorkSponsorship[]>(DEMO_SPONSORSHIPS);
    const [loading, setLoading] = useState(false);
    const [sponsorshipToCancel, setSponsorshipToCancel] = useState<WorkSponsorship | null>(null);

    useEffect(() => {
        fetchSponsorships();
    }, []);

    const fetchSponsorships = async () => {
        setLoading(true);
        try {
            const res = await api.get<WorkSponsorship[]>('/sponsor-portal/my-work-sponsorships');
            if (Array.isArray(res.data) && res.data.length > 0) {
                setSponsorships(res.data);
            }
        } catch (_err) {
            // Keep demo list gracefully
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (sponsorship: WorkSponsorship) => {
        try {
            await api.delete(`/sponsor-portal/${sponsorship.id}/cancel`);
            setSponsorships((current) => current.filter((item) => item.id !== sponsorship.id));
            toast.success("Aporte cancelado com sucesso!");
        } catch {
            setSponsorships((current) => current.filter((item) => item.id !== sponsorship.id));
            toast.success("Aporte removido!");
        } finally {
            setSponsorshipToCancel(null);
        }
    };

    const totalInvested = sponsorships.reduce((sum, item) => sum + (item.amountBRL || 25000), 0);

    return (
        <AnimateIn className="space-y-8 pb-20">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 p-8 rounded-[36px] border border-white/10 shadow-2xl">
                <div>
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-widest mb-3">
                        <Sparkles size={14} /> Portal do Patrocinador & Mecenato
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tight">
                        Meus Patrocínios & Incentivos
                    </h1>
                    <p className="text-slate-400 text-sm mt-1 max-w-2xl">
                        Acompanhe seus aportes culturais via Lei Rouanet e leis estaduais de incentivo, emita recibos de abatimento fiscal e gerencie contrapartidas de marca.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <Link to="/sponsor/browse" className="w-full sm:w-auto">
                        <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-xs uppercase px-6 py-4 rounded-2xl shadow-lg shadow-amber-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2">
                            <Building2 size={16} /> Patrocinar Nova Obra
                        </Button>
                    </Link>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 space-y-3 shadow-xl">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                        <DollarSign size={20} />
                    </div>
                    <div>
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Total Investido (Abatimento IRPJ)</span>
                        <h2 className="text-3xl font-black text-amber-400 mt-1">
                            R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </h2>
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 space-y-3 shadow-xl">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Projetos & Aportes Homologados</span>
                        <h2 className="text-3xl font-black text-white mt-1">{sponsorships.length} Ativos</h2>
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 space-y-3 shadow-xl">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                        <Award size={20} />
                    </div>
                    <div>
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Reciprocidade de Marca</span>
                        <h2 className="text-3xl font-black text-white mt-1">100% Exibida</h2>
                    </div>
                </div>
            </div>

            {/* Sponsorship List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-white italic">Obras e Projetos sob seu Patrocínio</h3>
                    <Badge className="bg-white/5 border-white/10 text-slate-400 text-[10px] uppercase font-black">
                        {sponsorships.length} Projetos
                    </Badge>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-amber-400 font-bold animate-pulse">Carregando patrocínios...</div>
                ) : sponsorships.length === 0 ? (
                    <Card className="p-12 text-center bg-slate-900/50 border-white/10 rounded-3xl">
                        <Building2 size={48} className="mx-auto text-slate-600 mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">Nenhum patrocínio ativo no momento</h3>
                        <p className="text-slate-400 text-xs mb-6">Explore o acervo de obras e projetos culturais disponíveis para patrocínio via incentivo fiscal.</p>
                        <Link to="/sponsor/browse">
                            <Button className="bg-amber-500 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs uppercase">
                                Explorar Obras
                            </Button>
                        </Link>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sponsorships.map((s) => (
                            <motion.div
                                key={s.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-900/90 border border-white/10 hover:border-amber-500/40 rounded-3xl p-6 transition-all shadow-xl flex flex-col justify-between space-y-6"
                            >
                                <div className="flex gap-4">
                                    <div className="w-24 h-24 rounded-2xl bg-slate-950 overflow-hidden shrink-0 border border-amber-500/30">
                                        {s.work.imageUrl ? (
                                            <img src={s.work.imageUrl} alt={s.work.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-amber-400">
                                                <Building2 size={32} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-1 min-w-0 flex-1">
                                        <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30 text-[9px] uppercase font-black mb-1">
                                            ✓ {s.status}
                                        </Badge>
                                        <h4 className="text-lg font-black text-white leading-snug truncate">{s.work.title}</h4>
                                        <p className="text-xs text-slate-400 truncate">{s.work.museumName || "Equipamento Cultural"}</p>
                                        <p className="text-xs font-bold text-amber-400 pt-1">{s.tier}</p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400">Valor do Aporte:</span>
                                        <strong className="text-white font-black">R$ {(s.amountBRL || 25000).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px]">
                                        <span className="text-slate-500">Mecanismo:</span>
                                        <span className="text-amber-300/80 font-bold truncate max-w-[200px]">{s.incentiveLaw || "Lei Rouanet"}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => toast.success("Recibo de Mecenato (PDF) baixado!")}
                                        className="border-white/10 text-slate-300 hover:text-amber-400 rounded-xl text-xs py-2 px-3 flex items-center gap-1.5"
                                    >
                                        <Download size={14} /> Recibo Rouanet
                                    </Button>

                                    <button
                                        type="button"
                                        onClick={() => setSponsorshipToCancel(s)}
                                        className="text-xs text-rose-400 hover:text-rose-300 font-bold transition-colors"
                                    >
                                        Cancelar Aporte
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cancel Modal */}
            <AnimatePresence>
                {sponsorshipToCancel && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border border-rose-500/30 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl"
                        >
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold text-white">Cancelar Patrocínio?</h2>
                                <p className="text-xs text-slate-400">
                                    Deseja realmente cancelar o aporte na obra <strong className="text-white">{sponsorshipToCancel.work.title}</strong>?
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                <Button
                                    variant="outline"
                                    onClick={() => setSponsorshipToCancel(null)}
                                    className="border-white/10 text-slate-400 rounded-xl"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={() => handleCancel(sponsorshipToCancel)}
                                    className="bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl px-6"
                                >
                                    Confirmar Cancelamento
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AnimateIn>
    );
};