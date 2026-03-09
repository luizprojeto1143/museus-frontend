import { useTranslation } from "react-i18next";
import React from "react";
import { Construction } from "lucide-react";

export const ProducerPlaceholder: React.FC<{ title: string }> = ({ title }) => {
  const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-[#2c1e10] rounded-full flex items-center justify-center mb-6 border border-[#463420] shadow-lg shadow-black/20">
                <Construction size={40} className="text-[#D4AF37]" />
            </div>
            <h1 className="text-3xl font-bold text-[#EAE0D5] mb-2 font-serif">{title}</h1>
            <p className="text-[#B0A090] max-w-md">{t("producer.producerplaceholder.estaFuncionalidadeEstEmDesenvo", "Esta funcionalidade está em desenvolvimento e estará disponível na próxima atualização do Portal do Produtor.")}</p>
        </div>
    );
};
