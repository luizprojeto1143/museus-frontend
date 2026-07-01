import React, { useState, useEffect } from "react";
import { api } from "../../../api/client";
import { toast } from "react-hot-toast";
import { ShieldAlert, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../components/ui";

interface SecurityEvent {
  id: string;
  type: string;
  severity: string;
  ipAddress: string | null;
  userAgent: string | null;
  path: string | null;
  method: string | null;
  metadata: any;
  createdAt: string;
  tenant: { name: string } | null;
  user: { name: string; email: string } | null;
}

export const MasterSecurityEvents: React.FC = () => {
  const [logs, setLogs] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(15);

  // Filters
  const [severity, setSeverity] = useState("");
  const [selectedLog, setSelectedLog] = useState<SecurityEvent | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [page, severity]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/master/monitoring/security-events", {
        params: {
          page,
          limit,
          severity
        }
      });
      setLogs(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      toast.error("Erro ao carregar logs de segurança.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black text-white italic tracking-tight flex items-center gap-3">
          <ShieldAlert className="text-purple-500" /> Eventos de Segurança
        </h1>
        <p className="text-slate-400 mt-1">Monitore bloqueios de CSRF, tentativas de intrusão, token expirado e restrição de acesso.</p>
      </div>

      {/* Filter panel */}
      <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex gap-4 items-center">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Nível de Ameaça</label>
        <select 
          value={severity}
          onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
          className="bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm outline-none w-56"
        >
          <option value="">Todos</option>
          <option value="INFO">INFO</option>
          <option value="WARNING">WARNING</option>
          <option value="HIGH">HIGH</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>
      </div>

      {loading ? (
        <div className="p-20 text-center text-amber-500 font-bold italic animate-pulse">Buscando segurança...</div>
      ) : logs.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/5 rounded-[32px] overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] text-slate-500 uppercase font-black tracking-widest">
                  <th className="p-4">Data</th>
                  <th className="p-4">Evento</th>
                  <th className="p-4">Nível</th>
                  <th className="p-4">Rota / Path</th>
                  <th className="p-4">Usuário</th>
                  <th className="p-4">IP</th>
                  <th className="p-4 text-right">Metadados</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="p-4 font-mono text-xs text-slate-400">
                      {new Date(log.createdAt).toLocaleString("pt-BR")}
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-bold text-white">{log.type}</span>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] px-2.5 py-1 rounded font-black uppercase tracking-wider ${
                        log.severity === "CRITICAL" ? "bg-red-500 text-white font-bold shadow-lg shadow-red-500/20" :
                        log.severity === "HIGH" ? "bg-orange-500/20 text-orange-400 font-bold" :
                        log.severity === "WARNING" ? "bg-yellow-500/20 text-yellow-400 font-bold" :
                        "bg-slate-500/20 text-slate-400"
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-300">
                      {log.method ? `${log.method} ` : ""}{log.path || "-"}
                    </td>
                    <td className="p-4 text-xs text-slate-400">
                      {log.user?.email || "Público / Não autenticado"}
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-500">
                      {log.ipAddress || "-"}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedLog(log)}
                        className="text-xs text-amber-400 font-bold hover:underline"
                      >
                        Inspecionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
            <span>Total de {total} ameaças de segurança</span>
            <div className="flex gap-2">
              <button 
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 bg-white/5 rounded-lg disabled:opacity-50 hover:bg-white/10"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                disabled={page * limit >= total}
                onClick={() => setPage(page + 1)}
                className="p-2 bg-white/5 rounded-lg disabled:opacity-50 hover:bg-white/10"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-16 text-center text-slate-500 italic">Nenhum alerta de segurança registrado.</div>
      )}

      {/* Details modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[2000] flex items-center justify-center p-4">
          <div className="premium-glass p-8 rounded-[40px] border-white/5 max-w-lg w-full space-y-6">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{selectedLog.type}</span>
              <h3 className="text-xl font-black text-white italic mt-1">Inspeção de Segurança</h3>
            </div>

            <pre className="bg-black/60 p-4 rounded-xl border border-white/5 text-xs text-purple-400 font-mono overflow-auto max-h-60 leading-relaxed whitespace-pre-wrap select-all">
              {JSON.stringify(selectedLog.metadata, null, 2)}
            </pre>

            <div className="space-y-2 text-xs border-t border-white/5 pt-4">
              <p><span className="text-slate-500">IP Originador:</span> <span className="text-slate-300 font-mono">{selectedLog.ipAddress || "Desconhecido"}</span></p>
              <p><span className="text-slate-500">User Agent:</span> <span className="text-slate-300">{selectedLog.userAgent || "Desconhecido"}</span></p>
            </div>

            <Button onClick={() => setSelectedLog(null)} className="w-full bg-white/10 hover:bg-white/15 text-white font-bold py-3 rounded-xl">
              Fechar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
