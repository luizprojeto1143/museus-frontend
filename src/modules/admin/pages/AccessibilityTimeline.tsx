import React, { useEffect, useState } from "react";
import { api } from "../../../api/client";

type TimelineItem = {
    id: string;
    date: string;
    type: string;
    status: string;
    requestedAt: string;
    requestedBy?: string;
    approvedAt?: string;
    approvedBy?: string;
    executedAt?: string;
    provider?: string;
    project?: string;
    delayDays?: number;
};

const serviceTypeLabels: Record<string, { label: string; icon: string }> = {
    LIBRAS_INTERPRETATION: { label: "Interpretação em Libras", icon: "🤟" },
    AUDIO_DESCRIPTION: { label: "Audiodescrição", icon: "🔊" },
    CAPTIONING: { label: "Legendagem", icon: "📝" },
    BRAILLE: { label: "Braille", icon: "⠃" },
    TACTILE_MODEL: { label: "Maquete Tátil", icon: "🖐️" },
    EASY_READING: { label: "Leitura Fácil", icon: "📖" }
};

const statusLabels: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Pendente", color: "#f59e0b" },
    IN_PROGRESS: { label: "Em Execução", color: "#3b82f6" },
    COMPLETED: { label: "Concluído", color: "#10b981" },
    CANCELLED: { label: "Cancelado", color: "#ef4444" }
};

const AccessibilityTimeline: React.FC = () => {
    const [timeline, setTimeline] = useState<TimelineItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTimeline();
    }, []);

    const fetchTimeline = async () => {
        try {
            const response = await api.get("/secretary/accessibility-timeline");
            setTimeline(response.data);
        } catch (err) {
            console.error("Erro ao carregar linha do tempo", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ padding: 32, textAlign: "center" }}>Carregando...</div>;
    }

    return (
        <div style={{ padding: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
                Linha do Tempo de Acessibilidade
            </h1>
            <p style={{ color: "#6b7280", marginBottom: 32 }}>
                Histórico institucional de ações de acessibilidade - blindagem política e prova de política pública contínua
            </p>

            {timeline.length === 0 ? (
                <div style={{ textAlign: "center", padding: 48, color: "#9ca3af" }}>
                    Nenhuma ação de acessibilidade registrada
                </div>
            ) : (
                <div style={{ position: "relative" }}>
                    {/* Vertical Line */}
                    <div style={{
                        position: "absolute",
                        left: 24,
                        top: 0,
                        bottom: 0,
                        width: 2,
                        backgroundColor: "#e5e7eb"
                    }} />

                    {/* Timeline Items */}
                    {timeline.map((item, idx) => {
                        const serviceInfo = serviceTypeLabels[item.type] || { label: item.type, icon: "♿" };
                        const statusInfo = statusLabels[item.status] || { label: item.status, color: "#6b7280" };

                        return (
                            <div key={item.id} style={{ position: "relative", paddingLeft: 60, paddingBottom: 32 }}>
                                {/* Dot */}
                                <div style={{
                                    position: "absolute",
                                    left: 16,
                                    top: 4,
                                    width: 18,
                                    height: 18,
                                    borderRadius: "50%",
                                    backgroundColor: statusInfo.color,
                                    border: "3px solid white",
                                    boxShadow: "0 0 0 2px " + statusInfo.color
                                }} />

                                {/* Content */}
                                <div style={{
                                    backgroundColor: "white",
                                    borderRadius: 12,
                                    padding: 20,
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                                }}>
                                    {/* Header */}
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <span style={{ fontSize: 28 }}>{serviceInfo.icon}</span>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 16 }}>
                                                    {serviceInfo.label}
                                                </div>
                                                {item.project && (
                                                    <div style={{ fontSize: 13, color: "#6b7280" }}>
                                                        Projeto: {item.project}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span style={{
                                            padding: "4px 12px",
                                            borderRadius: 999,
                                            fontSize: 13,
                                            fontWeight: 600,
                                            backgroundColor: statusInfo.color + "20",
                                            color: statusInfo.color
                                        }}>
                                            {statusInfo.label}
                                        </span>
                                    </div>

                                    {/* Timeline Details */}
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, fontSize: 14 }}>
                                        <div>
                                            <div style={{ color: "#9ca3af", marginBottom: 2 }}>Solicitado em</div>
                                            <div style={{ fontWeight: 500 }}>
                                                {new Date(item.requestedAt).toLocaleDateString("pt-BR")}
                                            </div>
                                            {item.requestedBy && (
                                                <div style={{ fontSize: 12, color: "#6b7280" }}>por {item.requestedBy}</div>
                                            )}
                                        </div>

                                        {item.approvedAt && (
                                            <div>
                                                <div style={{ color: "#9ca3af", marginBottom: 2 }}>Aprovado em</div>
                                                <div style={{ fontWeight: 500 }}>
                                                    {new Date(item.approvedAt).toLocaleDateString("pt-BR")}
                                                </div>
                                                {item.approvedBy && (
                                                    <div style={{ fontSize: 12, color: "#6b7280" }}>por {item.approvedBy}</div>
                                                )}
                                            </div>
                                        )}

                                        {item.executedAt && (
                                            <div>
                                                <div style={{ color: "#9ca3af", marginBottom: 2 }}>Executado em</div>
                                                <div style={{ fontWeight: 500 }}>
                                                    {new Date(item.executedAt).toLocaleDateString("pt-BR")}
                                                </div>
                                                {item.provider && (
                                                    <div style={{ fontSize: 12, color: "#6b7280" }}>por {item.provider}</div>
                                                )}
                                            </div>
                                        )}

                                        {item.delayDays !== null && item.delayDays !== undefined && (
                                            <div>
                                                <div style={{ color: "#9ca3af", marginBottom: 2 }}>Tempo de Execução</div>
                                                <div style={{
                                                    fontWeight: 500,
                                                    color: item.delayDays > 30 ? "#ef4444" : item.delayDays > 14 ? "#f59e0b" : "#10b981"
                                                }}>
                                                    {item.delayDays} dias
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AccessibilityTimeline;
