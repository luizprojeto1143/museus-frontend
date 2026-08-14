import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../../api/client";
import { toast } from "react-hot-toast";
import { Eye, MousePointerClick, QrCode, Ticket, Accessibility, Palette, Sparkles, ChevronRight, Building2 } from "lucide-react";

interface ImpactStats {
  views: number;
  clicks: number;
  qrScans: number;
  visits: number;
  accessibilityDeliveries: number;
  totalInvestment: number;
}

export const SponsorImpact: React.FC = () => {
  const [stats, setStats] = useState<ImpactStats>({
    views: 0,
    clicks: 0,
    qrScans: 0,
    visits: 0,
    accessibilityDeliveries: 0,
    totalInvestment: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get("/sponsor-portal/dashboard");
      setStats(res.data);
    } catch (_err) {
      toast.error("Erro ao carregar dados de impacto real.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Welcome & Action Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 p-8 rounded-[32px] border border-white/10 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={14} /> Portal do Patrocinador Cultural
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white italic tracking-tight">Painel de Impacto Cultural</h1>
          <p className="text-slate-400 text-sm mt-1">Acompanhe em tempo real o retorno de mídia e o impacto social gerados pelos seus aportes na preservação das obras de arte.</p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <Link to="/sponsor/browse" className="w-full md:w-auto">
            <button className="w-full px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20">
              <Palette size={16} /> Patrocinar Nova Obra <ChevronRight size={16} />
            </button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="p-20 text-center animate-pulse text-amber-500 font-bold italic">Carregando painel de impacto...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Eye size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Visualizações da Marca</span>
              <h2 className="text-3xl font-black text-white mt-1">{stats.views.toLocaleString('pt-BR')}</h2>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <MousePointerClick size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Cliques no Website</span>
              <h2 className="text-3xl font-black text-white mt-1">{stats.clicks.toLocaleString('pt-BR')}</h2>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
              <QrCode size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Leituras de QR Code</span>
              <h2 className="text-3xl font-black text-white mt-1">{stats.qrScans.toLocaleString('pt-BR')}</h2>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Ticket size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Público / Visitantes</span>
              <h2 className="text-3xl font-black text-white mt-1">{stats.visits.toLocaleString('pt-BR')}</h2>
            </div>
          </div>
        </div>
      )}

      {/* Impact Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-8 rounded-[40px] bg-white/5 border border-white/5 space-y-6">
          <h3 className="text-lg font-bold text-white italic">Ações de Acessibilidade Financiadas</h3>
          <div className="flex items-center gap-6 p-6 bg-black/40 rounded-3xl border border-white/5">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Accessibility size={28} />
            </div>
            <div>
              <h4 className="text-lg font-black text-white">{stats.accessibilityDeliveries} Entregas Executadas</h4>
              <p className="text-xs text-slate-400 mt-1">Intérpretes de LIBRAS, audiodescrição ou maquetes tátil executadas com auxílio do seu aporte cultural nas obras patrocinadas.</p>
            </div>
          </div>

          {/* Quick Management Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Link to="/sponsor/my-sponsorships" className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 transition-all group flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 size={20} className="text-amber-400" />
                <div>
                  <h5 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">Minhas Obras Patrocinadas</h5>
                  <p className="text-[11px] text-slate-500">Gerencie cotas e status das obras</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
            </Link>

            <Link to="/sponsor/contracts" className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 transition-all group flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles size={20} className="text-purple-400" />
                <div>
                  <h5 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">Logomarca & Ativos</h5>
                  <p className="text-[11px] text-slate-500">Upload de marca para placas e totens</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
            </Link>
          </div>
        </div>

        <div className="p-8 rounded-[40px] bg-white/5 border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white italic">Aporte Total Acumulado</h3>
            <p className="text-xs text-slate-500 mt-1">Total investido no fomento à cultura local.</p>
          </div>
          <div className="py-6">
            <h2 className="text-5xl font-black text-amber-400 tracking-tight italic">
              R$ {stats.totalInvestment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
          </div>
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
            Obrigado por apoiar a Cultura Viva!
          </p>
        </div>
      </div>
    </div>
  );
};
