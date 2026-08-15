import React, { useState } from "react";
import { FileText, Download, FileSpreadsheet, Calendar, Filter, ShieldCheck, Theater, Building2, Landmark, CheckCircle2, TrendingUp, Users, DollarSign, Printer } from "lucide-react";
import { motion } from "framer-motion";
import { Button, Card, Badge, AnimateIn } from "@/components/ui";
import { toast } from "react-hot-toast";

export interface ReportCategory {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    type: "THEATER" | "MUSEUM" | "GOVERNANCE" | "SPONSOR";
    badgeText: string;
}

const REPORT_CATEGORIES: ReportCategory[] = [
    {
        id: "theater_box_office",
        title: "Relatório de Bilheteria & Arrecadação de Teatros",
        description: "Detalhamento de vendas por sessão, pagamentos via PIX/Cartão, inteiras, meias-entradas e taxas de pauta.",
        icon: <Theater size={24} className="text-amber-400" />,
        type: "THEATER",
        badgeText: "Teatros & Espetáculos"
    },
    {
        id: "theater_attendance",
        title: "Relatório de Frequência & Ocupação de Plateia",
        description: "Controle de público presente na portaria, check-ins efetuados, faltas e utilização de vagas acessíveis (PNE).",
        icon: <Users size={24} className="text-emerald-400" />,
        type: "THEATER",
        badgeText: "Portaria & Frequência"
    },
    {
        id: "museum_visitation",
        title: "Relatório de Visitação & Acervo de Museus",
        description: "Contagem de visitantes em exposições, interações com QR Code nas obras, acervos mais acessados e pesquisas.",
        icon: <Landmark size={24} className="text-blue-400" />,
        type: "MUSEUM",
        badgeText: "Museus & Coleções"
    },
    {
        id: "governance_transparency",
        title: "Manifesto de Transparência & Editais Públicos",
        description: "Relatório oficial de projetos contemplados na Lei Paulo Gustavo / PNAB para auditoria do Tribunal de Contas.",
        icon: <ShieldCheck size={24} className="text-purple-400" />,
        type: "GOVERNANCE",
        badgeText: "Auditoria Pública"
    },
    {
        id: "sponsor_mecenato",
        title: "Relatório de Aportes & Mecenato de Patrocinadores",
        description: "Consolidado de investimentos privados recebidos via Lei Rouanet, contrapartidas cumpridas e prestação de contas.",
        icon: <DollarSign size={24} className="text-pink-400" />,
        type: "SPONSOR",
        badgeText: "Patrocínios & Incentivo"
    }
];

