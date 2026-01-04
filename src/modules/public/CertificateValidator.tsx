import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../api/client';
import { CheckCircle, XCircle, AlertTriangle, Download, Calendar, User, MapPin } from 'lucide-react';

interface CertificateData {
    id: string;
    code: string;
    visitorName: string;
    issuerName: string;
    issuerLogo?: string;
    title: string;
    type: string;
    issuedAt: string;
    description: string;
}

export const CertificateValidator: React.FC = () => {
    const { code } = useParams();
    const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'error'>('loading');
    const [data, setData] = useState<CertificateData | null>(null);

    useEffect(() => {
        if (code) validateCertificate();
    }, [code]);

    const validateCertificate = async () => {
        try {
            // Note: Use baseURL-less request or ensure API client handles relative paths correctly 
            // if this page is rendered outside the main app context. 
            // Assuming standard api client works for now.
            const res = await api.get(`/public/certificates/${code}`);
            if (res.data.valid) {
                setData(res.data.data);
                setStatus('valid');
            } else {
                setStatus('invalid');
            }
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 404) {
                setStatus('invalid');
            } else {
                setStatus('error');
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#1a1108] text-[#f5e6d3] font-serif flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />

            <div className="relative z-10 w-full max-w-lg">

                {/* Header Logo or Brand */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-[#d4af37] tracking-widest uppercase">Cultura Viva</h1>
                    <p className="text-[#8b7355] text-xs uppercase tracking-widest mt-1">Sistema de Validação Digital</p>
                </div>

                <div className="bg-[#2a1810] border border-[rgba(212,175,55,0.3)] rounded-lg shadow-2xl overflow-hidden backdrop-blur-sm">

                    {/* Status Header */}
                    <div className={`p-6 text-center border-b ${status === 'valid' ? 'bg-green-900/20 border-green-800' :
                            status === 'invalid' ? 'bg-red-900/20 border-red-800' :
                                'bg-gray-900/20 border-gray-800'
                        }`}>
                        {status === 'loading' && <div className="text-[#d4af37]">Verificando autenticidade...</div>}

                        {status === 'valid' && (
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center border-2 border-green-500 text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                                    <CheckCircle size={32} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-green-400">Certificado Válido</h2>
                                    <p className="text-green-300/60 text-sm">A autenticidade deste documento foi confirmada.</p>
                                </div>
                            </div>
                        )}

                        {status === 'invalid' && (
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border-2 border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                                    <XCircle size={32} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-red-400">Certificado Inválido</h2>
                                    <p className="text-red-300/60 text-sm">O código fornecido não foi encontrado ou foi revogado.</p>
                                </div>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center border-2 border-yellow-500 text-yellow-500">
                                    <AlertTriangle size={32} />
                                </div>
                                <h2 className="text-xl font-bold text-yellow-400">Erro na Verificação</h2>
                            </div>
                        )}
                    </div>

                    {/* Certificate Details */}
                    {status === 'valid' && data && (
                        <div className="p-8 space-y-6">
                            {/* Visitor Info */}
                            <div className="text-center space-y-2 pb-6 border-b border-[rgba(212,175,55,0.1)]">
                                <div className="text-[#8b7355] text-xs uppercase tracking-wider">Certificado emitido para</div>
                                <h3 className="text-2xl font-bold text-[#f5e6d3]">{data.visitorName}</h3>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-start gap-3 p-3 rounded bg-[#3a2818]/30">
                                    <User className="text-[#d4af37] shrink-0 mt-0.5" size={18} />
                                    <div>
                                        <div className="text-[10px] text-[#8b7355] uppercase font-bold">Atividade</div>
                                        <div className="text-[#f5e6d3] font-medium">{data.title}</div>
                                        <div className="text-[#c9b58c] text-xs mt-0.5 leading-relaxed">{data.description}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 rounded bg-[#3a2818]/30">
                                    <MapPin className="text-[#d4af37] shrink-0 mt-0.5" size={18} />
                                    <div>
                                        <div className="text-[10px] text-[#8b7355] uppercase font-bold">Emissor</div>
                                        <div className="text-[#f5e6d3] font-medium">{data.issuerName}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 rounded bg-[#3a2818]/30">
                                    <Calendar className="text-[#d4af37] shrink-0 mt-0.5" size={18} />
                                    <div>
                                        <div className="text-[10px] text-[#8b7355] uppercase font-bold">Data de Emissão</div>
                                        <div className="text-[#f5e6d3] font-medium">{new Date(data.issuedAt).toLocaleDateString('pt-BR')}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-4">
                                <button
                                    onClick={() => window.print()}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#1a1108] font-bold rounded shadow-lg hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all"
                                >
                                    <Download size={18} />
                                    Imprimir Comprovante
                                </button>
                            </div>

                            {/* Footer Hash */}
                            <div className="text-center mt-4">
                                <div className="text-[10px] text-[#8b7355]">Código de Autenticidade</div>
                                <div className="font-mono text-xs text-[#d4af37]/80 tracking-widest mt-0.5">{data.code}</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="text-center mt-8 text-[#8b7355] text-xs">
                    &copy; {new Date().getFullYear()} Cultura Viva. Plataforma de Gestão Museológica.
                </div>
            </div>
        </div>
    );
};
