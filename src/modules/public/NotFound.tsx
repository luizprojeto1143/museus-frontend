import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const NotFound: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#1a1108] text-[#EAE0D5] relative overflow-hidden font-serif">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#d4af37] rounded-full blur-[150px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#8b7355] rounded-full blur-[150px]"></div>
            </div>

            <div className="relative z-10 text-center p-8 max-w-md">
                <div className="text-[120px] font-bold text-[#d4af37] leading-none opacity-80" style={{ textShadow: "0 0 30px rgba(212, 175, 55, 0.3)" }}>
                    404
                </div>

                <h1 className="text-3xl font-bold mb-4 mt-2 text-[#EAE0D5]">
                    {t("common.notFound.title", "Página não encontrada")}
                </h1>

                <p className="text-[#8b7355] mb-8 text-lg">
                    {t("common.notFound.description", "Aparece que você se perdeu nos corredores do museu. A página que você procura não existe ou foi movida.")}
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => navigate("/")}
                        className="w-full py-3 px-6 bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-[#1a1108] font-bold rounded-lg shadow-lg hover:shadow-[#d4af37]/20 transition-all transform hover:scale-[1.02]"
                    >
                        {t("common.backToHome", "Voltar ao Início")}
                    </button>

                    <button
                        onClick={() => navigate(-1)}
                        className="w-full py-3 px-6 bg-transparent border border-[#463420] text-[#8b7355] font-bold rounded-lg hover:bg-[#463420]/20 hover:text-[#d4af37] transition-all"
                    >
                        {t("common.goBack", "Voltar à página anterior")}
                    </button>
                </div>
            </div>

            <div className="absolute bottom-6 text-[#463420] text-sm">
                Cultura Viva System
            </div>
        </div>
    );
};
