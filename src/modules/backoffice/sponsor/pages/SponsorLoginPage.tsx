import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/modules/auth/AuthContext";
import { toast } from "react-hot-toast";
import { ShieldCheck, Mail, Lock, ArrowRight, Building2, Sparkles } from "lucide-react";

export const SponsorLoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || "/sponsor/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha o e-mail e a senha de acesso.");
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      toast.success("Bem-vindo ao Portal do Patrocinador!");
      navigate(from, { replace: true });
    } catch (err: any) {
      const message = err?.response?.data?.message || "E-mail ou senha incorretos.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 shadow-xl shadow-amber-500/20 mb-2 mx-auto">
            <ShieldCheck size={36} />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} /> Acesso Corporativo
          </div>
          <h1 className="text-3xl font-black italic tracking-tight text-white">
            Portal do Patrocinador
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Acesse o painel de impacto cultural, gerencie suas marcas e acompanhe o retorno de mídia da sua empresa.
          </p>
        </div>

        {/* Login Form Card */}
        <div className="p-8 rounded-[32px] bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                E-mail Corporativo
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="empresa@patrocinador.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Senha de Acesso
                </label>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 mt-2"
            >
              {loading ? "Entrando..." : "Entrar no Portal"} <ArrowRight size={16} />
            </button>
          </form>

          {/* Registration Prompt */}
          <div className="pt-6 border-t border-white/5 text-center space-y-3">
            <p className="text-xs text-slate-400">
              Sua empresa ainda não tem cadastro como patrocinadora?
            </p>
            <Link
              to="/sponsor/register"
              className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 text-xs font-bold transition-colors"
            >
              <Building2 size={16} /> Cadastrar Empresa Patrocinadora
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
