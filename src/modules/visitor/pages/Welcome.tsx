import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext";
import { useTenant } from "../../auth/TenantContext";
import { TenantLogo } from "../../../components/Branding/TenantLogo";
import { LanguageSwitcher } from "../../../components/LanguageSwitcher";
import { Smartphone, Eye, Lock, Zap } from "lucide-react";
import { ParticleBackground, Button } from "@/components/ui";
import { motion } from "framer-motion";

export const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { enterAsGuest, isAuthenticated } = useAuth();
  const tenant = useTenant();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="welcome-container relative min-h-screen flex flex-col justify-center items-center px-8 bg-[#05050c]"
    >
      <ParticleBackground count={40} />
      
      {/* Cinematic Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] bg-[var(--accent-primary)]/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-20 flex flex-col items-center w-full max-w-lg">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
          className="mb-12"
        >
          <TenantLogo size={120} showText={false} className="shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10 rounded-[40px] bg-[#0a0a0e] p-2" />
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5, duration: 1 }}
           className="text-center mb-16"
        >
          <motion.div 
             initial={{ width: 0 }}
             animate={{ width: "80px" }}
             transition={{ delay: 1, duration: 1 }}
             className="h-[1px] bg-[var(--accent-primary)] mx-auto mb-6"
          />
          <h1 className="text-4xl md:text-6xl font-heading font-black tracking-tighter text-white mb-4 leading-none">
            {tenant?.name || t("welcome.title")}
          </h1>
          <p className="text-[10px] uppercase tracking-[0.6em] font-bold text-[var(--accent-primary)] opacity-80">
            {t("welcome.subtitle")}
          </p>
        </motion.div>

        <div className="flex flex-col w-full gap-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              onClick={() => navigate("/select-museum")}
              size="lg"
              className="w-full h-20 text-xl tracking-widest font-black rounded-3xl shadow-[0_20px_50px_rgba(212,175,55,0.2)] border border-white/10"
              rightIcon={<Smartphone size={24} />}
            >
              {t("welcome.explore")}
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="grid grid-cols-2 gap-5"
          >
            <button
              onClick={() => {
                enterAsGuest();
                navigate("/select-museum");
              }}
              className="h-16 bg-white/[0.03] border border-white/5 rounded-3xl text-[11px] font-bold uppercase tracking-widest text-[#f5e6d3]/60 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <Eye size={18} /> {t("welcome.guest", "Guest")}
            </button>
            <button
              onClick={() => navigate("/login")}
              className="h-16 bg-white/[0.03] border border-white/5 rounded-3xl text-[11px] font-bold uppercase tracking-widest text-[#f5e6d3]/60 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <Lock size={16} /> {isAuthenticated ? "Painel" : t("welcome.login")}
            </button>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.5 }}
          className="mt-20"
        >
          <LanguageSwitcher />
        </motion.div>
      </div>

      {/* Luxury Accents */}
      <div className="absolute top-12 left-12 w-2 h-2 rounded-full bg-[var(--accent-primary)]/10" />
      <div className="absolute bottom-12 right-12 w-2 h-2 rounded-full bg-[var(--accent-primary)]/10" />
      <div className="absolute top-1/2 right-12 w-[1px] h-20 bg-gradient-to-b from-transparent via-[var(--accent-primary)]/20 to-transparent" />
      <div className="absolute top-1/2 left-12 w-[1px] h-20 bg-gradient-to-b from-transparent via-[var(--accent-primary)]/20 to-transparent" />
    </motion.div>
  );
};
