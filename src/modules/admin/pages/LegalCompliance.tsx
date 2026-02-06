import React, { useEffect, useState } from "react";
import { api } from "../../../api/client";

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
    const [data, setData] = useState<ComplianceData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCompliance();
    }, []);

    const fetchCompliance = async () => {
        try {
            const response = await api.get("/secretary/legal-compliance");
            setData(response.data);
        } catch (err) {
            console.error("Erro ao carregar conformidade", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ padding: 32, textAlign: "center" }}>Carregando...</div>;
    }

    if (!data) {
        return <div style={{ padding: 32, textAlign: "center", color: "#ef4444" }}>Erro ao carregar dados</div>;
    }

    return (
        <div style={{ padding: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Matriz de Conformidade Legal</h1>
            <p style={{ color: "#6b7280", marginBottom: 24 }}>
                Mapeamento entre funcionalidades do sistema e exigências legais de acessibilidade
            </p>

            {/* Summary Card */}
            <div style={{
                backgroundColor: data.summary.complianceRate >= 80 ? "#dcfce7" : data.summary.complianceRate >= 50 ? "#fef3c7" : "#fee2e2",
                borderRadius: 12,
                padding: 24,
                marginBottom: 32,
                display: "flex",
                alignItems: "center",
                gap: 24
            }}>
                <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    backgroundColor: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    fontWeight: 700,
                    color: data.summary.complianceRate >= 80 ? "#16a34a" : data.summary.complianceRate >= 50 ? "#d97706" : "#dc2626"
                }}>
                    {data.summary.complianceRate}%
                </div>
                <div>
                    <div style={{ fontSize: 20, fontWeight: 600, color: "#111827" }}>
                        Taxa de Conformidade
                    </div>
                    <div style={{ color: "#6b7280" }}>
                        {data.summary.compliant} de {data.summary.totalLaws} leis/normas atendidas
                    </div>
                </div>
            </div>

            {/* Matrix Table */}
            <div style={{ backgroundColor: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f9fafb" }}>
                            <th style={{ padding: 16, textAlign: "left", fontWeight: 600, borderBottom: "2px solid #e5e7eb" }}>
                                Lei / Norma
                            </th>
                            <th style={{ padding: 16, textAlign: "left", fontWeight: 600, borderBottom: "2px solid #e5e7eb" }}>
                                Exigência
                            </th>
                            <th style={{ padding: 16, textAlign: "left", fontWeight: 600, borderBottom: "2px solid #e5e7eb" }}>
                                Como Atendemos
                            </th>
                            <th style={{ padding: 16, textAlign: "left", fontWeight: 600, borderBottom: "2px solid #e5e7eb" }}>
                                Evidência
                            </th>
                            <th style={{ padding: 16, textAlign: "center", fontWeight: 600, borderBottom: "2px solid #e5e7eb" }}>
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.matrix.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb" }}>
                                <td style={{ padding: 16, fontWeight: 500, color: "#1f2937" }}>
                                    {item.law}
                                </td>
                                <td style={{ padding: 16, color: "#4b5563" }}>
                                    {item.requirement}
                                </td>
                                <td style={{ padding: 16, color: "#4b5563" }}>
                                    {item.howWeComply}
                                </td>
                                <td style={{ padding: 16, color: "#6b7280", fontSize: 14 }}>
                                    {item.evidence}
                                </td>
                                <td style={{ padding: 16, textAlign: "center" }}>
                                    {item.compliant ? (
                                        <span style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 4,
                                            backgroundColor: "#dcfce7",
                                            color: "#16a34a",
                                            padding: "6px 12px",
                                            borderRadius: 999,
                                            fontWeight: 600,
                                            fontSize: 13
                                        }}>
                                            ✓ Conforme
                                        </span>
                                    ) : (
                                        <span style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 4,
                                            backgroundColor: "#fee2e2",
                                            color: "#dc2626",
                                            padding: "6px 12px",
                                            borderRadius: 999,
                                            fontWeight: 600,
                                            fontSize: 13
                                        }}>
                                            ✗ Pendente
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Legal References */}
            <div style={{ marginTop: 32, padding: 24, backgroundColor: "#f9fafb", borderRadius: 12 }}>
                <h3 style={{ fontWeight: 600, marginBottom: 12 }}>📚 Referências Legais</h3>
                <ul style={{ color: "#6b7280", lineHeight: 1.8, paddingLeft: 20 }}>
                    <li><strong>Lei 13.146/2015 (LBI)</strong> - Lei Brasileira de Inclusão da Pessoa com Deficiência</li>
                    <li><strong>Lei 10.098/2000</strong> - Normas gerais e critérios básicos para acessibilidade</li>
                    <li><strong>NBR 9050:2020</strong> - Acessibilidade a edificações, mobiliário, espaços e equipamentos urbanos</li>
                    <li><strong>Decreto 5.296/2004</strong> - Regulamenta lei de acessibilidade</li>
                    <li><strong>Lei 12.527/2011 (LAI)</strong> - Lei de Acesso à Informação</li>
                </ul>
            </div>
        </div>
    );
};

export default LegalCompliance;
