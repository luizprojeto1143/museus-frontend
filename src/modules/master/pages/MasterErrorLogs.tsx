import React, { useState, useEffect } from "react";
import { api } from "../../../api/client";
import { toast } from "react-hot-toast";
import { AlertTriangle, Terminal, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../components/ui";

interface ErrorLog {
  id: string;
  source: string;
  severity: string;
  message: string;
  stack: string | null;
  path: string | null;
  method: string | null;
  statusCode: number | null;
  createdAt: string;
  tenant: { name: string } | null;
  user: { name: string; email: string } | null;
}

export const MasterErrorLogs: React.FC = () => {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(15);

  // Filters
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [source, setSource] = useState("");
  const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [page, severity, source]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/master/monitoring/errors", {
        params: {
          page,
          limit,
          search,
          severity,
          source
        }
      });
      setLogs(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      toast.error("Erro ao carregar logs de erro.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-white italic tracking-tight flex items-center gap-3">
            <AlertTriangle className="text-red-500" /> Histórico de Erros
          </h1>
          <p className="text-slate-400 mt-1">Investigue falhas e exceções reportadas pelo backend, workers e frontends.</p>
        </div>
      </div>

      {/* Filters Form */}
      <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-white/5 rounded-3xl border border-white/5 items-end">
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Buscar Mensagem / Path</label>
          <div className="relative">
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pl-10 text-white text-sm outline-none"
              placeholder="Ex: NullPointerException..."
            />
            <Search className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Severidade</label>
          <select 
            value={severity}
            onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm outline-none"
          >
            <option value="">Todas</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Origem</label>
          <select 
            value={source}
            onChange={(e) => { setSource(e.target.value); setPage(1); }}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm outline-none"
          >
            <option value="">Todas</option>
            <option value="BACKEND">BACKEND</option>
            <option value="FRONTEND">FRONTEND</option>
            <option value="WORKER">WORKER</option>
            <option value="WEBHOOK">WEBHOOK</option>
            <option value="INTEGRATION">INTEGRATION</option>
          </select>
        </div>

        <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-black font-black italic rounded-xl py-3">
          Aplicar Filtros
        </Button>
      </form>

      {/* Main logs display */}
      {loading ? (
        <div className="p-20 text-center text-amber-500 font-bold italic animate-pulse">Carregando logs...</div>
      ) : logs.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/5 rounded-[32px] overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] text-slate-500 uppercase font-black tracking-widest">
                  <th className="p-4">Data</th>
                  <th className="p-4">Origem</th>
                  <th className="p-4">Severidade</th>
                  <th className="p-4">Path / Rota</th>
                  <th className="p-4">Mensagem</th>
                  <th className="p-4">Tenant</th>
                  <th className="p-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="p-4 font-mono text-xs text-slate-400">
                      {new Date(log.createdAt).toLocaleString("pt-BR")}
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-bold text-slate-300">{log.source}</span>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-black ${
                        log.severity === "CRITICAL" ? "bg-red-500/20 text-red-400" :
                        log.severity === "HIGH" ? "bg-orange-500/20 text-orange-400" :
                        log.severity === "MEDIUM" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-slate-500/20 text-slate-400"
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-300">
                      {log.method ? `${log.method} ` : ""}{log.path || "-"}
                    </td>
                    <td className="p-4 font-bold text-white truncate max-w-xs">{log.message}</td>
                    <td className="p-4 text-xs text-slate-400">{log.tenant?.name || "Global / Master"}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedLog(log)}
                        className="text-xs text-amber-400 font-bold hover:underline"
                      >
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
            <span>Total de {total} erros</span>
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
        <div className="p-16 text-center text-slate-500 italic">Nenhum log de erro localizado com os filtros selecionados.</div>
      )}

      {/* Details Stack Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[2000] flex items-center justify-center p-4">
          <div className="premium-glass p-8 rounded-[40px] border-white/5 max-w-3xl w-full space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{selectedLog.source}</span>
                <h3 className="text-xl font-black text-white italic mt-1">{selectedLog.message}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ocorrido em {new Date(selectedLog.createdAt).toLocaleString("pt-BR")}
                </p>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="text-xs bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-lg text-white"
              >
                Fechar
              </button>
            </div>

            {selectedLog.stack && (
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block flex items-center gap-1.5">
                  <Terminal size={12} /> Rastreamento de Stack (Stack Trace)
                </span>
                <pre className="bg-black/80 p-5 rounded-2xl border border-white/5 text-xs text-red-400 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
                  {selectedLog.stack}
                </pre>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6 text-xs border-t border-white/5 pt-4">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-black block">Caminho da Requisição</span>
                <span className="text-white font-mono">{selectedLog.method || "GET"} {selectedLog.path || "-"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-black block">Status HTTP</span>
                <span className="text-white">{selectedLog.statusCode || "500"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-black block">Tenant</span>
                <span className="text-white">{selectedLog.tenant?.name || "Global"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-black block">Usuário Autenticado</span>
                <span className="text-white">{selectedLog.user ? `${selectedLog.user.name} (${selectedLog.user.email})` : "Nenhum"}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
