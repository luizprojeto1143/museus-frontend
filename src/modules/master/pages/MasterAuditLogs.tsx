import React, { useState, useEffect } from "react";
import { api } from "../../../api/client";
import { toast } from "react-hot-toast";
import { FileText, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../components/ui";

interface AuditLog {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: any;
  createdAt: string;
  tenant: { name: string } | null;
  user: { name: string; email: string } | null;
}

export const MasterAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(15);

  // Filters
  const [action, setAction] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [page, action]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/master/monitoring/audit-logs", {
        params: {
          page,
          limit,
          action
        }
      });
      setLogs(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      toast.error("Erro ao carregar logs de auditoria.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black text-white italic tracking-tight flex items-center gap-3">
          <FileText className="text-amber-500" /> Registro de Auditoria
        </h1>
        <p className="text-slate-400 mt-1">Acompanhe as ações administrativas, autenticação e alterações de estado da plataforma.</p>
      </div>

      {/* Action Filter */}
      <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Filtrar Ação</label>
          <select 
            value={action}
            onChange={(e) => { setAction(e.target.value); setPage(1); }}
            className="bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm outline-none w-56"
          >
            <option value="">Todas</option>
            <option value="LOGIN">LOGIN</option>
            <option value="LOGIN_FAILED">LOGIN_FAILED</option>
            <option value="SWITCH_CONTEXT">SWITCH_CONTEXT</option>
            <option value="CREATE_TENANT">CREATE_TENANT</option>
            <option value="UPDATE_TENANT">UPDATE_TENANT</option>
            <option value="OPEN_BOX_OFFICE">OPEN_BOX_OFFICE</option>
            <option value="CLOSE_BOX_OFFICE">CLOSE_BOX_OFFICE</option>
            <option value="VALIDATE_TICKET">VALIDATE_TICKET</option>
            <option value="APPLY_SPONSORSHIP">APPLY_SPONSORSHIP</option>
            <option value="REVIEW_SPONSORSHIP_ASSET">REVIEW_SPONSORSHIP_ASSET</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-20 text-center text-amber-500 font-bold italic animate-pulse">Carregando auditoria...</div>
      ) : logs.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/5 rounded-[32px] overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] text-slate-500 uppercase font-black tracking-widest">
                  <th className="p-4">Data</th>
                  <th className="p-4">Ação</th>
                  <th className="p-4">Entidade</th>
                  <th className="p-4">ID da Entidade</th>
                  <th className="p-4">Usuário</th>
                  <th className="p-4">Tenant</th>
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
                      <span className="text-xs font-bold text-white">{log.action}</span>
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-300">
                      {log.entityType || "-"}
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-400">
                      {log.entityId || "-"}
                    </td>
                    <td className="p-4 text-xs">
                      {log.user ? (
                        <div>
                          <p className="text-slate-300 font-bold">{log.user.name}</p>
                          <p className="text-slate-500">{log.user.email}</p>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Sistema / Público</span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-slate-400">
                      {log.tenant?.name || "Global"}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedLog(log)}
                        className="text-xs text-amber-400 font-bold hover:underline"
                      >
                        Metadados
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
            <span>Total de {total} eventos auditados</span>
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
        <div className="p-16 text-center text-slate-500 italic">Nenhum evento registrado.</div>
      )}

      {/* Metadata modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[2000] flex items-center justify-center p-4">
          <div className="premium-glass p-8 rounded-[40px] border-white/5 max-w-lg w-full space-y-6">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{selectedLog.action}</span>
              <h3 className="text-xl font-black text-white italic mt-1">Metadados e Contexto</h3>
            </div>

            <pre className="bg-black/60 p-4 rounded-xl border border-white/5 text-xs text-amber-400 font-mono overflow-auto max-h-60 leading-relaxed whitespace-pre-wrap select-all">
              {JSON.stringify(selectedLog.metadata, null, 2)}
            </pre>

            <div className="space-y-2 text-xs border-t border-white/5 pt-4">
              <p><span className="text-slate-500">IP:</span> <span className="text-slate-300 font-mono">{selectedLog.ipAddress || "Indisponível"}</span></p>
              <p><span className="text-slate-500">User Agent:</span> <span className="text-slate-300">{selectedLog.userAgent || "Indisponível"}</span></p>
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
