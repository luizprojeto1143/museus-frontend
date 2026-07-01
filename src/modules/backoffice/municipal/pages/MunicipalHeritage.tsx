import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
    Landmark,
    AlertCircle,
    CheckCircle2,
    Clock,
    Search,
    Shield,
    FileText,
    Hammer,
    ArrowRight
} from "lucide-react";
import { 
    Button, 
    Badge, 
    AnimateIn, 
    Card 
} from "@/components/ui";
import { motion } from "framer-motion";

export const MunicipalHeritage: React.FC = () => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState("");

    // Mock data for Heritage
    const heritages = [
        {
            id: 1,
            name: "Teatro Municipal de Ouro",
            type: "Edificação Histórica",
            tombamento: "Federal (IPHAN)",
            status: "Conservado",
            riskLevel: "Baixo",
            lastInspection: "12/05/2026",
            needsRestoration: false,
            docsPending: 0
        },
        {
            id: 2,
            name: "Igreja Matriz São João",
            type: "Religioso",
            tombamento: "Estadual (IEPHA)",
            status: "Em Risco",
            riskLevel: "Alto",
            lastInspection: "01/02/2026",
            needsRestoration: true,
            docsPending: 2
        },
        {
            id: 3,
            name: "Antiga Estação Ferroviária",
            type: "Infraestrutura",
            tombamento: "Municipal",
            status: "Em Reforma",
            riskLevel: "Médio",
            lastInspection: "20/06/2026",
            needsRestoration: true,
            docsPending: 0
        }
    ];

    const filtered = heritages.filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <AnimateIn className="space-y-12 pb-32">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-amber-500 rounded-full" />
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                            Patrimônio <span className="text-amber-500">Histórico</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 font-medium text-lg">
                        Gestão de bens tombados, estado de conservação e mitigação de riscos estruturais.
                    </p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                    <div className="relative group w-full md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Buscar patrimônio..."
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-slate-600"
                        />
                    </div>
                    <Button
                        size="lg"
                        className="h-14 px-8 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-amber-600/20"
                    >
                        Cadastrar Bem
                    </Button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { title: "Bens Tombados", value: "32", icon: Landmark, color: "text-amber-500", bg: "bg-amber-500/10" },
                    { title: "Em Risco Crítico", value: "3", icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-500/10" },
                    { title: "Obras em Andamento", value: "5", icon: Hammer, color: "text-indigo-500", bg: "bg-indigo-500/10" },
                    { title: "Laudos Pendentes", value: "12", icon: FileText, color: "text-purple-500", bg: "bg-purple-500/10" }
                ].map((kpi, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                        <Card className="p-6 bg-white/[0.02] border-white/5 rounded-3xl relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${kpi.bg} ${kpi.color}`}>
                                    <kpi.icon size={24} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-black text-white">{kpi.value}</h3>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{kpi.title}</p>
                            <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                                <kpi.icon size={100} />
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* List */}
            <Card className="p-0 bg-white/[0.02] border-white/5 rounded-[40px] overflow-hidden">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight">Inventário Municipal</h2>
                            <p className="text-sm font-medium text-slate-500">Acompanhamento e fiscalização dos bens.</p>
                        </div>
                    </div>
                </div>
                <div className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filtered.map(item => (
                            <div key={item.id} className="p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/[0.07] transition-all flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                item.riskLevel === 'Alto' ? 'bg-rose-500/20 text-rose-400' :
                                                item.riskLevel === 'Médio' ? 'bg-amber-500/20 text-amber-400' :
                                                'bg-emerald-500/20 text-emerald-400'
                                            }`}>
                                                {item.riskLevel === 'Alto' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-white">{item.name}</h3>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.type}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="bg-white/5 p-4 rounded-2xl">
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Tombamento</p>
                                            <p className="text-sm font-medium text-white">{item.tombamento}</p>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-2xl">
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Status Físico</p>
                                            <p className={`text-sm font-bold ${
                                                item.status === 'Conservado' ? 'text-emerald-400' :
                                                item.status === 'Em Risco' ? 'text-rose-400' : 'text-amber-400'
                                            }`}>{item.status}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Clock size={14} />
                                        <span className="text-xs font-medium">Vistoria: {item.lastInspection}</span>
                                    </div>
                                    <Button
                                        variant="glass"
                                        className="bg-white/5 border-white/5 text-slate-300 hover:text-white hover:bg-white/10 uppercase text-[10px] font-black tracking-widest px-4 h-10"
                                    >
                                        Prontuário <ArrowRight size={14} className="ml-2" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </AnimateIn>
    );
};
