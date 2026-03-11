import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../api/client";
import { useAuth } from "../auth/AuthContext";
import { 
    Loader2, 
    Target, 
    TrendingUp, 
    Building, 
    Coins,
    ChevronRight,
    Search
} from "lucide-react";
import { Button } from "../../components/ui";

export const MunicipalPPA: React.FC = () => {
    const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/ppa/consolidated?tenantId=${tenantId}&year=${year}`);
            setGoals(res.data);
        } catch (error) { 
            console.error(error); 
        } finally { 
            setLoading(false); 
        }
    }, [tenantId, year]);

    useEffect(() => { if (tenantId) fetchData(); }, [tenantId, fetchData]);

    if (loading) return (
        <div className="p-20 text-center flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <p className="font-black text-slate-800 uppercase tracking-widest text-xs">Consolidando Orçamento e Metas PPA...</p>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Metas PPA Consolidadas</h1>
                    <p className="text-slate-500 font-medium mt-1">Plano Plurianual — Visão Macro Betim {year}</p>
                </div>
                <div className="flex gap-3">
                    <select 
                        value={year} 
                        onChange={e => setYear(Number(e.target.value))} 
                        className="bg-white border border-slate-200 rounded-2xl px-6 py-3 font-bold text-slate-600 shadow-sm outline-none"
                    >
                        {[2024, 2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 rounded-2xl shadow-lg shadow-blue-600/20">
                        Exportar Relatório PPA
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {goals.length === 0 ? (
                    <div className="lg:col-span-2 py-32 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                         <Target size={64} className="mx-auto text-slate-200 mb-6" />
                         <p className="text-slate-400 font-black uppercase tracking-[0.2em]">Nenhuma meta consolidada para este ano.</p>
                    </div>
                ) : goals.map((g, idx) => {
                    const pct = g.targetValue > 0 ? Math.min(Math.round((g.currentValue / g.targetValue) * 100), 100) : 0;
                    const colorClass = pct >= 90 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : 'bg-rose-500';
                    const textColorClass = pct >= 90 ? 'text-emerald-600' : pct >= 50 ? 'text-blue-600' : 'text-rose-600';

                    return (
                        <div key={idx} className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm hover:shadow-xl transition-all group">
                            <div className="flex justify-between items-start mb-8">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-slate-900 leading-tight">{g.title}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{g.metric}</span>
                                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{g.goals.length} Unidades Culturais</span>
                                    </div>
                                </div>
                                <div className={`text-3xl font-black ${textColorClass} italic tracking-tighter`}>{pct}%</div>
                            </div>

                            <div className="w-full bg-slate-100 rounded-full h-4 relative mb-10 group-hover:scale-[1.02] transition-transform">
                                <div className={`h-full rounded-full ${colorClass} transition-all duration-1000`} style={{ width: `${pct}%` }}></div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Detalhamento por Unidade</p>
                                {g.goals.map((item: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 px-2 rounded-xl transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                                            <span className="text-sm font-bold text-slate-600">{item.tenantName}</span>
                                        </div>
                                        <div className="text-sm font-black text-slate-900">
                                            {item.currentValue.toLocaleString()} / {item.targetValue.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
