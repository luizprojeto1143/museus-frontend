import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useTranslation } from "react-i18next";
import { Search, Filter, Plus, FileText, ArrowRight } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

interface Notice {
    id: string;
    title: string;
    description: string;
    status: string;
    registrationStartDate: string;
    registrationEndDate: string;
    type: string;
}

export const ProducerNotices: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [canSubmit, setCanSubmit] = useState(true);

    useEffect(() => {
        if (tenantId) {
            api.get(`/tenants/${tenantId}/features`)
                .then(res => {
                    // Only disable if explicitly set to false
                    if (res.data.featureEditaisSubmission === false) {
                        setCanSubmit(false);
                    }
                })
                .catch(err => console.error("Error fetching features", err));
        }

        api.get("/notices/public?status=INSCRIPTIONS_OPEN")
            .then(res => setNotices(Array.isArray(res.data) ? res.data : []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [tenantId]);

    const handleApply = (noticeId: string) => {
        navigate(`/producer/projects/new?noticeId=${noticeId}`);
    };

    if (loading) return <div className="loading">Carregando editais...</div>;

    return (
        <div className="producer-notices">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.8rem", color: "#d4af37", marginBottom: "0.5rem" }}>📋 Editais Abertos</h1>
                    <p style={{ color: "#B0A090" }}>Inscreva seus projetos nos editais disponíveis</p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                {notices.length === 0 ? (
                    <p style={{ color: "#B0A090" }}>Nenhum edital com inscrições abertas no momento.</p>
                ) : (
                    notices.map(notice => (
                        <div key={notice.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div style={{ display: "flex", alignItems: "start", gap: "1rem" }}>
                                <div style={{ background: "rgba(212, 175, 55, 0.1)", padding: "0.75rem", borderRadius: "0.5rem" }}>
                                    <FileText size={24} color="#d4af37" />
                                </div>
                                <div>
                                    <h3 style={{ margin: "0 0 0.5rem 0", color: "#f5e6d3" }}>{notice.title}</h3>
                                    <span className="badge badge-success">Inscrições Abertas</span>
                                </div>
                            </div>

                            <p style={{ color: "#B0A090", fontSize: "0.9rem", flex: 1 }}>{notice.description?.substring(0, 120)}...</p>

                            <div style={{ padding: "1rem", background: "rgba(44, 30, 16, 0.5)", borderRadius: "0.5rem", fontSize: "0.85rem" }}>
                                <div><strong>Início:</strong> {new Date(notice.registrationStartDate).toLocaleDateString()}</div>
                                <div><strong>Fim:</strong> {new Date(notice.registrationEndDate).toLocaleDateString()}</div>
                            </div>

                            {canSubmit ? (
                                <button
                                    onClick={() => handleApply(notice.id)}
                                    className="btn-primary"
                                    style={{ width: "100%", justifyContent: "center" }}
                                >
                                    Inscrever Projeto <ArrowRight size={16} />
                                </button>
                            ) : (
                                <div style={{ textAlign: "center", padding: "0.5rem", color: "#B0A090", fontSize: "0.85rem", background: "rgba(44, 30, 16, 0.5)", borderRadius: "0.5rem" }}>
                                    Submissão sob consulta
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
