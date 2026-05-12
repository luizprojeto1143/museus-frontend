import { useTranslation } from "react-i18next";
import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../api/client";
import { useAuth } from "../auth/AuthContext";
import { 
    Loader2, 
    AlertTriangle, 
    Building, 
    Calendar, 
    TrendingUp,
    Accessibility,
    CheckCircle2,
    XCircle,
    Info,
    ShieldCheck,
    FileCheck,
    MapPin,
    Search,
    ArrowUpRight,
    HandMetal,
    Volume2,
    Activity,
    Scale
} from "lucide-react";
import { 
    Card, 
    Badge, 
    Button, 
    AnimateIn 
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export const MunicipalAccessibilityGaps: React.FC = () => {
    const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [data, setData] = useState<any>(null);
    const [matrix, setMatrix] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [dashboardRes, matrixRes] = await Promise.all([
                api.get("/secretary/dashboard", { params: { tenantId, consolidated: true } }),
                api.get("/secretary/legal-compliance", { params: { tenantId } })
            ]);
            setData(dashboardRes.data);
            setMatrix(matrixRes.data.matrix || []);
        } catch (error) { 
            console.error(error); 
            toast.error("Erro ao consolidar matriz de conformidade.");
        } finally { 
            setLoading(false); 
        }
    }, [tenantId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">Mapeando Vazios de Acessibilidade...</p>
        </div>
    );

    const equipments = data?.equipmentAccessibility || [];
    const totalCount = equipments.length;
    const okCount = equipments.filter((e: any) => e.hasAccessibility).length;
    const coverage = totalCount > 0 ? Math.round((okCount / totalCount) * 100) : 0;

    return (
        <AnimateIn className="space-y-12 pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                            Auditoria de <span className="text-emerald-500">Acessibilidade</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 font-medium text-lg">Mapeamento de vazios críticos e conformidade com a LBI.</p>
                </div>
                
                <div className="flex gap-3">
                    <Button variant="glass" className="h-14 px-6 rounded-2xl border-white/5 text-slate-400 font-black uppercase text-[10px] tracking-widest">
                        Exportar Laudo Técnico
                    </Button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-8 bg-white/[0.02] border-white/5 rounded-[40px] group hover:bg-white/[0.04] transition-all">
                    <div className="w-14 h-14 bg-emerald-600/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Building size={28} />
                    </div>
                    <div className="text-4xl font-black text-white tracking-tighter">{totalCount}</div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Unidades Culturais Monitoradas</div>
                </Card>
                
                <Card className="p-8 bg-white/[0.02] border-white/5 rounded-[40px] group hover:bg-white/[0.04] transition-all">
                    <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-600/20 group-hover:rotate-3 transition-transform">
                        <CheckCircle2 size={28} />
                    </div>
                    <div className="text-4xl font-black text-white tracking-tighter">{okCount}</div>
                    <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-2">Unidades em Conformidade LBI</div>
                </Card>

                <Card className="p-8 bg-white/[0.02] border-white/5 rounded-[40px] group hover:bg-white/[0.04] transition-all relative overflow-hidden">
                    <div className="w-14 h-14 bg-indigo-600/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Activity size={28} />
                    </div>
                    <div className="text-4xl font-black text-white tracking-tighter">{coverage}%</div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Cobertura de Tecnologia Assistiva</div>
                    <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                         <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${coverage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                         />
                    </div>
                </Card>
            </div>

            {/* Audit Table */}
            <Card className="p-0 bg-white/[0.02] border-white/5 rounded-[48px] overflow-hidden">
                <div className="p-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-white/[0.01]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight italic">Status por Equipamento</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Mapeamento de vazios e recursos</p>
                        </div>
                    </div>
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar unidade..." 
                            className="w-full h-12 bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                        />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/[0.02] text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                            <tr>
                                <th className="px-10 py-6">Unidade Cultural</th>
                                <th className="px-10 py-6">Tipologia</th>
                                <th className="px-10 py-6 text-center">Tecnologias Assistivas</th>
                                <th className="px-10 py-6">Status Final</th>
                                <th className="px-10 py-6"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {equipments.map((eq: any) => (
                                <tr key={eq.id} className="hover:bg-white/[0.02] transition-all group">
                                    <td className="px-10 py-8">
                                        <div className="font-bold text-white group-hover:text-emerald-400 transition-colors text-lg">{eq.name}</div>
                                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">Ref: {eq.id.slice(0, 8)}</div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <Badge variant="glass" className="bg-white/5 text-slate-400 border-white/5 uppercase text-[9px] font-black tracking-widest px-3 py-1">
                                            {eq.type}
                                        </Badge>
                                    </td>
                                    <td className="px-10 py-8">
                                       <div className="flex justify-center gap-3">
                                           <div className={`p-2 rounded-lg border transition-all ${eq.hasLibras ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-white/5 border-white/5 text-slate-700'}`} title="Libras">
                                               <HandMetal size={16} />
                                           </div>
                                           <div className={`p-2 rounded-lg border transition-all ${eq.hasAudioDescription ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-white/5 border-white/5 text-slate-700'}`} title="Audiodescrição">
                                               <Volume2 size={16} />
                                           </div>
                                           <div className={`p-2 rounded-lg border transition-all ${eq.hasRamps ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-white/5 border-white/5 text-slate-700'}`} title="Acessibilidade Física">
                                               <Accessibility size={16} />
                                           </div>
                                       </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        {eq.hasAccessibility ? (
                                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase text-[9px] font-black tracking-widest px-4 py-1.5">
                                                Conformidade OK
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 uppercase text-[9px] font-black tracking-widest px-4 py-1.5 flex items-center gap-2">
                                                <AlertTriangle size={12} /> Vazio Crítico
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-600 hover:text-emerald-400 hover:bg-emerald-400/10 transition-all">
                                            <ArrowUpRight size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Matrix Section */}
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xl shadow-emerald-600/20">
                        <Scale size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tighter italic">Matriz de Conformidade Legal (LBI)</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Requisitos obrigatórios para gestão cultural municipal</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {matrix.map((item, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="h-full bg-white/[0.02] border-white/5 rounded-[40px] p-10 relative overflow-hidden group hover:bg-white/[0.04] transition-all">
                                <div className="relative z-10 flex flex-col h-full space-y-8">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <Badge variant="glass" className="bg-emerald-500/10 text-emerald-400 border-none text-[9px] font-black uppercase tracking-widest">
                                                {item.law || 'Lei Brasileira de Inclusão'}
                                            </Badge>
                                            <h4 className="text-xl font-black text-white tracking-tight leading-tight">{item.requirement}</h4>
                                        </div>
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-all group-hover:scale-110 ${
                                            item.compliant 
                                            ? 'bg-emerald-600 text-white shadow-emerald-600/20' 
                                            : 'bg-rose-500 text-white shadow-rose-500/20'
                                        }`}>
                                            {item.compliant ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                                        </div>
                                    </div>

                                    <div className="space-y-6 flex-1">
                                        <div className="p-6 bg-white/[0.01] border border-white/5 rounded-3xl space-y-2">
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Evidência Identificada</p>
                                            <p className="text-sm font-medium text-slate-400 italic leading-relaxed">"{item.evidence}"</p>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white/5 p-4 rounded-2xl border border-white/5">
                                            <Info size={14} className="text-emerald-500 shrink-0" /> 
                                            {item.howWeComply || 'Estratégia de conformidade em implementação.'}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Background Decorative Element */}
                                <div className={`absolute top-0 right-0 w-48 h-48 blur-[80px] opacity-[0.05] -mr-24 -mt-24 pointer-events-none ${
                                    item.compliant ? 'bg-emerald-500' : 'bg-rose-500'
                                }`} />
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </AnimateIn>
    );
};
