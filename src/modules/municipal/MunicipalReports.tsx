import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FileText,
    Download,
    Calendar,
    ChevronRight,
    BarChart3,
    PieChart,
    TrendingUp,
    ShieldCheck,
    ArrowRight
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "../../api/client";
import { Button } from "../../components/ui";

export const MunicipalReports: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<any>(null);
    const [compliance, setCompliance] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summaryRes, complianceRes] = await Promise.all([
                    api.get("/executive-reports/summary"),
                    api.get("/secretary/legal-compliance")
                ]);
                setSummary(summaryRes.data);
                setCompliance(complianceRes.data);
            } catch (err) {
                console.error("Error fetching report data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDownloadPDF = async () => {
        try {
            window.open(`${api.defaults.baseURL}/executive-reports/pdf`, '_blank');
        } catch (err) {
            console.error("Error downloading PDF", err);
        }
    };

    if (loading) return <div className="p-10 text-center animate-pulse text-blue-600">Compilando indicadores...</div>;

    const reportCards = [
        { title: "Resumo Executivo Mensal", icon: <FileText size={40} className="text-blue-600" />, desc: "Panorama consolidado de todos os equipamentos culturais.", date: "Gerado agora" },
        { title: "Relatório de Conformidade LBI", icon: <ShieldCheck size={40} className="text-emerald-600" />, desc: "Status legal perante a Lei Brasileira de Inclusão.", date: "Atualizado hoje" },
        { title: "Evolução do Impacto Público", icon: <TrendingUp size={40} className="text-purple-600" />, desc: "Análise histórica de público e engajamento.", date: "Dados em tempo real" }
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Central de Relatórios Executivos</h1>
                <p className="text-slate-500 mt-1 font-medium">Documentos oficiais e indicadores estratégicos para tomada de decisão.</p>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Column: Quick Stats */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-sm font-black uppercase tracking-widest opacity-60 mb-6">Taxa de Adesão</h3>
                            <div className="text-5xl font-black mb-2">{summary?.summary?.accessibilityPlanRate || 0}%</div>
                            <p className="text-xs text-blue-100 font-medium">dos projetos culturais possuem planos de acessibilidade ativos.</p>
                            <div className="mt-8 pt-8 border-t border-white/10 flex justify-between">
                                <div>
                                    <div className="text-lg font-bold">128</div>
                                    <div className="text-[9px] uppercase font-black opacity-60">Projetos</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold">42</div>
                                    <div className="text-[9px] uppercase font-black opacity-60">Equipamentos</div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                        <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <PieChart size={18} className="text-blue-600" /> Ações por Tipo
                        </h4>
                        <div className="space-y-4">
                            {Object.entries(summary?.summary?.accessibilityByType || {}).map(([type, count]: [string, any]) => (
                                <div key={type} className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium uppercase text-[10px] tracking-widest">{type.replace('_', ' ')}</span>
                                    <span className="font-bold text-slate-900">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Report List */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {reportCards.map((card, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                                        {card.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{card.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed font-medium">{card.desc}</p>
                                </div>
                                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <Calendar size={12} /> {card.date}
                                    </div>
                                    <Button
                                        onClick={handleDownloadPDF}
                                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold py-2 px-4 shadow-lg shadow-blue-600/20 flex items-center gap-2 text-xs"
                                    >
                                        <Download size={14} /> PDF
                                    </Button>
                                </div>
                            </div>
                        ))}

                        <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl flex flex-col justify-center items-center text-center space-y-4">
                            <BarChart3 size={48} className="text-blue-500 opacity-50 mb-2" />
                            <h3 className="text-xl font-bold">Relatório de Transparência</h3>
                            <p className="text-sm text-slate-400">Exporte os dados brutos para o Portal da Transparência Municipal.</p>
                            <Button variant="outline" onClick={() => toast("Exportação CSV será disponibilizada na próxima versão da API.", { icon: "ℹ️" })} className="border-slate-700 text-white hover:bg-white/5 font-bold rounded-2xl">
                                Preparar Dados (CSV)
                            </Button>
                        </div>
                    </div>

                    {/* Legal Compliance Section */}
                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900">Conformidade Legal (Checklist)</h3>
                            <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest ${compliance?.summary?.complianceRate === 100 ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                                {compliance?.summary?.complianceRate || 0}% Conforme
                            </span>
                        </div>
                        <div className="p-8 space-y-4">
                            {(compliance?.matrix || []).slice(0, 3).map((item: any, idx: number) => (
                                <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl ${item.compliant ? 'bg-slate-50' : 'bg-rose-50'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white ${item.compliant ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                            <ShieldCheck size={12} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-700 text-sm">{item.law}</span>
                                            <span className="text-[10px] text-slate-500 uppercase tracking-widest truncate max-w-[150px] lg:max-w-[250px]">{item.requirement}</span>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase ${item.compliant ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {item.compliant ? 'Conforme' : 'Pendente'}
                                    </span>
                                </div>
                            ))}
                            {(!compliance?.matrix || compliance.matrix.length === 0) && (
                                <p className="text-sm text-slate-500 italic text-center py-4">Sem dados de conformidade para exibir</p>
                            )}
                        </div>
                        <div className="px-8 pb-8 pt-2">
                            <Button variant="ghost" className="text-blue-600 font-bold hover:bg-blue-50 w-full flex items-center justify-between" onClick={() => navigate('/municipal/compliance')}>
                                Ver Detalhes da Conformidade <ArrowRight size={18} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
