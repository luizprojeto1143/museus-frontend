import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
    Map, 
    AlertTriangle, 
    Users, 
    Building2, 
    Activity, 
    Target,
    Search
} from "lucide-react";
import { 
    Button, 
    Badge, 
    AnimateIn, 
    Card 
} from "@/components/ui";
import { motion } from "framer-motion";

export const MunicipalCulturalGaps: React.FC = () => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState("");

    const gaps = [
        {
            id: 1,
            neighborhood: "Zona Leste - Periferia",
            population: "120.000",
            equipments: 0,
            eventsLast6Months: 2,
            accessibilityIndex: "Crítico",
            engagementScore: 12,
            recommendation: "Implantação urgente de Centro Cultural Itinerante e Editais focados na região."
        },
        {
            id: 2,
            neighborhood: "Bairro Industrial",
            population: "85.000",
            equipments: 1,
            eventsLast6Months: 5,
            accessibilityIndex: "Ruim",
            engagementScore: 28,
            recommendation: "Reforma de acessibilidade no equipamento local e aumento de verba para oficinas."
        },
        {
            id: 3,
            neighborhood: "Vila Nova",
            population: "45.000",
            equipments: 0,
            eventsLast6Months: 1,
            accessibilityIndex: "Inexistente",
            engagementScore: 5,
            recommendation: "Mapeamento ativo de produtores locais para criação de rede colaborativa."
        }
    ];

    const filteredGaps = gaps.filter(g => g.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <AnimateIn className="space-y-12 pb-32">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-rose-500 rounded-full" />
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                            Vazios <span className="text-rose-500">Culturais</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 font-medium text-lg">
                        Mapeamento inteligente de áreas desassistidas e recomendações de política pública.
                    </p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                    <div className="relative group w-full md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-rose-400 transition-colors" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Buscar região/bairro..."
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-xs text-white focus:outline-none focus:border-rose-500/50 transition-all placeholder:text-slate-600"
                        />
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { title: "Bairros sem Equipamentos", value: "14", icon: Building2, color: "text-rose-500", bg: "bg-rose-500/10" },
                    { title: "Zonas de Baixa Adesão", value: "8", icon: Activity, color: "text-orange-500", bg: "bg-orange-500/10" },
                    { title: "Déficit de Acessibilidade", value: "62%", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
                    { title: "População Desassistida", value: "450k", icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" }
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

            {/* Map / List of Gaps */}
            <Card className="p-0 bg-white/[0.02] border-white/5 rounded-[40px] overflow-hidden">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500">
                            <Map size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight">Mapeamento Territorial</h2>
                            <p className="text-sm font-medium text-slate-500">Áreas com necessidade de intervenção do poder público.</p>
                        </div>
                    </div>
                </div>
                <div className="p-8">
                    <div className="space-y-6">
                        {filteredGaps.map(gap => (
                            <div key={gap.id} className="p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/[0.07] transition-all">
                                <div className="flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-black text-white">{gap.neighborhood}</h3>
                                            {gap.equipments === 0 && (
                                                <Badge variant="glass" className="bg-rose-500/20 text-rose-400 border-rose-500/20 uppercase text-[9px] font-black tracking-widest">
                                                    Sem Equipamentos
                                                </Badge>
                                            )}
                                        </div>
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">População</p>
                                                <p className="text-sm font-medium text-white">{gap.population}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Eventos (6m)</p>
                                                <p className="text-sm font-medium text-white">{gap.eventsLast6Months}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Acessibilidade</p>
                                                <p className={`text-sm font-bold ${gap.accessibilityIndex === 'Crítico' || gap.accessibilityIndex === 'Inexistente' ? 'text-rose-400' : 'text-amber-400'}`}>
                                                    {gap.accessibilityIndex}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Adesão Cultural</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full bg-rose-500" style={{ width: `${gap.engagementScore}%` }} />
                                                    </div>
                                                    <span className="text-xs font-bold text-white">{gap.engagementScore}/100</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-white/5">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
                                            <Target size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-1">Recomendação de Ação Pública</p>
                                            <p className="text-sm font-medium text-slate-300">{gap.recommendation}</p>
                                        </div>
                                        <Button
                                            variant="glass"
                                            className="ml-auto bg-white/5 border-white/5 text-emerald-400 hover:bg-emerald-500 hover:text-white uppercase text-[10px] font-black tracking-widest px-6"
                                        >
                                            Criar Edital
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </AnimateIn>
    );
};
