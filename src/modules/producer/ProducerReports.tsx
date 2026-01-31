import React, { useEffect, useState } from "react";
import { PieChart, BarChart, FileText, Download, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { api } from "../../api/client";
import { useAuth } from "../auth/AuthContext";

export const ProducerReports: React.FC = () => {
    const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [stats, setStats] = useState({
        revenue: 0,
        ticketsSold: 0,
        checkIns: 0,
        conversion: 0
    });

    useEffect(() => {
        if (!tenantId) return;
        api.get("/analytics/sales-summary")
            .then(res => {
                const data = res.data;
                setStats({
                    revenue: data.totalRevenue || 0,
                    ticketsSold: data.ticketsSold || 0,
                    checkIns: data.checkInCount || 0,
                    conversion: data.conversionRate || 0
                });
            })
            .catch(err => console.error("Error fetching reports", err));
    }, [tenantId]);

    return (
        <div className="producer-reports">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: "3rem" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", color: "#d4af37", marginBottom: "0.5rem" }}>{t("producer.reports.title")}</h1>
                    <p style={{ opacity: 0.7 }}>{t("producer.reports.subtitle")}</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "3rem" }}>
                <div style={{ background: "rgba(255,255,255,0.05)", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ fontSize: "0.9rem", opacity: 0.6, marginBottom: "0.5rem" }}>{t("producer.reports.metrics.revenue")}</div>
                    <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#d4af37" }}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.revenue)}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#4cd964", marginTop: "0.5rem" }}>{t("producer.reports.metrics.tickets")}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.05)", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ fontSize: "0.9rem", opacity: 0.6, marginBottom: "0.5rem" }}>{t("producer.reports.metrics.ticketsSold")}</div>
                    <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.ticketsSold}</div>
                    <div style={{ fontSize: "0.8rem", opacity: 0.5, marginTop: "0.5rem" }}>{t("producer.reports.metrics.totalIssued")}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.05)", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ fontSize: "0.9rem", opacity: 0.6, marginBottom: "0.5rem" }}>{t("producer.reports.metrics.audience")}</div>
                    <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.checkIns}</div>
                    <div style={{ fontSize: "0.8rem", opacity: 0.5, marginTop: "0.5rem" }}>{t("producer.reports.metrics.checkIns")}</div>
                </div>
            </div>

            {/* Reports List */}
            <h3 style={{ fontSize: "1.2rem", marginBottom: "1.5rem", borderLeft: "4px solid #d4af37", paddingLeft: "1rem" }}>{t("producer.reports.available")}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>

                {/* Card 1 */}
                <div style={{ background: "#1e1e24", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                        <div style={{ background: "rgba(76, 217, 100, 0.1)", padding: "0.8rem", borderRadius: "0.5rem" }}>
                            <FileText size={24} color="#4cd964" />
                        </div>
                        <div>
                            <div style={{ fontWeight: "bold" }}>{t("producer.reports.accessibility.title")}</div>
                            <div style={{ fontSize: "0.8rem", opacity: 0.5 }}>{t("producer.reports.accessibility.subtitle")}</div>
                        </div>
                    </div>
                    <p style={{ fontSize: "0.9rem", opacity: 0.7, marginBottom: "1.5rem", lineHeight: "1.5" }}>
                        {t("producer.reports.accessibility.desc")}
                    </p>
                    <button style={{ width: "100%", padding: "0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "white", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
                        <Download size={16} /> {t("producer.reports.accessibility.download")}
                    </button>
                </div>

                {/* Card 2 */}
                <div style={{ background: "#1e1e24", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                        <div style={{ background: "rgba(212, 175, 55, 0.1)", padding: "0.8rem", borderRadius: "0.5rem" }}>
                            <TrendingUp size={24} color="#d4af37" />
                        </div>
                        <div>
                            <div style={{ fontWeight: "bold" }}>{t("producer.reports.financial.title")}</div>
                            <div style={{ fontSize: "0.8rem", opacity: 0.5 }}>{t("producer.reports.financial.subtitle")}</div>
                        </div>
                    </div>
                    <p style={{ fontSize: "0.9rem", opacity: 0.7, marginBottom: "1.5rem", lineHeight: "1.5" }}>
                        {t("producer.reports.financial.desc")}
                    </p>
                    <button style={{ width: "100%", padding: "0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "white", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
                        <Download size={16} /> {t("producer.reports.financial.download")}
                    </button>
                </div>

            </div>
        </div>
    );
};
