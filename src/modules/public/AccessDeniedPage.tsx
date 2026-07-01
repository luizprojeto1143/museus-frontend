import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useIsCityMode } from "../auth/TenantContext";

export const AccessDeniedPage: React.FC = () => {
  const { t } = useTranslation();
  const isCityMode = useIsCityMode();

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${isCityMode ? "bg-[#020617]" : "bg-black"}`}>
      <div className="max-w-md w-full flex flex-col items-center text-center">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 border-2 ${isCityMode ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"}`}>
          <ShieldAlert size={48} strokeWidth={1.5} />
        </div>
        
        <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-4">
          {t("errors.403.title", "Acesso Negado")}
        </h1>
        
        <p className="text-slate-400 text-lg mb-8 leading-relaxed">
          {t("errors.403.description", "Você não tem permissão para acessar esta área. Se acredita que isto seja um erro, contate o administrador da plataforma.")}
        </p>

        <Link
          to="/"
          className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all duration-300 ${
            isCityMode 
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]" 
              : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
          }`}
        >
          <ArrowLeft size={18} />
          {t("errors.403.back", "Voltar ao Início")}
        </Link>
      </div>
    </div>
  );
};
