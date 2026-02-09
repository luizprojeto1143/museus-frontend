import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Camera, Keyboard, ArrowLeft, ArrowRight, ScanLine } from "lucide-react";
import { Input, Button } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import "./Scanner.css";

export const ScannerPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { addToast } = useToast();
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
            addToast("Erro ao acessar câmera", "error");
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

        // Limpar URL completa se houver
        if (workId.startsWith("http")) {
            const parts = workId.split("/");
            workId = parts[parts.length - 1];
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
        <div className="max-w-md mx-auto p-4 min-h-screen flex flex-col">
            <header className="text-center mb-8 pt-4">
                <h1 className="text-2xl font-bold text-gold flex items-center justify-center gap-2 mb-2">
                    <ScanLine size={28} />
                    {t("visitor.scanner.title", "Scanner de Obras")}
                </h1>
                <p className="text-gray-400 text-sm">
                    {t("visitor.scanner.instruction", "Aponte a câmera para o QRCode da obra ou digite o código abaixo.")}
                </p>
            </header>

            {/* Scanner Area */}
            <div className="relative bg-black rounded-3xl overflow-hidden aspect-square mb-8 ring-2 ring-gray-800 shadow-2xl">
                <div id="reader" className="w-full h-full object-cover"></div>

                {!isScanning && !error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm z-10">
                        <Button
                            onClick={startScanner}
                            leftIcon={<Camera size={24} />}
                            className="bg-gold hover:bg-gold/90 text-black font-bold py-3 px-6 rounded-full transform transition hover:scale-105"
                        >
                            {t("visitor.scanner.startCamera", "Iniciar Câmera")}
                        </Button>
                    </div>
                )}

                {isScanning && (
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-gold/50 rounded-lg">
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-gold -mt-1 -ml-1"></div>
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-gold -mt-1 -mr-1"></div>
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-gold -mb-1 -ml-1"></div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-gold -mb-1 -mr-1"></div>
                        </div>
                        <div className="absolute bottom-4 left-0 right-0 text-center text-white/70 text-sm animate-pulse">
                            Procurando código...
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-lg mb-6 text-center text-sm">
                    {error}
                </div>
            )}

            {/* Manual Input Fallback */}
            <div className="card bg-gray-900/50 border-gray-800">
                <h3 className="text-gray-300 font-medium flex items-center gap-2 mb-4">
                    <Keyboard size={18} className="text-gold" />
                    {t("visitor.dialer.title", "Digitar Código")}
                </h3>
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                    <Input
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="Ex: OBRA-001"
                        containerClassName="flex-1 mb-0"
                        className="h-full"
                    />
                    <Button type="submit" leftIcon={<ArrowRight size={18} />}>
                        {t("common.view", "Ver")}
                    </Button>
                </form>
            </div>

            <div className="mt-auto pt-8 pb-4">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    leftIcon={<ArrowLeft size={16} />}
                    className="w-full text-gray-500 hover:text-white"
                >
                    {t("common.back", "Voltar")}
                </Button>
            </div>
        </div>
    );
};
