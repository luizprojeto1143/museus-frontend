import React, { useEffect, useState } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, Award, Download, ExternalLink, Calendar, Search } from "lucide-react";
import "./CertificateList.css";

export const CertificateList: React.FC = () => {
    const { tenantId } = useAuth();
    const [certificates, setCertificates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCerts = async () => {
            try {
                const res = await api.get(`/certificates/mine?tenantId=${tenantId}`);
                setCertificates(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (tenantId) fetchCerts();
    }, [tenantId]);

    const handleDownload = (id: string, code: string) => {
        const url = `${api.defaults.baseURL}/certificates/${id}/pdf`;
        window.open(url, "_blank");
    };

    const handleVerify = (code: string) => {
        window.open(`/verify/${code}`, "_blank");
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[var(--accent-primary)]" /></div>;

    return (
        <div className="certificate-page visitor-page-container">
            <header className="page-header">
                <h1 className="text-3xl font-black flex items-center gap-3">
                    <Award className="text-[var(--accent-primary)]" size={32} />
                    Meus Certificados
                </h1>
                <p className="opacity-60">Sua jornada cultural documentada e oficializada</p>
            </header>

            {certificates.length === 0 ? (
                <div className="empty-state-certs">
                    <div className="empty-icon-box">
                        <Award size={64} className="opacity-10" />
                    </div>
                    <h3>Nenhum certificado ainda</h3>
                    <p>Complete trilhas ou participe de eventos para conquistar seus certificados oficiais.</p>
                </div>
            ) : (
                <div className="certs-grid">
                    {certificates.map((cert) => (
                        <div key={cert.id} className="cert-card glass">
                            <div className="cert-card-header">
                                <div className="cert-type-badge">{cert.type === 'TRAIL' ? 'Trilha' : 'Evento'}</div>
                                <div className="cert-date">
                                    <Calendar size={14} />
                                    {new Date(cert.generatedAt).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="cert-card-body">
                                <h2 className="cert-title">{cert.metadata?.title || "Conclusão de Atividade"}</h2>
                                <p className="cert-institution">{cert.tenant?.name}</p>
                                <div className="cert-code">Cód: {cert.code}</div>
                            </div>

                            <div className="cert-card-actions">
                                <button
                                    onClick={() => handleDownload(cert.id, cert.code)}
                                    className="btn-cert download"
                                >
                                    <Download size={18} />
                                    Download PDF
                                </button>
                                <button
                                    onClick={() => handleVerify(cert.code)}
                                    className="btn-cert verify"
                                >
                                    <ExternalLink size={18} />
                                    Verificar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <footer className="page-footer-info">
                <p>Todos os certificados são verificáveis via QR Code ou código único.</p>
            </footer>
        </div>
    );
};
