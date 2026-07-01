import React, { useState, useEffect } from "react";
import { api } from "../../../../api/client";
import { toast } from "react-hot-toast";
import { BarChart3, Eye, MousePointerClick, QrCode, Ticket, CheckSquare } from "lucide-react";

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
    } catch (err) {
      toast.error("Erro ao carregar dados de impacto real.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black text-white italic tracking-tight">Painel de Impacto Cultural</h1>
        <p className="text-slate-400 mt-1">Acompanhe o retorno de mídia e impacto social gerado pelos seus patrocínios.</p>
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
              <h2 className="text-3xl font-black text-white mt-1">{stats.views.toLocaleString()}</h2>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <MousePointerClick size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Cliques no Website</span>
              <h2 className="text-3xl font-black text-white mt-1">{stats.clicks.toLocaleString()}</h2>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
              <QrCode size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Leituras de QR Code</span>
              <h2 className="text-3xl font-black text-white mt-1">{stats.qrScans.toLocaleString()}</h2>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Ticket size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Público / Visitantes</span>
              <h2 className="text-3xl font-black text-white mt-1">{stats.visits.toLocaleString()}</h2>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-8 rounded-[40px] bg-white/5 border border-white/5 space-y-6">
          <h3 className="text-lg font-bold text-white italic">Ações de Acessibilidade Financiadas</h3>
          <div className="flex items-center gap-6 p-6 bg-black/40 rounded-3xl border border-white/5">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-2xl">
              ♿
            </div>
            <div>
              <h4 className="text-lg font-black text-white">{stats.accessibilityDeliveries} Entregas</h4>
              <p className="text-xs text-slate-500 mt-1">Interpretes de LIBRAS, audiodescrição ou maquetes táteis executadas com auxílio do seu aporte.</p>
            </div>
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
