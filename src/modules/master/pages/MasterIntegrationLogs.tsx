import React, { useState, useEffect } from "react";
import { api } from "../../../api/client";
import { toast } from "react-hot-toast";
import { Database, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../components/ui";

interface IntegrationLog {
  id: string;
  provider: string;
  operation: string;
  status: string;
  requestId: string | null;
  message: string | null;
  metadata: any;
  createdAt: string;
}

export const MasterIntegrationLogs: React.FC = () => {
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(15);

  // Filters
  const [provider, setProvider] = useState("");
  const [status, setStatus] = useState("");
  const [selectedLog, setSelectedLog] = useState<IntegrationLog | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [page, provider, status]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/master/monitoring/integrations", {
        params: {
          page,
          limit,
          provider,
          status
        }
      });
      setLogs(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      toast.error("Erro ao carregar logs de integração.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black text-white italic tracking-tight flex items-center gap-3">
          <Database className="text-amber-500" /> Histórico de Integrações
        </h1>
        <p className="text-slate-400 mt-1">Acompanhe requisições de Stripe, Envio de E-mail (Resend/SendGrid), Storage e IA.</p>
      </div>

      {/* Filters */}
      <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex flex-wrap gap-4 items-center">
        <div className="flex gap-2 items-center">
          <span className="text-xs text-slate-500 font-bold uppercase">Integradora</span>
          <select 
            value={provider}
            onChange={(e) => { setProvider(e.target.value); setPage(1); }}
            className="bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm outline-none w-44"
          >
            <option value="">Todas</option>
            <option value="STRIPE">Stripe</option>
            <option value="EMAIL">E-mail</option>
            <option value="STORAGE">Storage</option>
            <option value="AI">Inteligência Artificial</option>
            <option value="MAPS">Mapas</option>
            <option value="ASAAS">Asaas</option>
          </select>
        </div>

        <div className="flex gap-2 items-center">
          <span className="text-xs text-slate-500 font-bold uppercase">Status</span>
          <select 
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm outline-none w-44"
          >
            <option value="">Todos</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILED">FAILED</option>
            <option value="PENDING">PENDING</option>
            <option value="RETRYING">RETRYING</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-20 text-center text-amber-500 font-bold italic animate-pulse">Carregando integrações...</div>
      ) : logs.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/5 rounded-[32px] overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] text-slate-500 uppercase font-black tracking-widest">
                  <th className="p-4">Data</th>
                  <th className="p-4">Provedor</th>
                  <th className="p-4">Operação</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Request ID</th>
                  <th className="p-4">Mensagem de Retorno</th>
                  <th className="p-4 text-right">Mais</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="p-4 font-mono text-xs text-slate-400">
                      {new Date(log.createdAt).toLocaleString("pt-BR")}
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-bold text-white">{log.provider}</span>
                    </td>
                    <td className="p-4 text-xs font-mono text-slate-300">
                      {log.operation}
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
                        log.status === "SUCCESS" ? "bg-green-500/20 text-green-400" :
                        log.status === "FAILED" ? "bg-red-500/20 text-red-400" :
                        "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-500">
                      {log.requestId || "-"}
                    </td>
                    <td className="p-4 text-xs text-slate-300 truncate max-w-xs">
                      {log.message || "-"}
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
            <span>Total de {total} chamadas externas</span>
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
        <div className="p-16 text-center text-slate-500 italic">Nenhum log de integração.</div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[2000] flex items-center justify-center p-4">
          <div className="premium-glass p-8 rounded-[40px] border-white/5 max-w-lg w-full space-y-6">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{selectedLog.provider} • {selectedLog.operation}</span>
              <h3 className="text-xl font-black text-white italic mt-1">Payload e Resposta</h3>
            </div>

            <pre className="bg-black/60 p-4 rounded-xl border border-white/5 text-xs text-blue-400 font-mono overflow-auto max-h-60 leading-relaxed whitespace-pre-wrap select-all">
              {JSON.stringify(selectedLog.metadata, null, 2)}
            </pre>

            {selectedLog.message && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-xs text-red-400 rounded-xl">
                Mensagem: {selectedLog.message}
              </div>
            )}

            <Button onClick={() => setSelectedLog(null)} className="w-full bg-white/10 hover:bg-white/15 text-white font-bold py-3 rounded-xl">
              Fechar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
