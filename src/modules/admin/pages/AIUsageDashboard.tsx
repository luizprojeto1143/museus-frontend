import React, { useEffect, useState } from "react";
import { api } from "../../../api/client";

type AIUsageData = {
    current: {
        month: number;
        year: number;
        analysesCount: number;
        tokensUsed: number;
        estimatedCost: number;
        limit: number;
        percentUsed: number;
    };
    history: {
        month: number;
        year: number;
        label: string;
        analysesCount: number;
        tokensUsed: number;
        estimatedCost: number;
    }[];
    totals: {
        totalAnalyses: number;
        totalTokens: number;
        totalCost: number;
    };
};

type LimitData = {
    allowed: boolean;
    current: number;
    limit: number;
    remaining: number;
    percentUsed: number;
    tier: string;
    tierLabel: string;
};

const AIUsageDashboard: React.FC = () => {
    const [usage, setUsage] = useState<AIUsageData | null>(null);
    const [limits, setLimits] = useState<LimitData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usageRes, limitsRes] = await Promise.all([
                api.get("/ai-costs/usage?months=6"),
                api.get("/ai-costs/limits")
            ]);
            setUsage(usageRes.data);
            setLimits(limitsRes.data);
        } catch (err) {
            console.error("Erro ao carregar dados de IA", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ padding: 32, textAlign: "center" }}>Carregando...</div>;
    }

    if (!usage || !limits) {
        return <div style={{ padding: 32, textAlign: "center", color: "#ef4444" }}>Erro ao carregar dados</div>;
    }

    const getProgressColor = (percent: number) => {
        if (percent >= 90) return "#ef4444";
        if (percent >= 70) return "#f59e0b";
        return "#10b981";
    };

    return (
        <div style={{ padding: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Uso de Inteligência Artificial</h1>
            <p style={{ color: "#6b7280", marginBottom: 24 }}>
                Monitoramento de consumo e custos estimados de IA
            </p>

            {/* Current Month Status */}
            <div style={{
                backgroundColor: "white",
                borderRadius: 12,
                padding: 24,
                marginBottom: 24,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Mês Atual</h2>
                        <p style={{ color: "#6b7280", fontSize: 14 }}>
                            Tier: <span style={{ fontWeight: 500 }}>{limits.tierLabel}</span>
                        </p>
                    </div>
                    <div style={{
                        padding: "8px 16px",
                        borderRadius: 8,
                        backgroundColor: limits.percentUsed >= 90 ? "#fee2e2" : limits.percentUsed >= 70 ? "#fef3c7" : "#dcfce7",
                        color: limits.percentUsed >= 90 ? "#dc2626" : limits.percentUsed >= 70 ? "#d97706" : "#16a34a",
                        fontWeight: 600
                    }}>
                        {limits.remaining} análises restantes
                    </div>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
                        <span>{usage.current.analysesCount} de {limits.limit}</span>
                        <span style={{ fontWeight: 600 }}>{limits.percentUsed}%</span>
                    </div>
                    <div style={{
                        height: 12,
                        backgroundColor: "#e5e7eb",
                        borderRadius: 999,
                        overflow: "hidden"
                    }}>
                        <div style={{
                            height: "100%",
                            width: `${Math.min(limits.percentUsed, 100)}%`,
                            backgroundColor: getProgressColor(limits.percentUsed),
                            transition: "width 0.3s ease"
                        }} />
                    </div>
                </div>

                {/* Stats Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                    <StatCard
                        label="Análises"
                        value={usage.current.analysesCount.toString()}
                        icon="🤖"
                    />
                    <StatCard
                        label="Tokens Usados"
                        value={usage.current.tokensUsed.toLocaleString("pt-BR")}
                        icon="📊"
                    />
                    <StatCard
                        label="Custo Estimado"
                        value={`US$ ${usage.current.estimatedCost.toFixed(2)}`}
                        icon="💰"
                    />
                </div>
            </div>

            {/* Warning if near limit */}
            {limits.percentUsed >= 80 && (
                <div style={{
                    padding: 16,
                    borderRadius: 8,
                    backgroundColor: limits.percentUsed >= 90 ? "#fee2e2" : "#fef3c7",
                    borderLeft: `4px solid ${limits.percentUsed >= 90 ? "#ef4444" : "#f59e0b"}`,
                    marginBottom: 24
                }}>
                    <strong>⚠️ {limits.percentUsed >= 90 ? "Limite quase atingido!" : "Atenção"}</strong>
                    <p style={{ margin: "8px 0 0", fontSize: 14 }}>
                        Você já utilizou {limits.percentUsed}% do seu limite mensal.
                        {limits.percentUsed >= 90
                            ? " Considere fazer upgrade do plano para evitar interrupções."
                            : " Monitore seu uso para não exceder o limite."
                        }
                    </p>
                </div>
            )}

            {/* History */}
            <div style={{
                backgroundColor: "white",
                borderRadius: 12,
                padding: 24,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Histórico de Uso</h2>

                {usage.history.length === 0 ? (
                    <p style={{ color: "#9ca3af", textAlign: "center", padding: 24 }}>
                        Nenhum histórico disponível
                    </p>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                                <th style={{ padding: 12, textAlign: "left", fontWeight: 600 }}>Período</th>
                                <th style={{ padding: 12, textAlign: "right", fontWeight: 600 }}>Análises</th>
                                <th style={{ padding: 12, textAlign: "right", fontWeight: 600 }}>Tokens</th>
                                <th style={{ padding: 12, textAlign: "right", fontWeight: 600 }}>Custo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usage.history.map((h, idx) => (
                                <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb" }}>
                                    <td style={{ padding: 12 }}>{h.label}</td>
                                    <td style={{ padding: 12, textAlign: "right" }}>{h.analysesCount}</td>
                                    <td style={{ padding: 12, textAlign: "right" }}>{h.tokensUsed.toLocaleString("pt-BR")}</td>
                                    <td style={{ padding: 12, textAlign: "right" }}>US$ {h.estimatedCost.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr style={{ backgroundColor: "#f9fafb", fontWeight: 600 }}>
                                <td style={{ padding: 12 }}>Total</td>
                                <td style={{ padding: 12, textAlign: "right" }}>{usage.totals.totalAnalyses}</td>
                                <td style={{ padding: 12, textAlign: "right" }}>{usage.totals.totalTokens.toLocaleString("pt-BR")}</td>
                                <td style={{ padding: 12, textAlign: "right" }}>US$ {usage.totals.totalCost.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                )}
            </div>
        </div>
    );
};

const StatCard: React.FC<{ label: string; value: string; icon: string }> = ({ label, value, icon }) => (
    <div style={{
        padding: 16,
        backgroundColor: "#f9fafb",
        borderRadius: 8,
        textAlign: "center"
    }}>
        <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>{value}</div>
        <div style={{ fontSize: 13, color: "#6b7280" }}>{label}</div>
    </div>
);

export default AIUsageDashboard;
