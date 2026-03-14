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
    FileCheck
} from "lucide-react";

export const MunicipalAccessibilityGaps: React.FC = () => {
    const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [data, setData] = useState<any>(null);
    const [matrix, setMatrix] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [dashboardRes, matrixRes] = await Promise.all([
                api.get("/secretary/dashboard", { params: { tenantId, consolidated: true } }),
                api.get("/secretary/legal-compliance", { params: { tenantId } })
            ]);
            setData(dashboardRes.data);
            setMatrix(matrixRes.data.matrix || []);
        } catch (error) { 
            console.error(error); 
        } finally { 
            setLoading(false); 
        }
    }, [tenantId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (loading) return (
        <div className="flex justify-center p-20 animate-pulse text-blue-600 font-black">
            Analisando vazios de acessibilidade municipal...
        </div>
    );

    const equipments = data?.equipmentAccessibility || [];
    const totalCount = equipments.length;
    const okCount = equipments.filter((e: any) => e.hasAccessibility).length;
    const coverage = totalCount > 0 ? Math.round((okCount / totalCount) * 100) : 0;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-black text-slate-900 underline decoration-blue-500 decoration-8 underline-offset-4">Vazios de Acessibilidade</h1>
                <p className="text-slate-500 mt-3 font-medium">Mapeamento de conformidade legal LBI e recursos de tecnologia assistiva.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <Building className="text-blue-500 mb-4" size={32} />
                    <div className="text-4xl font-black text-slate-900">{totalCount}</div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Unidades Culturais</div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <Accessibility className="text-emerald-500 mb-4" size={32} />
                    <div className="text-4xl font-black text-emerald-500">{okCount}</div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Com Acessibilidade</div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative group">
                    <TrendingUp className="text-blue-600 mb-4" size={32} />
                    <div className="text-4xl font-black text-slate-900">{coverage}%</div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Cobertura Municipal</div>
                    <div className="absolute bottom-0 left-0 h-1 bg-blue-600 transition-all duration-1000" style={{ width: `${coverage}%` }}></div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <tr>
                            <th className="px-8 py-5">Equipamento</th>
                            <th className="px-8 py-5">Tipo</th>
                            <th className="px-8 py-5 text-center">Recursos</th>
                            <th className="px-8 py-5">Status Final</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {equipments.map((eq: any) => (
                            <tr key={eq.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="font-bold text-slate-900">{eq.name}</div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">{eq.type}</span>
                                </td>
                                <td className="px-8 py-6">
                                   <div className="flex justify-center gap-1">
                                       <span title="Libras" className={`w-2 h-2 rounded-full ${eq.hasLibras ? 'bg-blue-500' : 'bg-slate-200'}`} />
                                       <span title="Audio" className={`w-2 h-2 rounded-full ${eq.hasAudioDescription ? 'bg-blue-500' : 'bg-slate-200'}`} />
                                       <span title="Rampas" className={`w-2 h-2 rounded-full ${eq.hasRamps ? 'bg-blue-500' : 'bg-slate-200'}`} />
                                   </div>
                                </td>
                                <td className="px-8 py-6">
                                    {eq.hasAccessibility ? (
                                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase">
                                            <CheckCircle2 size={16} /> Conformidade OK
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase">
                                            <AlertTriangle size={16} /> Vazio Crítico
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Matrix Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="text-blue-600" size={28} />
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Matriz de Conformidade Legal</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {matrix.map((item, idx) => (
                        <div key={idx} className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{item.law}</div>
                                        <h4 className="text-lg font-bold leading-tight">{item.requirement}</h4>
                                    </div>
                                    <div className={`p-2 rounded-xl ${item.compliant ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                        {item.compliant ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                                    </div>
                                </div>
                                <div className="mt-auto space-y-4">
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Evidência</div>
                                        <div className="text-sm font-medium text-slate-300">{item.evidence}</div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        <Info size={12} /> {item.howWeComply}
                                    </div>
                                </div>
                            </div>
                            <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 -mr-16 -mt-16 rounded-full ${item.compliant ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
