import React, { useState, useEffect } from "react";
import {
    Users,
    Building2,
    FileText,
    Accessibility,
    TrendingUp,
    AlertCircle,
    ArrowUpRight,
    Search,
    Filter,
    Calendar,
    ChevronRight,
    Clock
} from "lucide-react";
import { api } from "../../api/client";
import { Button } from "../../components/ui";

export const MunicipalDashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get("/secretary/dashboard");
                setData(res.data);
            } catch (err) {
                console.error("Error fetching municipal dashboard", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-10 text-center animate-pulse text-blue-600">Carregando panorama executivo...</div>;

    const cards = [
        { label: "Equipamentos Culturais", value: data?.cards?.totalEquipments || 0, icon: <Building2 className="text-blue-600" />, trend: "+2 este mês", color: "blue" },
        { label: "Ações de Acessibilidade", value: data?.cards?.totalAccessibilityActions || 0, icon: <Accessibility className="text-emerald-600" />, trend: "98% concluídas", color: "emerald" },
        { label: "Projetos em Execução", value: data?.cards?.activeProjects || 0, icon: <FileText className="text-orange-600" />, trend: "15 aguardando análise", color: "orange" },
        { label: "Impacto Público (Est.)", value: data?.cards?.estimatedPublicImpact || 0, icon: <Users className="text-purple-600" />, trend: "+12.4% vs mês anterior", color: "purple" }
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Painel de Gestão Municipal</h1>
                    <p className="text-slate-500 mt-1 font-medium">Panorama geral de equipamentos, projetos e conformidade legal.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 gap-2 font-bold px-6">
                        <Calendar size={18} /> Período: Últimos 30 dias
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-bold px-8 shadow-xl shadow-blue-600/20">
                        Exportar Relatório PDF
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl bg-${card.color}-50 group-hover:scale-110 transition-transform`}>
                                {React.cloneElement(card.icon as React.ReactElement, { size: 28 })}
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-widest">{card.trend}</span>
                        </div>
                        <div className="text-4xl font-black text-slate-900 mb-1">{card.value}</div>
                        <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">{card.label}</div>
                        <div className={`absolute bottom-0 left-0 h-1 bg-${card.color}-500 transition-all duration-500 w-0 group-hover:w-full`}></div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Accessibility Compliance List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Conformidade por Equipamento</h3>
                                <p className="text-sm text-slate-500">Status dos recursos de acessibilidade nas unidades culturais.</p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-blue-600 font-bold hover:bg-blue-50">Ver todos</Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    <tr>
                                        <th className="px-8 py-5">Unidade Cultural</th>
                                        <th className="px-8 py-5">Categoria</th>
                                        <th className="px-8 py-5">Acessibilidade</th>
                                        <th className="px-8 py-5">Pendências</th>
                                        <th className="px-8 py-5"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(data?.equipmentAccessibility || []).map((eq: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{eq.name}</div>
                                                <div className="text-xs text-slate-400">ID: {eq.id.slice(0, 8)}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full uppercase tracking-widest">{eq.type}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                {eq.hasAccessibility ? (
                                                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-tight">
                                                        <Accessibility size={14} /> Ativo
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-tight">
                                                        <AlertCircle size={14} /> Inativo
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`text-xs font-bold ${eq.pendingRequests > 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                                                    {eq.pendingRequests} solicitações
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
                                                    <ArrowUpRight size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Side Panels */}
                <div className="space-y-6">
                    {/* Alerts Panel */}
                    <div className="bg-[#0f172a] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <AlertCircle size={20} className="text-orange-400" /> Alertas de Gestão
                            </h3>
                            <div className="space-y-4">
                                {(data?.alerts || []).map((alert: any, idx: number) => (
                                    <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group">
                                        <p className="text-sm font-medium text-slate-300 leading-relaxed mb-2 group-hover:text-white transition-colors">{alert.message}</p>
                                        <div className="flex justify-between items-center">
                                            <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${alert.severity === 'WARNING' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                {alert.severity}
                                            </span>
                                            <ChevronRight size={14} className="text-white/20 group-hover:text-white transition-colors" />
                                        </div>
                                    </div>
                                ))}
                                {(!data?.alerts || data.alerts.length === 0) && (
                                    <p className="text-sm text-slate-500 italic">Nenhum alerta crítico pendente.</p>
                                )}
                            </div>
                        </div>
                        {/* Decorative Gradient */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    </div>

                    {/* Timeline Panel */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Clock size={20} className="text-blue-600" /> Fluxo de Projetos
                        </h3>
                        <div className="space-y-6">
                            {(data?.recentProjects || []).map((proj: any, idx: number) => (
                                <div key={idx} className="flex gap-4 group">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-black shrink-0 ${proj.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'
                                            }`}>
                                            {idx + 1}
                                        </div>
                                        {idx < (data.recentProjects.length - 1) && <div className="w-0.5 h-full bg-slate-100 my-2"></div>}
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <div className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{proj.title}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                {new Date(proj.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{proj.status}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full mt-4 border-slate-200 text-slate-600 font-bold rounded-2xl py-6 hover:bg-slate-50">
                            Ver Cronograma Completo
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
