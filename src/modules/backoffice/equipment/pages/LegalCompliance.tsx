import React, { useEffect, useState, useCallback } from "react";
import { logger } from "@/utils/logger";

import { useTranslation } from "react-i18next";
import { api } from "../../../../api/client";
import { 
  ShieldCheck, 
  Scale, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  BookOpen, 
  FileText, 
  Info,
  ExternalLink,
  ChevronRight,
  Gavel,
  Library
} from "lucide-react";
import { 
  Card, 
  Badge, 
  AnimateIn,
  Button,
  AnimatedCounter 
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";

type ComplianceItem = {
    law: string;
    requirement: string;
    howWeComply: string;
    evidence: string;
    compliant: boolean;
};

type ComplianceData = {
    summary: {
        totalLaws: number;
        compliant: number;
        complianceRate: number;
    };
    matrix: ComplianceItem[];
};

const LegalCompliance: React.FC = () => {
    const { t } = useTranslation();
    const [data, setData] = useState<ComplianceData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchCompliance = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get("/secretary/legal-compliance");
            setData(response.data);
        } catch (err) {
            logger.error("Erro ao carregar conformidade", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCompliance();
    }, [fetchCompliance]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">Verificando Conformidade...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <Card className="max-w-md mx-auto mt-20 p-8 text-center bg-red-500/5 border-red-500/20 rounded-[40px]">
                <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
                <h3 className="text-xl font-bold text-white">Erro de Sistema</h3>
                <p className="text-slate-400 mt-2">Não foi possível processar a matriz de conformidade.</p>
                <Button className="mt-6 bg-red-500 text-white rounded-xl" onClick={fetchCompliance}>Reintentar</Button>
            </Card>
        );
    }

    const getComplianceColor = (rate: number) => {
        if (rate >= 80) return "text-green-400";
        if (rate >= 50) return "text-gold-400";
        return "text-red-400";
    };

    const getComplianceBg = (rate: number) => {
        if (rate >= 80) return "bg-green-500/10 border-green-500/20";
        if (rate >= 50) return "bg-gold-400/10 border-gold-400/20";
        return "bg-red-500/10 border-red-500/20";
    };

    return (
        <AnimateIn className="space-y-8 pb-32 max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                        <Scale className="text-gold-400" size={32} />
                        Matriz de <span className="text-gold-400">Conformidade Legal</span>
                    </h1>
                    <p className="text-slate-400 font-medium">Mapeamento entre funcionalidades do sistema e exigências legais.</p>
                </div>

                <Badge variant="glass" className="h-10 px-4 rounded-xl border-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    <ShieldCheck className="mr-2 text-gold-400" size={14} />
                    Status de Governança
                </Badge>
            </div>

            {/* Summary Hero Card */}
            <Card className={`p-10 rounded-[48px] border overflow-hidden relative group transition-all ${getComplianceBg(data.summary.complianceRate)}`}>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full -rotate-90">
                            <circle cx="64" cy="64" r="60" className="stroke-white/5 fill-none" strokeWidth="8" />
                            <motion.circle 
                                cx="64" cy="64" r="60" 
                                className={`fill-none stroke-current transition-all duration-1000 ${getComplianceColor(data.summary.complianceRate)}`} 
                                strokeWidth="8"
                                strokeDasharray={377}
                                initial={{ strokeDashoffset: 377 }}
                                animate={{ strokeDashoffset: 377 - (377 * data.summary.complianceRate) / 100 }}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-3xl font-black ${getComplianceColor(data.summary.complianceRate)}`}>
                                <AnimatedCounter value={data.summary.complianceRate} />%
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-2">
                        <h2 className="text-2xl font-black text-white leading-tight">Taxa de Conformidade Geral</h2>
                        <p className="text-slate-400 font-medium leading-relaxed max-w-lg">
                            {data.summary.compliant} de {data.summary.totalLaws} normas e exigências legais de acessibilidade estão plenamente atendidas pelo sistema.
                        </p>
                        <div className="pt-2">
                            <Badge className="bg-white/10 text-white/60 border-white/10 uppercase text-[9px] font-black tracking-widest">
                                Atualizado em Tempo Real
                            </Badge>
                        </div>
                    </div>

                    <div className="shrink-0 hidden lg:block">
                        <Button className="bg-white text-slate-950 font-black rounded-2xl px-8 h-14 shadow-xl">
                            Exportar Relatório PDF
                        </Button>
                    </div>
                </div>

                {/* Background Pattern */}
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-[100px] pointer-events-none" />
            </Card>

            {/* Matrix Matrix Matrix */}
            <Card className="p-0 bg-white/[0.02] border-white/5 rounded-[40px] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-white/[0.03] text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                                <th className="px-8 py-6 text-left">Lei / Norma</th>
                                <th className="px-8 py-6 text-left">Exigência</th>
                                <th className="px-8 py-6 text-left">Implementação</th>
                                <th className="px-8 py-6 text-left">Evidência</th>
                                <th className="px-8 py-6 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data.matrix.map((item, idx) => (
                                <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-8 align-top">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gold-400 group-hover:scale-110 transition-transform">
                                                <Gavel size={14} />
                                            </div>
                                            <span className="text-sm font-black text-white group-hover:text-gold-400 transition-colors">{item.law}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8 align-top">
                                        <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xs">{item.requirement}</p>
                                    </td>
                                    <td className="px-8 py-8 align-top">
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 size={12} className="text-gold-400 shrink-0 mt-0.5" />
                                            <p className="text-xs text-slate-300 font-bold leading-relaxed max-w-xs">{item.howWeComply}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8 align-top">
                                        <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed max-w-[200px]">{item.evidence}</p>
                                    </td>
                                    <td className="px-8 py-8 align-top text-center">
                                        <Badge className={`h-8 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                            item.compliant ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                                        }`}>
                                            {item.compliant ? 'Conforme' : 'Pendente'}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Legal References Section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
                <Card className="md:col-span-8 p-10 bg-white/[0.02] border-white/5 rounded-[40px] space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400">
                            <Library size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Referências Legais</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Documentação e Legislação Vigente</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { name: "Lei 13.146/2015 (LBI)", desc: "Estatuto da Pessoa com Deficiência" },
                            { name: "NBR 9050:2020", desc: "Normas de Acessibilidade Edificações" },
                            { name: "Lei 10.098/2000", desc: "Critérios Básicos de Acessibilidade" },
                            { name: "Lei 12.527/2011 (LAI)", desc: "Lei de Acesso à Informação" }
                        ].map((ref, i) => (
                            <div key={i} className="p-5 bg-white/[0.03] border border-white/5 rounded-[24px] group hover:bg-white/[0.05] transition-all cursor-pointer">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-black text-white group-hover:text-gold-400 transition-colors">{ref.name}</span>
                                    <ExternalLink size={14} className="text-slate-700 group-hover:text-gold-400 transition-colors" />
                                </div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">{ref.desc}</p>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="md:col-span-4 p-10 bg-gold-400/[0.03] border-gold-400/10 rounded-[40px] flex flex-col justify-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-400 mx-auto shadow-[0_0_50px_rgba(212,175,55,0.1)]">
                        <ShieldCheck size={40} />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-white">Certificação MSV</h4>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                            O portal do museu utiliza tecnologia certificada para conformidade automática com os padrões WCAG 2.1 e LBI.
                        </p>
                    </div>
                    <Button variant="glass" className="rounded-xl border-gold-400/20 text-gold-400 text-[10px] font-black uppercase tracking-[0.2em] w-full h-12">
                        Ver Detalhes Técnicos
                    </Button>
                </Card>
            </div>
        </AnimateIn>
    );
};

export default LegalCompliance;
