import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const ScannerPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [manualCode, setManualCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);

    // Cleanup function
    const stopScanner = async () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch (err) {
                console.error("Error stopping scanner", err);
            }
        }
        setIsScanning(false);
    };

    const startScanner = async () => {
        setError(null);
        try {
            const scanner = new Html5Qrcode("reader", {
                formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
                verbose: false
            });
            scannerRef.current = scanner;

            await scanner.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                },
                (decodedText) => {
                    handleScanSuccess(decodedText);
                },
                (errorMessage) => {
                    // ignore errors during scanning
                }
            );
            setIsScanning(true);
        } catch (err) {
            console.error("Error starting scanner", err);
            setError("Não foi possível acessar a câmera. Verifique se você permitiu o acesso e se está usando HTTPS (se estiver no celular).");
            setIsScanning(false);
        }
    };

    const handleScanSuccess = (decodedText: string) => {
        stopScanner();

        let workId = decodedText;

        // Try to parse if it's JSON
        try {
            const data = JSON.parse(decodedText);
            if (data.id) workId = data.id;
        } catch (e) {
            // Not JSON, assume string ID
        }

        // If it's a full URL, extract ID
        if (workId.includes("/works/")) {
            workId = workId.split("/works/")[1];
        } else if (workId.includes("/qr/")) {
            workId = workId.split("/qr/")[1];
        }

        if (decodedText.includes("/qr/")) {
            navigate(`/qr/${workId}`);
        } else {
            navigate(`/obras/${workId}`);
        }
    };

    useEffect(() => {
        return () => {
            stopScanner();
        };
    }, []);

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualCode.trim()) {
            handleScanSuccess(manualCode.trim());
        }
    };

    return (
        <div style={{ padding: "1rem", paddingBottom: "3rem", display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "600px", margin: "0 auto" }}>
            <h1 className="section-title">{t("visitor.scanner.title", "Scanner de QR Code")}</h1>
            <p style={{ marginBottom: "1.5rem", color: "#9ca3af", textAlign: "center" }}>
                {t("visitor.scanner.instruction", "Aponte a câmera para o QR Code da obra ou digite o código abaixo.")}
            </p>

            {/* Scanner Area */}
            <div style={{ width: "100%", marginBottom: "2rem", position: "relative", minHeight: "300px", background: "rgba(0,0,0,0.2)", borderRadius: "1rem", overflow: "hidden" }}>
                <div id="reader" style={{ width: "100%" }}></div>

                {!isScanning && !error && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <button onClick={startScanner} className="btn btn-primary">
                            📷 {t("visitor.scanner.startCamera", "Iniciar Câmera")}
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div style={{ padding: "1rem", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444", borderRadius: "0.5rem", marginBottom: "1rem", textAlign: "center" }}>
                    {error}
                </div>
            )}

            {/* Manual Input Fallback */}
            <div style={{ width: "100%", padding: "1.5rem", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "1rem" }}>
                <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "var(--accent-gold)" }}>
                    {t("visitor.dialer.title", "Digitar Código")}
                </h3>
                <form onSubmit={handleManualSubmit} style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder={t("visitor.dialer.placeholder", "Ex: 1234")}
                        className="input"
                        style={{ flex: 1 }}
                    />
                    <button type="submit" className="btn btn-primary">
                        {t("common.view", "Ver")}
                    </button>
                </form>
            </div>

            <button
                onClick={() => navigate(-1)}
                className="btn btn-secondary"
                style={{ marginTop: "2rem", width: "100%" }}
            >
                {t("common.back", "Voltar")}
            </button>
        </div>
    );
};
