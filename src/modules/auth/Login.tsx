import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";

import { 
  Button, 
  AnimateIn, 
  ParticleBackground,
  Badge
} from "@/components/ui";
import { Zap, Mail, Lock, ArrowRight } from "lucide-react";

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const { role: userRole, tenantType, hasProviderProfile } = await login({ email, password });

      // Redirecionar baseado no role após login
      let redirectPath = "/";

      if (hasProviderProfile) {
        redirectPath = "/provider";
      } else if (userRole === "master") {
        redirectPath = "/master";
      } else if (userRole === "admin") {
        if (tenantType === "PRODUCER") {
          redirectPath = "/producer";
        } else {
          redirectPath = "/admin";
        }
      } else if (userRole === "visitor") {
        redirectPath = "/home";
      }



      const from = location.state?.from?.pathname;
      navigate(from || redirectPath, { replace: true, state: { justLoggedIn: true } });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("auth.errors.generic")
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="login-page min-h-screen w-full flex items-center justify-center p-4 bg-bg-page relative overflow-hidden">
      <ParticleBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg-page/80 pointer-events-none"></div>
      
      <LanguageSwitcher absolute={true} />

      <AnimateIn variant="fadeUp" className="w-full max-w-[440px] relative z-10 flex flex-col items-center">
        <form
          onSubmit={handleSubmit}
          className="w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-2xl relative overflow-hidden group transition-all duration-500 hover:border-white/20"
        >
          {/* Subtle Glow Effect */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold-400/5 blur-3xl rounded-full pointer-events-none group-hover:bg-gold-400/10 transition-all duration-700"></div>

          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gold-400/20 blur-xl rounded-full animate-pulse"></div>
                <img 
                  src="/logo-culturaviva.jpg" 
                  alt="Logo" 
                  className="w-16 h-16 rounded-full border-2 border-gold-400 relative z-10 object-cover shadow-lg" 
                />
              </div>
            </div>
            
            <h1 className="text-3xl font-black tracking-tighter text-white mb-2 uppercase">
              Pulse <span className="text-gold-400 italic">Auth</span>
            </h1>
            <p className="text-gray-400 text-sm font-medium">
              Sua jornada cultural começa aqui
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">
                E-mail
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold-400 transition-colors" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-gold-400/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500">
                  Senha
                </label>
                <Link to="/forgot-password" size="sm" className="text-xs text-gold-400/80 hover:text-gold-400 transition-colors font-bold uppercase tracking-tighter">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold-400 transition-colors" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-gold-400/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                />
              </div>
            </div>

            {error && (
              <AnimateIn variant="scaleUp">
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold text-center">
                  {error}
                </div>
              </AnimateIn>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full py-4 font-black shadow-xl shadow-gold-500/20"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight size={20} />}
            >
              Entrar
            </Button>
          </div>

          <div className="mt-10 text-center">
            <p className="text-gray-500 text-sm font-medium">
              Não possui uma conta?{" "}
              <button
                type="button"
                className="text-gold-400 font-black uppercase tracking-tighter hover:underline px-2"
                onClick={() => navigate("/select-museum?mode=register")}
              >
                Cadastre-se agora
              </button>
            </p>
          </div>
        </form>
      </AnimateIn>
    </div>
  );
};
