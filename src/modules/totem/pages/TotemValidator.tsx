import React, { useState, useCallback, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { UserCheck, AlertTriangle, ArrowLeft, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../../api/client';
import { AxiosError } from 'axios';
import { useToast } from '../../../contexts/ToastContext';

type ScanResult = {
    guestName?: string;
    code: string;
    eventTitle?: string;
    ticketType?: string;
    checkedInAt?: string;
};

export const TotemValidator: React.FC = () => {
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const { addToast } = useToast();

    // Sound effects (optional implementation placeholder)
    const playSound = (type: 'success' | 'error') => {
        // Implementation for audio feedback would go here
    };

    const handleCheckIn = useCallback(async (code: string) => {
        if (!code || processing) return;

        setProcessing(true);
        setError(null);
        setScanResult(null);

        try {
            const res = await api.post('/registrations/checkin', { code: code.trim() });
            setScanResult({
                ...res.data.registration,
                eventTitle: res.data.event?.title
            });
            playSound('success');
            addToast("Acesso Liberado!", "success");
        } catch (err) {
            const axiosErr = err as AxiosError<{ error?: string }>;
            const errorMessage = axiosErr.response?.data?.error || "Ingresso inválido ou não encontrado";
            setError(errorMessage);
            playSound('error');
            addToast(errorMessage, "error");
        } finally {
            setProcessing(false);
        }
    }, [processing, addToast]);

    useEffect(() => {
        // Scanner with larger box for kiosk mode
        const scanner = new Html5QrcodeScanner(
            "kiosk-scanner",
            {
                fps: 10,
                qrbox: { width: 350, height: 350 }, // Larger scan area
                aspectRatio: 1,
                videoConstraints: {
                    facingMode: "environment"
                }
            },
            false
        );

        scanner.render(
            (decodedText) => {
                // Pause scanning while processing result
                scanner.pause();
                handleCheckIn(decodedText).finally(() => {
                    // Wait a bit before scanning again
                    setTimeout(() => {
                        scanner.resume();
                    }, 3000);
                });
            },
            (errorMessage) => {
                // Ignore scan errors primarily
            }
        );

        return () => {
            scanner.clear().catch(e => console.error("Scanner clear error", e));
        };
    }, []); // Only init once, handleCheckIn uses ref if needed or simplified logic

    const handleReset = () => {
        setScanResult(null);
        setError(null);
    };

    return (
        <div style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "1rem"
        }}>
            {/* Header / Back */}
            <div style={{ width: "100%", maxWidth: "600px", marginBottom: "1rem", display: "flex", justifyContent: "flex-start" }}>
                <Link to="/totem" className="btn-secondary" style={{ display: "flex", gap: "0.5rem", alignItems: "center", color: "#fff", textDecoration: "none", padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)" }}>
                    <ArrowLeft size={20} /> Voltar
                </Link>
            </div>

            <div style={{
                flex: 1,
                width: "100%",
                maxWidth: "600px",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem"
            }}>
                {/* Scanner Container */}
                <div style={{
                    background: "#000",
                    borderRadius: "20px",
                    overflow: "hidden",
                    position: "relative",
                    border: "2px solid rgba(255,255,255,0.1)",
                    minHeight: "400px" // Ensure space for scanner
                }}>
                    {!scanResult && !error && (
                        <div id="kiosk-scanner" style={{ width: "100%", height: "100%" }}></div>
                    )}

                    {/* Overlay Result States to hide scanner visually but keep it mounted or handle logic */}
                    {/* Ideally we hide the scanner DOM or just overlay */}

                    {scanResult && (
                        <div className="animate-popIn" style={{
                            position: "absolute",
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: "rgba(16, 185, 129, 0.95)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "2rem",
                            color: "#fff",
                            textAlign: "center",
                            zIndex: 10
                        }}>
                            <div style={{ background: "#fff", borderRadius: "50%", padding: "1.5rem", marginBottom: "1rem" }}>
                                <UserCheck size={64} color="#10b981" />
                            </div>
                            <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>ACESSO LIBERADO</h2>
                            <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>{scanResult.guestName || "Visitante"}</h3>
                            <div style={{ background: "rgba(0,0,0,0.1)", padding: "1rem", borderRadius: "10px", width: "100%" }}>
                                <p style={{ fontSize: "1.1rem" }}><strong>Evento:</strong> {scanResult.eventTitle}</p>
                                <p style={{ fontSize: "1.1rem" }}><strong>Tipo:</strong> {scanResult.ticketType}</p>
                            </div>
                            <button onClick={handleReset} style={{
                                marginTop: "2rem",
                                background: "#fff",
                                color: "#10b981",
                                border: "none",
                                padding: "1rem 2rem",
                                borderRadius: "10px",
                                fontSize: "1.2rem",
                                fontWeight: "bold",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem"
                            }}>
                                <RotateCcw size={24} /> Próximo (3s)
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="animate-shake" style={{
                            position: "absolute",
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: "rgba(239, 68, 68, 0.95)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "2rem",
                            color: "#fff",
                            textAlign: "center",
                            zIndex: 10
                        }}>
                            <div style={{ background: "#fff", borderRadius: "50%", padding: "1.5rem", marginBottom: "1rem" }}>
                                <AlertTriangle size={64} color="#ef4444" />
                            </div>
                            <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>ACESSO NEGADO</h2>
                            <p style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>{error}</p>

                            <button onClick={handleReset} style={{
                                background: "#fff",
                                color: "#ef4444",
                                border: "none",
                                padding: "1rem 2rem",
                                borderRadius: "10px",
                                fontSize: "1.2rem",
                                fontWeight: "bold",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem"
                            }}>
                                <RotateCcw size={24} /> Tentar Novamente
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ textAlign: "center", color: "rgba(255,255,255,0.5)" }}>
                    <p>Aponte o código QR para a câmera</p>
                    <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>Não precisa tocar em nada, leitura automática</p>
                </div>
            </div>
        </div>
    );
};
