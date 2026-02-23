import React, { useEffect, useState } from "react";
import { FileText, Download, TrendingUp, DollarSign, Ticket, Users, BarChart3, PieChart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { api } from "../../api/client";
import { useAuth } from "../auth/AuthContext";
import { Button } from "../../components/ui";

export const ProducerReports: React.FC = () => {
    const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [stats, setStats] = useState({
        revenue: 0,
        ticketsSold: 0,
        checkIns: 0,
        conversion: 0
    });

    const [accessStats, setAccessStats] = useState({ executions: 0, requests: 0 });

    useEffect(() => {
        if (!tenantId) return;

        Promise.all([
            api.get("/analytics/sales-summary"),
            api.get("/analytics/accessibility-summary")
        ]).then(([salesRes, accessRes]) => {
            const data = salesRes.data;
            setStats({
                revenue: data.totalRevenue || 0,
                ticketsSold: data.ticketsSold || 0,
                checkIns: data.checkInCount || 0,
                conversion: data.conversionRate || 0
            });

            if (accessRes.data) {
                setAccessStats({
                    executions: accessRes.data.executions || 0,
                    requests: accessRes.data.requests || 0
                });
            }
        }).catch(err => console.error("Error fetching reports", err));

    }, [tenantId]);

    const handleDownload = (type: 'financial' | 'accessibility') => {
        const date = new Date().toISOString().split('T')[0];
        let content = "";
        let filename = "";

        if (type === 'financial') {
            content = "Relatório Financeiro\n\n";
            content += `Data: ${date}\n`;
            content += `Receita Total: R$ ${stats.revenue.toFixed(2)}\n`;
            content += `Ingressos Vendidos: ${stats.ticketsSold}\n`;
            content += `Check-ins: ${stats.checkIns}\n`;
            content += `Conversão: ${stats.conversion}%\n`;
            filename = `financeiro-${date}.csv`;
        } else {
            content = "Relatório de Acessibilidade\n\n";
            content += `Data: ${date}\n`;
            content += "Recursos Ativos: Audiodescrição, LIBRAS, Fontes para Dislexia\n";
            content += `Execuções Realizadas: ${accessStats.executions}\n`;
            content += `Solicitações de Assistência: ${accessStats.requests}\n`;
            filename = `acessibilidade-${date}.csv`;
        }

        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="producer-reports p-6 md:p-12 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#D4AF37] mb-2 font-serif">{t("producer.reports.title")}</h1>
                    <p className="text-[#B0A090]">{t("producer.reports.subtitle")}</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-[#2c1e10] p-6 rounded-2xl border border-[#463420] shadow-lg shadow-black/20">
                    <div className="flex items-center gap-3 text-[#B0A090] text-sm font-medium mb-3">
                        <DollarSign size={18} className="text-[#D4AF37]" /> {t("producer.reports.metrics.revenue")}
                    </div>
                    <div className="text-4xl font-bold text-[#EAE0D5] font-serif">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.revenue)}
                    </div>
                    <div className="text-xs text-[#4cd964] mt-2 flex items-center gap-1 font-bold">
                        <TrendingUp size={12} /> +12% esse mês
                    </div>
                </div>

                <div className="bg-[#2c1e10] p-6 rounded-2xl border border-[#463420] shadow-lg shadow-black/20">
                    <div className="flex items-center gap-3 text-[#B0A090] text-sm font-medium mb-3">
                        <Ticket size={18} className="text-[#D4AF37]" /> {t("producer.reports.metrics.ticketsSold")}
                    </div>
                    <div className="text-4xl font-bold text-[#EAE0D5] font-serif">{stats.ticketsSold}</div>
                    <div className="text-xs text-[#B0A090]/60 mt-2">
                        {t("producer.reports.metrics.totalIssued")}
                    </div>
                </div>

                <div className="bg-[#2c1e10] p-6 rounded-2xl border border-[#463420] shadow-lg shadow-black/20">
                    <div className="flex items-center gap-3 text-[#B0A090] text-sm font-medium mb-3">
                        <Users size={18} className="text-[#D4AF37]" /> {t("producer.reports.metrics.audience")}
                    </div>
                    <div className="text-4xl font-bold text-[#EAE0D5] font-serif">{stats.checkIns}</div>
                    <div className="text-xs text-[#B0A090]/60 mt-2">
                        {t("producer.reports.metrics.checkIns")}
                    </div>
                </div>
            </div>

            {/* Reports List */}
            <h3 className="text-xl font-bold text-[#EAE0D5] mb-6 pl-4 border-l-4 border-[#D4AF37]">
                {t("producer.reports.available")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Accessibility Report */}
                <div className="bg-[#2c1e10] p-6 rounded-2xl border border-[#463420] group hover:border-[#D4AF37]/50 transition-all hover:-translate-y-1 shadow-lg shadow-black/20">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-[#4cd964]/10 p-3 rounded-xl text-[#4cd964]">
                            <FileText size={24} />
                        </div>
                        <div>
                            <div className="font-bold text-[#EAE0D5] group-hover:text-[#D4AF37] transition-colors">{t("producer.reports.accessibility.title")}</div>
                            <div className="text-xs text-[#B0A090]">{accessStats.executions} execuções registradas</div>
                        </div>
                    </div>
                    <p className="text-sm text-[#B0A090] mb-6 leading-relaxed line-clamp-3 min-h-[60px]">
                        {t("producer.reports.accessibility.desc")}
                    </p>
                    <Button
                        onClick={() => handleDownload('accessibility')}
                        variant="outline"
                        className="w-full border-[#463420] text-[#B0A090] hover:text-[#EAE0D5] hover:bg-white/5 hover:border-[#D4AF37]/30"
                        leftIcon={<Download size={16} />}
                    >
                        {t("producer.reports.accessibility.download")}
                    </Button>
                </div>

                {/* Financial Report */}
                <div className="bg-[#2c1e10] p-6 rounded-2xl border border-[#463420] group hover:border-[#D4AF37]/50 transition-all hover:-translate-y-1 shadow-lg shadow-black/20">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-[#D4AF37]/10 p-3 rounded-xl text-[#D4AF37]">
                            <BarChart3 size={24} />
                        </div>
                        <div>
                            <div className="font-bold text-[#EAE0D5] group-hover:text-[#D4AF37] transition-colors">{t("producer.reports.financial.title")}</div>
                            <div className="text-xs text-[#B0A090]">{t("producer.reports.financial.subtitle")}</div>
                        </div>
                    </div>
                    <p className="text-sm text-[#B0A090] mb-6 leading-relaxed line-clamp-3 min-h-[60px]">
                        {t("producer.reports.financial.desc")}
                    </p>
                    <Button
                        onClick={() => handleDownload('financial')}
                        variant="outline"
                        className="w-full border-[#463420] text-[#B0A090] hover:text-[#EAE0D5] hover:bg-white/5 hover:border-[#D4AF37]/30"
                        leftIcon={<Download size={16} />}
                    >
                        {t("producer.reports.financial.download")}
                    </Button>
                </div>

            </div>
        </div>
    );
};
