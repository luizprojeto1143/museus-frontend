import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../api/client';
import { useTranslation } from 'react-i18next';

type VerificationResult = {
    valid: boolean;
    visitorName: string;
    tenantName: string;
    type: string;
    metadata: any;
    generatedAt: string;
    revoked: boolean;
};

export const CertificateVerification: React.FC = () => {
    const { code } = useParams();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!code) return;

        api.get(`/certificates/verify/${code}`)
            .then(res => {
                setResult(res.data);
                setLoading(false);
            })
            .catch(() => {
                setError(true);
                setLoading(false);
            });
    }, [code]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8f9fa' }}>
                <div className="spinner"></div>
                <p style={{ marginLeft: '1rem' }}>Verificando autenticidade...</p>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#fee2e2', color: '#b91c1c' }}>
                <h1>❌ Certificado Não Encontrado</h1>
                <p>O código informado ({code}) não corresponde a um certificado válido.</p>
            </div>
        );
    }

    if (result.revoked) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#fee2e2', color: '#b91c1c' }}>
                <h1>⚠️ Certificado Revogado</h1>
                <p>Este certificado foi emitido para {result.visitorName} mas foi revogado pela instituição.</p>
            </div>
        );
    }

    // Valid Certificate
    return (
        <div style={{ minHeight: '100vh', background: '#f0fdf4', display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <div style={{
                background: 'white',
                maxWidth: '600px',
                width: '100%',
                padding: '2rem',
                borderRadius: '1rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                borderTop: '5px solid #22c55e'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ background: '#dcfce7', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                        <span style={{ fontSize: '2rem' }}>✔</span>
                    </div>
                    <h1 style={{ color: '#166534', margin: 0 }}>Certificado Válido</h1>
                    <p style={{ color: '#64748b' }}>Verificação Oficial de Autenticidade</p>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '1.5rem 0' }}>
                    <p><strong>Titular:</strong> <span style={{ fontSize: '1.2rem', display: 'block' }}>{result.visitorName}</span></p>

                    <p style={{ marginTop: '1rem' }}><strong>Emissor:</strong> <span style={{ display: 'block' }}>{result.tenantName}</span></p>

                    <p style={{ marginTop: '1rem' }}><strong>Atividade:</strong> <span style={{ display: 'block' }}>
                        {result.type === 'EVENT' ? 'Participação em Evento' : result.type === 'TRAIL' ? 'Conclusão de Trilha' : result.type}
                        {result.metadata?.title && ` - ${result.metadata.title}`}
                    </span></p>

                    <p style={{ marginTop: '1rem' }}><strong>Data de Emissão:</strong> <span style={{ display: 'block' }}>
                        {new Date(result.generatedAt).toLocaleDateString('pt-BR')}
                    </span></p>
                </div>

                <div style={{ textAlign: 'center', marginTop: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                    <p>ID do Certificado: {code}</p>
                    <p>© Cultura Viva - Plataforma de Gestão Cultural</p>
                </div>
            </div>
        </div>
    );
};
