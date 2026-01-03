import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";

interface Certificate {
    id: string;
    code: string;
    type: string;
    generatedAt: string;
    tenant: { name: string };
    metadata: any;
}

export const VisitorProfile: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [certificates, setCertificates] = React.useState<Certificate[]>([]);
    const [loadingCerts, setLoadingCerts] = React.useState(false);

    React.useEffect(() => {
        setLoadingCerts(true);
        api.get('/certificates/mine')
            .then(res => setCertificates(res.data))
            .catch(console.error)
            .finally(() => setLoadingCerts(false));
    }, []);

    const downloadCertificate = (id: string, title: string) => {
        window.open(`${api.defaults.baseURL}/events/${id}/certificate/download`, '_blank');
        // Note: The download endpoint might differ for non-event certificates. 
        // Current implementation in backend `src/routes/events` supports download for events.
        // But `src/routes/certificates.ts` supports generic download via `GET /:id/pdf`.
        // I should use the generic one created in `certificates.ts`: `/certificates/:id/pdf`.
    };

    return (
        <div className="fade-in">
            <h1 className="page-title" style={{ marginTop: "1rem" }}>{t("visitor.sidebar.profile")}</h1>
            <p className="page-subtitle">Gerencie suas informações</p>

            <div className="card" style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: "50%", backgroundColor: "var(--primary-color)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: "bold"
                    }}>
                        {name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 style={{ margin: 0 }}>{name}</h2>
                        <p style={{ margin: 0, opacity: 0.8 }}>{email}</p>
                    </div>
                </div>

                <hr style={{ borderColor: "var(--border-color)", margin: "1rem 0" }} />

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <button className="btn btn-secondary" onClick={() => navigate("/conquistas")}>
                        🏆 {t("visitor.achievements.title", "Conquistas")}
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate("/passaporte")}>
                        🛂 {t("visitor.passport.title", "Passaporte")}
                    </button>
                </div>

                <hr style={{ borderColor: "var(--border-color)", margin: "1rem 0" }} />

                <h3 style={{ margin: "0 0 1rem 0" }}>🎓 Meus Certificados</h3>
                {loadingCerts ? (
                    <p>Carregando...</p>
                ) : certificates.length === 0 ? (
                    <p className="text-muted">Você ainda não possui certificados.</p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {certificates.map(cert => (
                            <div key={cert.id} style={{
                                border: "1px solid var(--border-color)",
                                borderRadius: "8px",
                                padding: "1rem",
                                background: "rgba(255,255,255,0.05)"
                            }}>
                                <div style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>
                                    {cert.type === 'EVENT' ? 'Evento' : cert.type}
                                    {cert.metadata?.title && ` - ${cert.metadata.title}`}
                                </div>
                                <div style={{ fontSize: "0.9rem", opacity: 0.8, marginBottom: "0.5rem" }}>
                                    Emissor: {cert.tenant.name} | {new Date(cert.generatedAt).toLocaleDateString()}
                                </div>
                                <button
                                    className="btn btn-sm btn-outline"
                                    onClick={() => window.open(`${api.defaults.baseURL?.replace('/api', '') || ''}/certificates/${cert.id}/pdf`, '_blank')}
                                >
                                    📄 Baixar PDF
                                </button>
                                <button
                                    className="btn btn-sm btn-ghost"
                                    style={{ marginLeft: "0.5rem" }}
                                    onClick={() => navigate(`/verify/${cert.code}`)}
                                >
                                    🔍 Validar
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <hr style={{ borderColor: "var(--border-color)", margin: "1rem 0" }} />

                <button className="btn btn-logout" onClick={logout}>
                    {t("visitor.sidebar.logout")}
                </button>
            </div>
        </div>
    );
};
