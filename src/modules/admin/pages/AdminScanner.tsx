import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { api } from '../../../api/client';
import { ShieldCheck, XCircle, AlertTriangle, QrCode, Ticket, User, RefreshCw, Smartphone } from 'lucide-react';
import { Button } from '../../../components/ui';

type ScanResult = {
    valid: boolean;
    message: string;
    details?: {
        guestName: string;
        eventName: string;
        ticketType: string;
    };
};

export const AdminScanner: React.FC = () => {
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [isScanning, setIsScanning] = useState(true);
    const [loading, setLoading] = useState(false);
    const [manualCode, setManualCode] = useState("");
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        // Initialize Scanner only once when component mounts and scanning is active
        if (isScanning && !scannerRef.current) {
            scannerRef.current = new Html5QrcodeScanner(
                "reader",
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
                    rememberLastUsedCamera: true
                },
                false
            );

            scannerRef.current.render(
                (decodedText) => {
                    // Success Callback
                    handleValidation(decodedText);
                },
                (error) => {
                    // Failure callback is noisy, ignore.
                }
            );
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(e => console.error("Failed to clear scanner", e));
                scannerRef.current = null;
            }
        };
    }, [isScanning]);

    const handleValidation = async (code: string) => {
        if (loading) return;

        // Stop scanning visually
        setIsScanning(false);
        setLoading(true);

        try {
            const res = await api.post(`/registrations/${code}/check-in`);
            setScanResult(res.data);
            // We play a success sound (optional enhancement)
        } catch (error: any) {
            setScanResult({
                valid: false,
                message: error.response?.data?.message || "Erro de conexão ao validar ingresso."
            });
            // Play error sound
        } finally {
            setLoading(false);
        }
    };

    const resetScanner = () => {
        setScanResult(null);
        setManualCode("");
        setIsScanning(true);
    };

    return (
        <div className="admin-scanner-container max-w-3xl mx-auto p-4 md:p-8 min-h-[80vh] flex flex-col items-center justify-center">

            <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-slate-800 flex items-center justify-center gap-3 mb-2">
                    <Smartphone className="text-indigo-600" size={32} />
                    Validador de Ingressos
                </h1>
                <p className="text-slate-500">Aponte a câmera para o QR Code do visitante ou digite o código manualmente.</p>
            </div>

            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

                {/* Scanner View */}
                {isScanning ? (
                    <div className="p-6">
                        <div id="reader" className="rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 w-full bg-slate-50 min-h-[300px] flex items-center justify-center">
                            {/* HTML5 QR Code injects here */}
                        </div>

                        <div className="mt-6 space-y-4">
                            <div className="relative flex items-center">
                                <div className="flex-grow border-t border-slate-200"></div>
                                <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">OU DIGITE O CÓDIGO</span>
                                <div className="flex-grow border-t border-slate-200"></div>
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={manualCode}
                                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                                    placeholder="Ex: TKT-123XYZ"
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-mono text-center uppercase"
                                />
                                <Button
                                    disabled={!manualCode || loading}
                                    onClick={() => handleValidation(manualCode)}
                                    className="px-6 rounded-xl"
                                >
                                    Validar
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Result View */
                    <div className="p-8 text-center animate-zoomIn flex flex-col items-center">
                        {loading ? (
                            <div className="py-12 flex flex-col items-center gap-4">
                                <RefreshCw className="animate-spin text-indigo-500" size={48} />
                                <p className="text-slate-500 font-medium">Validando ingresso...</p>
                            </div>
                        ) : scanResult ? (
                            <div className={`w-full rounded-2xl p-8 border-2 shadow-sm ${scanResult.valid ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
                                }`}>

                                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-lg ${scanResult.valid ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                                    }`}>
                                    {scanResult.valid ? <ShieldCheck size={40} /> : (
                                        scanResult.message.includes('utilizado') ? <AlertTriangle size={40} /> : <XCircle size={40} />
                                    )}
                                </div>

                                <h2 className={`text-2xl font-black mb-2 ${scanResult.valid ? 'text-emerald-700' : 'text-red-700'}`}>
                                    {scanResult.message}
                                </h2>

                                {scanResult.details && (
                                    <div className="mt-6 bg-white rounded-xl p-6 text-left shadow-sm border border-slate-100 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <User className="text-slate-400" size={20} />
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Visitante</p>
                                                <p className="font-bold text-slate-800 text-lg">{scanResult.details.guestName}</p>
                                            </div>
                                        </div>
                                        <div className="h-px bg-slate-100"></div>
                                        <div className="flex items-center gap-3">
                                            <Ticket className="text-slate-400" size={20} />
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evento</p>
                                                <p className="font-bold text-slate-700">{scanResult.details.eventName}</p>
                                                <p className="text-sm text-slate-500">{scanResult.details.ticketType}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    onClick={resetScanner}
                                    className={`mt-8 w-full py-4 text-lg rounded-xl shadow-lg ${scanResult.valid ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-slate-800 hover:bg-slate-900 shadow-slate-800/20'
                                        }`}
                                    leftIcon={<QrCode size={20} />}
                                >
                                    Escanear Próximo
                                </Button>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>

            <div className="mt-8 text-center text-slate-400 text-sm max-w-sm">
                <p>Aponte a câmera em um ambiente iluminado para uma leitura mais rápida.</p>
            </div>
        </div>
    );
};
