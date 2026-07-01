import React, { useState, useEffect } from "react";
import { api } from "../../../api/client";
import { toast } from "react-hot-toast";
import { Building2, ShieldAlert, AlertTriangle, FileText, Activity } from "lucide-react";

interface Tenant {
  id: string;
  name: string;
}

interface ActivityLogs {
  recentErrors: any[];
  recentSecurity: any[];
  recentAudit: any[];
  recentRequests: any[];
}

export const MasterTenantActivity: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [activity, setActivity] = useState<ActivityLogs | null>(null);
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(false);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setLoadingTenants(true);
    try {
      const res = await api.get("/tenants");
      setTenants(res.data);
      if (res.data.length > 0) {
        setSelectedTenantId(res.data[0].id);
        fetchActivity(res.data[0].id);
      }
    } catch (err) {
      toast.error("Erro ao obter lista de tenants.");
    } finally {
      setLoadingTenants(false);
    }
  };

  const fetchActivity = async (tenantId: string) => {
    setLoadingActivity(true);
    try {
      const res = await api.get(`/master/monitoring/tenants/${tenantId}/activity`);
      setActivity(res.data);
    } catch (err) {
      toast.error("Erro ao buscar logs do tenant.");
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleTenantChange = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    fetchActivity(tenantId);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-white italic tracking-tight flex items-center gap-3">
            <Building2 className="text-amber-500" /> Investigação por Tenant
          </h1>
          <p className="text-slate-400 mt-1">Monitore e debuge o Cultura Viva de forma segmentada para um município ou equipamento.</p>
        </div>

        {/* Tenant selection dropdown */}
        <div>
          {loadingTenants ? (
            <div className="text-slate-500 animate-pulse text-sm">Carregando tenants...</div>
          ) : (
            <select
              value={selectedTenantId}
              onChange={(e) => handleTenantChange(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm outline-none w-64"
            >
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loadingActivity ? (
        <div className="p-20 text-center text-amber-500 font-bold italic animate-pulse">Carregando linha do tempo...</div>
      ) : activity ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Audit Logs */}
          <div className="p-6 rounded-[32px] bg-white/5 border border-white/5 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <FileText size={16} className="text-blue-400" /> Histórico de Auditoria Recente
            </h3>
            {activity.recentAudit.length > 0 ? (
              <div className="space-y-2">
                {activity.recentAudit.map(log => (
                  <div key={log.id} className="p-3 bg-black/30 rounded-xl border border-white/5 text-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">{log.action}</p>
                      <p className="text-slate-500 text-[10px]">Por: {log.user?.email || "Sistema"}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Nenhuma atividade registrada.</p>
            )}
          </div>

          {/* Recent Security Events */}
          <div className="p-6 rounded-[32px] bg-white/5 border border-white/5 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert size={16} className="text-purple-400" /> Alertas de Segurança Recentes
            </h3>
            {activity.recentSecurity.length > 0 ? (
              <div className="space-y-2">
                {activity.recentSecurity.map(log => (
                  <div key={log.id} className="p-3 bg-red-950/20 rounded-xl border border-red-500/10 text-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold text-red-400">{log.type}</p>
                      <p className="text-slate-500 text-[10px]">{log.ipAddress}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Nenhum alerta de segurança recente.</p>
            )}
          </div>

          {/* Recent Error Logs */}
          <div className="p-6 rounded-[32px] bg-white/5 border border-white/5 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-400" /> Exceções do Servidor
            </h3>
            {activity.recentErrors.length > 0 ? (
              <div className="space-y-2">
                {activity.recentErrors.map(log => (
                  <div key={log.id} className="p-3 bg-red-950/20 rounded-xl border border-red-500/10 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-red-400 truncate max-w-[80%]">{log.message}</p>
                      <span className="text-[10px] text-slate-500 font-mono">{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono truncate">{log.method} {log.path}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Nenhuma exceção do servidor registrada.</p>
            )}
          </div>

          {/* Recent API Requests */}
          <div className="p-6 rounded-[32px] bg-white/5 border border-white/5 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Activity size={16} className="text-green-400" /> Tráfego de Entrada Recente
            </h3>
            {activity.recentRequests.length > 0 ? (
              <div className="space-y-2">
                {activity.recentRequests.map(log => (
                  <div key={log.id} className="p-3 bg-black/30 rounded-xl border border-white/5 text-xs flex justify-between items-center">
                    <span className="font-mono text-slate-300">{log.method} {log.path}</span>
                    <div className="text-right">
                      <span className={`text-[10px] font-bold ${log.statusCode >= 400 ? 'text-red-400' : 'text-green-400'}`}>
                        {log.statusCode}
                      </span>
                      <p className="text-[9px] text-slate-500 font-mono">{log.durationMs}ms</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Nenhum log de requisição recente.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="p-16 text-center text-slate-500 italic">Escolha um tenant acima para visualizar os dados de atividade.</div>
      )}
    </div>
  );
};
