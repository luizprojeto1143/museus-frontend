import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { QrCode, Eye, ChevronRight } from "lucide-react";

export const ScannerHub: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
            <h1 className="section-title text-center mb-2">{t("visitor.scanner.hubTitle", "Central de Scanner")}</h1>
            <p className="page-subtitle text-center mb-8">Escolha como deseja identificar a obra</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 max-w-4xl mx-auto w-full">
                {/* QR Code Option */}
                <button
                    onClick={() => navigate("/scanner/qr")}
                    className="card group hover:border-yellow-500 transition-all duration-300 flex flex-col items-center justify-center p-8 gap-4 text-center cursor-pointer border-2 border-transparent bg-white/5"
                >
                    <div className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <QrCode className="w-12 h-12 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-2">QR Code</h2>
                        <p className="text-gray-400">Escaneie o código quadrado ao lado da obra.</p>
                    </div>
                    <div className="mt-4 px-6 py-2 rounded-full border border-blue-500/30 text-blue-300 text-sm font-bold flex items-center gap-2">
                        Iniciar Câmera <ChevronRight size={16} />
                    </div>
                </button>

                {/* AI Visual Option */}
                <button
                    onClick={() => navigate("/scanner/ai")}
                    className="card group hover:border-yellow-500 transition-all duration-300 flex flex-col items-center justify-center p-8 gap-4 text-center cursor-pointer border-2 border-transparent bg-white/5"
                >
                    <div className="w-24 h-24 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Eye className="w-12 h-12 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-2">IA Visual</h2>
                        <p className="text-gray-400">Aponte a câmera para a obra e deixe a IA identificar.</p>
                    </div>
                    <div className="mt-4 px-6 py-2 rounded-full border border-purple-500/30 text-purple-300 text-sm font-bold flex items-center gap-2">
                        Iniciar IA <ChevronRight size={16} />
                    </div>
                </button>
            </div>

            <div className="text-center mt-8 text-gray-500 text-sm">
                <p>💡 Dica: O reconhecimento visual requer que a obra tenha sido treinada previamente.</p>
            </div>
        </div>
    );
};
