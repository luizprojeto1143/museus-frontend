import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../api/client";
import { toast } from "react-hot-toast";
import { 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  Database, 
  Clock, 
  ChevronRight, 
  FileCode2, 
  Sparkles,
  Building
} from "lucide-react";

interface OverviewStats {
  errors24h: number;
  criticalErrors24h: number;
  securityEvents24h: number;
  failedIntegrations24h: number;
  avgApiDurationMs: number;
  slowRequests24h: number;
  auditEvents24h: number;
  activeTenants24h: number;
}

export const MasterMonitoring: React.FC = () => {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await api.get("/master/monitoring/overview");
      setStats(res.data);
    } catch (err) {
      toast.error("Erro ao obter visão geral de monitoramento.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-20 text-center text-amber-500 font-bold italic animate-pulse">Carregando painel de monitoramento...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black text-white italic tracking-tight flex items-center gap-3">
          <Activity className="text-amber-500" /> Monitoramento & Observabilidade
        </h1>
        <p className="text-slate-400 mt-1">Visão geral do estado operacional da rede SaaS do Cultura Viva.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Errors card */}
        <Link to="/master/monitoramento/erros" className="p-6 rounded-[32px] bg-white/5 border border-white/5 hover:bg-white/10 transition-all space-y-4 text-left block">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
            <AlertTriangle size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block">Erros (24h)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-3xl font-black text-white">{stats?.errors24h}</h2>
              {stats?.criticalErrors24h ? (
                <span className="text-xs bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded">
                  {stats.criticalErrors24h} críticos
                </span>
              ) : null}
            </div>
          </div>
        </Link>

        {/* Security card */}
        <Link to="/master/monitoramento/seguranca" className="p-6 rounded-[32px] bg-white/5 border border-white/5 hover:bg-white/10 transition-all space-y-4 text-left block">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <ShieldAlert size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block">Eventos de Segurança (24h)</span>
            <h2 className="text-3xl font-black text-white mt-1">{stats?.securityEvents24h}</h2>
          </div>
        </Link>

        {/* Integrations card */}
        <Link to="/master/monitoramento/integracoes" className="p-6 rounded-[32px] bg-white/5 border border-white/5 hover:bg-white/10 transition-all space-y-4 text-left block">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Database size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block">Integrações Instáveis (24h)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-3xl font-black text-white">{stats?.failedIntegrations24h}</h2>
              {stats?.failedIntegrations24h ? (
                <span className="text-xs bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded">Falhas</span>
              ) : null}
            </div>
          </div>
        </Link>

        {/* Response time card */}
        <div className="p-6 rounded-[32px] bg-white/5 border border-white/5 space-y-4 text-left">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block">Latência Média da API</span>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-3xl font-black text-white">{stats?.avgApiDurationMs}ms</h2>
              {stats?.slowRequests24h ? (
                <span className="text-[10px] text-amber-400 font-bold">{stats.slowRequests24h} lentas</span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main telemetry status */}
        <div className="lg:col-span-2 p-8 rounded-[40px] bg-white/5 border border-white/5 space-y-6">
          <h3 className="text-lg font-bold text-white italic">Ações Rápidas de Investigação</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/master/monitoramento/auditoria" className="p-5 bg-black/40 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Registro de Auditoria</h4>
                <p className="text-xs text-slate-500 mt-1">{stats?.auditEvents24h} eventos nas últimas 24h</p>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </Link>

            <Link to="/master/monitoramento/jobs" className="p-5 bg-black/40 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Tarefas e Jobs Automáticos</h4>
                <p className="text-xs text-slate-500 mt-1">Verificar logs de execuções BullMQ e Cron</p>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Active tenants overview */}
        <div className="p-8 rounded-[40px] bg-white/5 border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white italic">Tenants Activos</h3>
            <p className="text-xs text-slate-500 mt-1">Cidades e equipamentos com tráfego.</p>
          </div>
          <div className="py-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Building size={32} />
            </div>
            <div>
              <h2 className="text-4xl font-black text-white italic">{stats?.activeTenants24h}</h2>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Nas últimas 24h</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
            CULTURA VIVA CONTROL SYSTEM
          </p>
        </div>
      </div>
    </div>
  );
};