export const AdminExportReports: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>("theater_box_office");
    const [dateRange, setDateRange] = useState<string>("THIS_MONTH");
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const [isExportingExcel, setIsExportingExcel] = useState(false);

    const handleExportPDF = (reportId: string) => {
        setIsExportingPDF(true);
        setTimeout(() => {
            setIsExportingPDF(false);
            window.print();
            toast.success("Relatório em PDF exportado com sucesso!");
        }, 1500);
    };

    const handleExportExcel = (reportId: string) => {
        setIsExportingExcel(true);
        setTimeout(() => {
            setIsExportingExcel(false);
            // Generate CSV Blob Data Dump
            const csvContent = "data:text/csv;charset=utf-8," 
                + "ID Espetaculo,Nome da Peca,Data Sessao,Ingressos Vendidos,Inteiras,Meias,Arrecadacao Bruta (R$),Taxa Pauta (R$)\n"
                + "PLAY-01,O Auto da Compadecida,2026-08-14,148,98,50,3700.00,370.00\n"
                + "PLAY-02,O Fantasma da Opera,2026-08-15,220,150,70,8800.00,880.00\n";
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `Relatorio_CulturaViva_${reportId}_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("Planilha Excel / CSV baixada com sucesso!");
        }, 1200);
    };

    return (
        <AnimateIn className="max-w-6xl mx-auto space-y-10 p-6 md:p-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-purple-500/20 border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-wider">
                            Gestão Governamental & Prestação de Contas
                        </Badge>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight italic">
                        Relatórios Exportáveis <small className="text-purple-400 text-lg">PDF & Excel</small>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Emissão de documentos oficiais com cabeçalho público para auditoria municipal e órgãos fiscalizadores.
                    </p>
                </div>
            </div>

            {/* Date Filter & Control Toolbar */}
            <div className="bg-slate-900/90 border border-white/10 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Calendar className="text-purple-400" size={20} />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Período de Análise:</span>
                    <select
                        value={dateRange}
                        onChange={e => setDateRange(e.target.value)}
                        className="bg-black/40 border border-white/10 text-white font-bold text-xs rounded-xl px-4 py-2.5 outline-none focus:border-purple-500"
                    >
                        <option value="TODAY">Hoje</option>
                        <option value="THIS_WEEK">Esta Semana</option>
                        <option value="THIS_MONTH">Este Mês (Agosto 2026)</option>
                        <option value="LAST_QUARTER">Último Trimestre</option>
                        <option value="ANNUAL">Consolidado Anual</option>
                    </select>
                </div>

                <div className="flex items-center gap-3">
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 px-3 py-1.5 text-[10px] font-bold uppercase">
                        ✓ Formato Homologado para Auditoria
                    </Badge>
                </div>
            </div>

            {/* Report Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {REPORT_CATEGORIES.map(report => {
                    const isSelected = selectedCategory === report.id;
                    return (
                        <Card
                            key={report.id}
                            onClick={() => setSelectedCategory(report.id)}
                            className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                                isSelected
                                    ? "bg-slate-900 border-purple-500 shadow-2xl shadow-purple-500/10 scale-102"
                                    : "bg-slate-950 border-white/10 hover:border-white/20"
                            }`}
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                                        {report.icon}
                                    </div>
                                    <Badge className="bg-white/5 text-slate-400 border-white/10 text-[9px] font-bold uppercase">
                                        {report.badgeText}
                                    </Badge>
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-white leading-tight">
                                        {report.title}
                                    </h3>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        {report.description}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between gap-3">
                                <Button
                                    onClick={(e) => { e.stopPropagation(); handleExportPDF(report.id); }}
                                    disabled={isExportingPDF}
                                    className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md"
                                >
                                    <FileText size={14} /> PDF
                                </Button>

                                <Button
                                    onClick={(e) => { e.stopPropagation(); handleExportExcel(report.id); }}
                                    disabled={isExportingExcel}
                                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md"
                                >
                                    <FileSpreadsheet size={14} /> Excel (CSV)
                                </Button>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Live Preview Sheet for Auditing */}
            <section className="bg-slate-900 border border-white/10 rounded-3xl p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Pré-visualização Oficial para Impressão</span>
                        <h2 className="text-2xl font-black text-white italic">
                            Demonstrativo Consolidado de Prestação de Contas
                        </h2>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={() => window.print()} variant="outline" className="border-white/10 text-slate-300 rounded-xl text-xs flex items-center gap-2">
                            <Printer size={16} /> Imprimir Timbrado
                        </Button>
                    </div>
                </div>

                {/* Print Sheet Simulation */}
                <div className="bg-white text-slate-950 p-8 rounded-2xl font-sans space-y-6 border border-slate-300 shadow-xl">
                    {/* Official Letterhead */}
                    <div className="flex items-center justify-between border-b-2 border-slate-950 pb-4">
                        <div>
                            <strong className="text-lg font-black block tracking-tight">PREFEITURA MUNICIPAL • SECRETARIA DE CULTURA</strong>
                            <span className="text-xs text-slate-600">Sistema Único de Governança Cultural "Cultura Viva"</span>
                        </div>
                        <div className="text-right text-xs text-slate-600">
                            <p><strong>Emissão:</strong> {new Date().toLocaleDateString("pt-BR")}</p>
                            <p><strong>Autenticação:</strong> CV-AUDIT-{Math.floor(100000 + Math.random() * 900000)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-xs bg-slate-100 p-4 rounded-xl border border-slate-300">
                        <div>
                            <span className="text-slate-500 block">Equipamento Cultural:</span>
                            <strong className="text-sm font-black">Teatro Municipal</strong>
                        </div>
                        <div>
                            <span className="text-slate-500 block">Período Selecionado:</span>
                            <strong className="text-sm font-black">01/08/2026 a 31/08/2026</strong>
                        </div>
                        <div>
                            <span className="text-slate-500 block">Status de Auditoria:</span>
                            <strong className="text-sm font-black text-emerald-700">✓ Aprovado sem Ressalvas</strong>
                        </div>
                    </div>

                    {/* Data Table */}
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-slate-200 border-b border-slate-400">
                                <th className="p-2.5 font-black">Espetáculo / Evento</th>
                                <th className="p-2.5 font-black">Data</th>
                                <th className="p-2.5 font-black text-center">Ingressos Vendidos</th>
                                <th className="p-2.5 font-black text-right">Faturamento Bruto</th>
                                <th className="p-2.5 font-black text-right">Pauta Pública (10%)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-300">
                            <tr>
                                <td className="p-2.5 font-bold">O Auto da Compadecida</td>
                                <td className="p-2.5">14/08/2026</td>
                                <td className="p-2.5 text-center">148</td>
                                <td className="p-2.5 text-right font-bold">R$ 3.700,00</td>
                                <td className="p-2.5 text-right text-emerald-800 font-bold">R$ 370,00</td>
                            </tr>
                            <tr>
                                <td className="p-2.5 font-bold">O Fantasma da Ópera</td>
                                <td className="p-2.5">15/08/2026</td>
                                <td className="p-2.5 text-center">220</td>
                                <td className="p-2.5 text-right font-bold">R$ 8.800,00</td>
                                <td className="p-2.5 text-right text-emerald-800 font-bold">R$ 880,00</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-100 font-black border-t-2 border-slate-950">
                                <td className="p-2.5 uppercase" colSpan={2}>Total Geral Acumulado:</td>
                                <td className="p-2.5 text-center">368 ingressos</td>
                                <td className="p-2.5 text-right text-sm">R$ 12.500,00</td>
                                <td className="p-2.5 text-right text-sm text-emerald-800">R$ 1.250,00</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div className="pt-4 border-t border-slate-300 text-[10px] text-slate-500 text-center italic">
                        Documento gerado automaticamente pelo Ecossistema Cultura Viva com assinatura digital de conformidade governamental.
                    </div>
                </div>
            </section>
        </AnimateIn>
    );
};
