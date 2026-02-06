import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useTranslation } from "react-i18next";
import { Search, Filter, Plus, FileText, ArrowRight } from "lucide-react";
// import "./ProducerNotices.css"; // Reuse existing styles or inline

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
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch OPEN notices
        // Assuming we have an endpoint that returns notices visible to public/producers
        // or we filter by tenant if logged in (Producer is linked to a tenant)
        api.get("/notices?status=INSCRIPTIONS_OPEN")
            .then(res => setNotices(Array.isArray(res.data) ? res.data : []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleApply = (noticeId: string) => {
        // Redirect to create project with noticeId pre-filled
        navigate(`/producer/events/new?noticeId=${noticeId}`); // Using 'events' route temporarily or create 'projects' route?
        // Wait, 'ProducerEvents' was existing, but we want 'ProducerProjects'.
        // Let's assume we map /producer/events to Projects or create a new route /producer/projects
        // The implementation plan says "ProducerProjects". Let's stick to that.
        navigate(`/producer/projects/new?noticeId=${noticeId}`);
    };

    if (loading) return <div className="loading">Carregando editais...</div>;

    return (
        <div className="producer-notices">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 className="page-title">Editais Abertos</h1>
                    <p className="page-subtitle">Inscreva seus projetos nos editais disponíveis</p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                {notices.length === 0 ? (
                    <p style={{ color: "#888" }}>Nenhum edital com inscrições abertas no momento.</p>
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

                            <p style={{ color: "#aaa", fontSize: "0.9rem", flex: 1 }}>{notice.description?.substring(0, 120)}...</p>

                            <div style={{ padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "0.5rem", fontSize: "0.85rem" }}>
                                <div><strong>Início:</strong> {new Date(notice.registrationStartDate).toLocaleDateString()}</div>
                                <div><strong>Fim:</strong> {new Date(notice.registrationEndDate).toLocaleDateString()}</div>
                            </div>

                            <button
                                onClick={() => handleApply(notice.id)}
                                className="btn-primary"
                                style={{ width: "100%", justifyContent: "center" }}
                            >
                                Inscrever Projeto <ArrowRight size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
