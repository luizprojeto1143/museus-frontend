import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Sparkles, Building2, Award, ChevronRight, ArrowRight, CheckCircle2, DollarSign, Eye, QrCode, FileText, Lock, Users } from 'lucide-react';
import { Badge, Button, Card, AnimateIn } from '@/components/ui';
import { motion } from 'framer-motion';
import { useAuth } from '../../../auth/AuthContext';

export function SponsorLanding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  const isSponsorUser = isAuthenticated && (role === 'sponsor' || role === 'master' || role === 'equipment_admin' || role === 'municipal_admin');

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-amber-500/30 overflow-x-hidden">
      {/* Top Navbar */}
      <header className="h-20 px-6 md:px-12 border-b border-white/10 flex items-center justify-between bg-slate-950/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black">
            <ShieldCheck size={24} />
          </div>
          <div>
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] block leading-none">Plataforma Oficial</span>
            <span className="text-lg font-black text-white italic tracking-tight">Cultura Viva • Patrocínio & Mecenato</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isSponsorUser ? (
            <Link to="/sponsor">
              <Button className="bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black px-6 py-2.5 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:scale-105 transition-all">
                Acessar Meu Painel <ArrowRight size={16} />
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/sponsor/login">
                <Button variant="outline" className="border-white/10 text-slate-300 hover:text-white rounded-2xl text-xs font-bold px-4 py-2">
                  Entrar
                </Button>
              </Link>
              <Link to="/sponsor/register">
                <Button className="bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black px-5 py-2 text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-500/20">
                  Cadastrar Empresa
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 space-y-20">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Sparkles size={14} /> Abatimento Fiscal de IRPJ & ICMS • 100% Homologado
          </Badge>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white italic tracking-tight leading-[1.05]">
            Transforme Impostos em <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500">Patrimônio Cultural</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-400 leading-relaxed font-medium">
            Conecte sua empresa a obras de arte históricas, restauração de patrimônios e espetáculos teatrais com abatimento fiscal e retorno de marca comprovado em tempo real.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
            <Link to="/patrocinar/obras" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider px-8 py-4 rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2">
                <Building2 size={20} /> Explorar Obras & Cotas <ChevronRight size={18} />
              </Button>
            </Link>

            {!isSponsorUser && (
              <Link to="/sponsor/register" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto border-white/10 text-white hover:bg-white/5 font-bold text-sm px-8 py-4 rounded-2xl">
                  Criar Conta Corporativa
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          <div className="p-8 rounded-[36px] bg-slate-900/80 border border-white/10 space-y-4 hover:border-amber-500/30 transition-all shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <DollarSign size={28} />
            </div>
            <h3 className="text-xl font-black text-white italic">Dedução Fiscal 100% Legal</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direcione impostos de renda corporativo (Lei Rouanet Artigo 18) ou ICMS estadual diretamente para projetos culturais homologados sem custo adicional para o seu caixa.
            </p>
          </div>

          <div className="p-8 rounded-[36px] bg-slate-900/80 border border-white/10 space-y-4 hover:border-amber-500/30 transition-all shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Eye size={28} />
            </div>
            <h3 className="text-xl font-black text-white italic">Reciprocidade de Marca</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sua marca em placas de acervo, totens de museus, folhetos teatrais (playbills) e no audioguia interativo com relatório em tempo real de visualizações e leituras QR Code.
            </p>
          </div>

          <div className="p-8 rounded-[36px] bg-slate-900/80 border border-white/10 space-y-4 hover:border-amber-500/30 transition-all shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Award size={28} />
            </div>
            <h3 className="text-xl font-black text-white italic">Certificados ESG & Governança</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Receba selos digitais de patrocinador cultural, relatórios de impacto social e prestação de contas automatizada para auditoria do Tribunal de Contas.
            </p>
          </div>
        </div>

        {/* Interactive CTA Card */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 p-10 md:p-14 rounded-[40px] border border-amber-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <Badge className="bg-amber-500/20 text-amber-300 border-none px-3 py-1 text-[10px] font-black uppercase">
              Comece Agora
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tight">
              Pronto para se tornar um Patrocinador Cultural?
            </h2>
            <p className="text-slate-300 text-xs md:text-sm max-w-xl">
              Cadastre sua empresa em 2 minutos e escolha entre cotas Diamante, Ouro e Prata para restaurações e festivais em cartaz.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link to="/sponsor/register" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-8 py-4 rounded-2xl text-xs uppercase tracking-wider shadow-xl shadow-amber-500/20">
                Cadastrar Empresa
              </Button>
            </Link>
            <Link to="/sponsor/login" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 font-bold px-6 py-4 rounded-2xl text-xs">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
