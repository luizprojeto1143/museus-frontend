import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/AuthContext";
import { api } from "@/api/client";
import { toast } from "react-hot-toast";
import { ShieldCheck, Mail, Lock, Building2, Phone, Globe, FileText, ArrowRight, Sparkles } from "lucide-react";

export const SponsorRegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    companyName: "",
    cnpj: "",
    email: "",
    phone: "",
    website: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.companyName || !form.email || !form.password) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    if (form.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      // 1. Cadastra como PATROCINADOR
      await api.post("/auth/register", {
        name: form.companyName,
        email: form.email,
        password: form.password,
        role: "PATROCINADOR",
        cpf: form.cnpj,
        phone: form.phone,
        website: form.website
      });

      toast.success("Conta corporativa criada com sucesso!");

      // 2. Login Automático
      await login({ email: form.email, password: form.password });
      navigate("/sponsor/dashboard", { replace: true });
    } catch (err: any) {
      const message = err?.response?.data?.message || "Erro ao criar conta de patrocinador.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4 py-12 relative overflow-hidden font-sans">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="w-full max-w-xl space-y-8 z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 shadow-xl shadow-amber-500/20 mb-2 mx-auto">
            <ShieldCheck size={36} />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} /> Novo Cadastro Corporativo
          </div>
          <h1 className="text-3xl font-black italic tracking-tight text-white">
            Cadastrar Empresa Patrocinadora
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Junte-se à rede de apoiadores da cultura. Sua marca conectada aos acervos, museus e patrimônios históricos do Brasil.
          </p>
        </div>

        {/* Form Card */}
        <div className="p-8 rounded-[32px] bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome da Empresa */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Razão Social / Nome da Empresa *
              </label>
              <div className="relative">
                <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  name="companyName"
                  required
                  placeholder="Ex: Empresa Cultural Brasil S.A."
                  value={form.companyName}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            {/* CNPJ & E-mail */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  CNPJ da Empresa
                </label>
                <div className="relative">
                  <FileText size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    name="cnpj"
                    placeholder="00.000.000/0001-00"
                    value={form.cnpj}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  E-mail Corporativo *
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="contato@empresa.com.br"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Telefone & Website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Telefone / WhatsApp
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    name="phone"
                    placeholder="(11) 99999-9999"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Website Oficial
                </label>
                <div className="relative">
                  <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="url"
                    name="website"
                    placeholder="https://suaempresa.com.br"
                    value={form.website}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Senhas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Senha de Acesso *
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Confirmar Senha *
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    placeholder="Repita a senha"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 mt-4"
            >
              {loading ? "Criando Conta..." : "Concluir Cadastro Corporativo"} <ArrowRight size={16} />
            </button>
          </form>

          {/* Login Link */}
          <div className="pt-6 border-t border-white/5 text-center space-y-2">
            <p className="text-xs text-slate-400">
              Sua empresa já possui um cadastro?
            </p>
            <Link
              to="/sponsor/login"
              className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 text-xs font-bold transition-colors"
            >
              Fazer Login no Portal do Patrocinador
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
