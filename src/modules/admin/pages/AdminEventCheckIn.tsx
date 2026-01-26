import React, { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ArrowLeft, UserCheck, AlertTriangle } from 'lucide-react';
import { api } from '../../../api/client';
import { AxiosError } from 'axios';

type ScanResult = {
    guestName?: string;
    code: string;
};

export const AdminEventCheckIn: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCheckIn = useCallback(async (code: string) => {
        setError(null);
        setScanResult(null);
        try {
            const res = await api.post('/registrations/checkin', { code });
            setScanResult(res.data.registration);
        } catch (err) {
            const axiosErr = err as AxiosError<{ error?: string }>;
            setError(axiosErr.response?.data?.error || "Erro ao fazer check-in");
        }
    }, []);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );

        scanner.render((decodedText) => {
            // Handle scan
            handleCheckIn(decodedText);
            scanner.clear();
        }, () => {
            // Scan error - silently ignore
        });

        return () => {
            scanner.clear().catch(e => console.error("Scanner clear error", e));
        };
    }, [handleCheckIn]);

    return (
        <div className="max-w-md mx-auto p-6">
            <div className="flex items-center gap-2 mb-6">
                <Link to={`/admin/eventos/${id}/dashboard`} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Check-in
                </h1>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div id="reader" className="w-full h-80 bg-black"></div>

                <div className="p-6">
                    <p className="text-center text-gray-500 text-sm mb-4">
                        Aponte a câmera para o QR Code do ingresso
                    </p>

                    {scanResult && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-fadeIn">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-green-100 p-2 rounded-full">
                                    <UserCheck className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-green-800">Check-in Confirmado!</h3>
                                    <p className="text-green-600 text-sm">{new Date().toLocaleTimeString()}</p>
                                </div>
                            </div>
                            <div className="text-sm text-gray-700 ml-12">
                                <p><strong>Participante:</strong> {scanResult.guestName || "Visitante"}</p>
                                <p><strong>Ingresso:</strong> {scanResult.code}</p>
                            </div>
                            <button onClick={() => setScanResult(null)} className="btn btn-primary w-full mt-4">
                                Ler Próximo
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fadeIn">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                                <div>
                                    <h3 className="font-bold text-red-800">Erro no Check-in</h3>
                                    <p className="text-red-600 text-sm">{error}</p>
                                </div>
                            </div>
                            <button onClick={() => setError(null)} className="btn btn-secondary w-full mt-4">
                                Tentar Novamente
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8">
                <h3 className="font-semibold mb-2">Entrada Manual</h3>
                <div className="flex gap-2">
                    <input
                        className="input flex-1"
                        placeholder="Código do ingresso"
                        onKeyDown={e => {
                            if (e.key === 'Enter') handleCheckIn((e.target as HTMLInputElement).value);
                        }}
                    />
                    <button className="btn btn-secondary">Buscar</button>
                </div>
            </div>
        </div>
    );
};
