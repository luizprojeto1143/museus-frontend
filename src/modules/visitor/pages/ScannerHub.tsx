import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { QrCode, Eye, ChevronRight } from "lucide-react";
import "./ScannerHub.css";

export const ScannerHub: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="scanner-hub-container">
            <header className="scanner-hub-header">
                <h1 className="scanner-hub-title">{t("visitor.scanner.hubTitle", "Central de Scanner")}</h1>
                <p className="scanner-hub-subtitle">Escolha como deseja identificar a obra</p>
            </header>

            <div className="scanner-hub-grid">
                {/* QR Code Option */}
                <button onClick={() => navigate("/scanner/qr")} className="scanner-hub-option">
                    <div className="scanner-hub-icon-wrapper qr">
                        <QrCode />
                    </div>
                    <div className="scanner-hub-option-info">
                        <h2>QR Code</h2>
                        <p>Escaneie o código quadrado ao lado da obra.</p>
                    </div>
                    <div className="scanner-hub-cta qr">
                        Iniciar Câmera <ChevronRight size={16} />
                    </div>
                </button>

                {/* AI Visual Option */}
                <button onClick={() => navigate("/scanner/ai")} className="scanner-hub-option">
                    <div className="scanner-hub-icon-wrapper ai">
                        <Eye />
                    </div>
                    <div className="scanner-hub-option-info">
                        <h2>IA Visual</h2>
                        <p>Aponte a câmera para a obra e deixe a IA identificar.</p>
                    </div>
                    <div className="scanner-hub-cta ai">
                        Iniciar IA <ChevronRight size={16} />
                    </div>
                </button>
            </div>
        </div>
    );
};
