import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Camera, Keyboard, ArrowLeft } from "lucide-react";
import "./Scanner.css";

export const ScannerPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [manualCode, setManualCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);

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
                () => {
                    // ignore errors during scanning
                }
            );
            setIsScanning(true);
        } catch (err) {
            console.error("Error starting scanner", err);
            setError("Não foi possível acessar a câmera. Verifique se você permitiu o acesso.");
            setIsScanning(false);
        }
    };

    const handleScanSuccess = (decodedText: string) => {
        stopScanner();

        let workId = decodedText;

        try {
            const data = JSON.parse(decodedText);
            if (data.id) workId = data.id;
        } catch {
            // Not JSON, assume string ID
        }

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
        <div className="scanner-container">
            <header className="scanner-header">
                <h1 className="scanner-title">
                    <Camera size={28} />
                    {t("visitor.scanner.title", "Scanner de Obras")}
                </h1>
                <p className="scanner-instruction">
                    {t("visitor.scanner.instruction", "Aponte a câmera para o código QRCode ao lado da obra para ver detalhes.")}
                </p>
            </header>

            {/* Scanner Area */}
            <div className="scanner-area">
                <div id="reader" className="scanner-reader"></div>

                {!isScanning && !error && (
                    <div className="scanner-start-overlay">
                        <button onClick={startScanner} className="scanner-start-btn">
                            <Camera size={24} />
                            {t("visitor.scanner.startCamera", "Iniciar Câmera")}
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="scanner-error">
                    {error}
                </div>
            )}

            {/* Manual Input Fallback */}
            <div className="scanner-manual-section">
                <h3 className="scanner-manual-title">
                    <Keyboard size={18} />
                    {t("visitor.dialer.title", "Digitar Código")}
                </h3>
                <form onSubmit={handleManualSubmit} className="scanner-manual-form">
                    <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder={t("visitor.dialer.placeholder", "Ex: 1234")}
                        className="scanner-manual-input"
                    />
                    <button type="submit" className="scanner-manual-submit">
                        {t("common.view", "Ver")}
                    </button>
                </form>
            </div>

            <button onClick={() => navigate(-1)} className="scanner-back-btn">
                <ArrowLeft size={16} /> {t("common.back", "Voltar")}
            </button>
        </div>
    );
};
