import React, { useState, useEffect } from "react";
import { api } from "../../../../api/client";
import { toast } from "react-hot-toast";
import { Award, CheckCircle, XCircle, FileText, Landmark, ShieldCheck } from "lucide-react";
import { Button } from "../../../../components/ui";

interface Contract {
  id: string;
  sponsorName: string;
  sponsorCNPJ: string;
  sponsorEmail: string;
  status: string;
  monthlyAmount: string;
  opportunity: {
    title: string;
    targetType: string;
  };
  assets: Array<{
    id: string;
    type: string;
    url: string;
    status: string;
  }>;
}

export const AdminSponsorships: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewingAsset, setReviewingAsset] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actioning, setActioning] = useState(false);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/sponsor-portal/admin/list");
      setContracts(res.data);
    } catch (err) {
      toast.error("Erro ao carregar contratos.");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (assetId: string, status: "APPROVED" | "REJECTED") => {
    if (status === "REJECTED" && !rejectionReason) {
      toast.error("Por favor, informe a justificativa da rejeição.");
      return;
    }

    setActioning(true);
    try {
      await api.post(`/municipal/sponsorship-assets/${assetId}/review`, {
        status,
        rejectionReason: status === "REJECTED" ? rejectionReason : undefined
      });
      toast.success(status === "APPROVED" ? "Ativo de marca aprovado!" : "Ativo rejeitado.");
      setReviewingAsset(null);
      setRejectionReason("");
      fetchContracts();
    } catch (err) {
      toast.error("Erro ao revisar ativo.");
    } finally {
      setActioning(false);
    }
  };

  const handleIssueCertificate = async (contractId: string) => {
    try {
      await api.post(`/sponsor-portal/contracts/${contractId}/issue-certificate`, {
        title: "Certificado de Reconhecimento de Incentivo Cultural",
        description: "Reconhecimento oficial de incentivo aos projetos e espaços culturais locais."
      });
      toast.success("Certificado emitido e registrado no livro oficial da prefeitura!");
      fetchContracts();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erro ao emitir certificado.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black text-white italic tracking-tight">Gestão de Patrocínios (Equipamento)</h1>
        <p className="text-slate-400 mt-1">Acompanhe contratos de fomento, aprove logotipos de patrocinadores e emita certificados.</p>
      </div>

      {loading ? (
        <div className="p-20 text-center animate-pulse text-amber-500 font-bold italic">Carregando painel de patrocínios...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {contracts.length > 0 ? (
            contracts.map(contract => (
              <div key={contract.id} className="p-6 rounded-[32px] bg-white/5 border border-white/5 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2.5 py-1 rounded-full uppercase font-black tracking-wider mb-2 inline-block">
                      {contract.opportunity.targetType}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1">{contract.sponsorName}</h3>
                    <p className="text-xs text-slate-400 mt-1">Cota: {contract.opportunity.title} | E-mail: {contract.sponsorEmail}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-3 py-1.5 rounded-xl font-bold ${contract.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {contract.status}
                    </span>
                    {contract.status === 'ACTIVE' && (
                      <Button
                        onClick={() => handleIssueCertificate(contract.id)}
                        className="bg-amber-500 hover:bg-amber-600 text-black font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
                      >
                        <Award size={14} /> Emitir Certificado
                      </Button>
                    )}
                  </div>
                </div>

                {contract.assets && contract.assets.length > 0 && (
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Ativos Enviados para Aprovação</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {contract.assets.map(asset => (
                        <div key={asset.id} className="p-4 bg-black/40 rounded-2xl border border-white/5 flex justify-between items-center">
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-500 font-bold uppercase">{asset.type}</span>
                            <a href={asset.url} target="_blank" rel="noreferrer" className="text-xs text-amber-400 font-bold block hover:underline">
                              Visualizar Arquivo
                            </a>
                          </div>
                          {asset.status === 'PENDING' ? (
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleReview(asset.id, "APPROVED")}
                                className="p-2 bg-green-500/20 hover:bg-green-500/35 text-green-400 rounded-xl"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button 
                                onClick={() => setReviewingAsset(asset)}
                                className="p-2 bg-red-500/20 hover:bg-red-500/35 text-red-400 rounded-xl"
                              >
                                <XCircle size={16} />
                              </button>
                            </div>
                          ) : (
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${asset.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {asset.status}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-slate-500 italic font-bold">Nenhum contrato de patrocínio registrado.</div>
          )}
        </div>
      )}

      {/* Rejection Modal */}
      {reviewingAsset && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="premium-glass p-8 rounded-[40px] border-white/5 max-w-md w-full space-y-6">
            <h3 className="text-xl font-black text-white italic">Rejeitar Ativo de Marca</h3>
            <p className="text-slate-400 text-xs">Informe a justificativa ou correção necessária para o patrocinador ajustar.</p>
            
            <textarea
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-red-500 outline-none h-28 resize-none"
              placeholder="Ex: Resolução baixa ou formato incorreto..."
            />

            <div className="flex gap-4">
              <Button onClick={() => setReviewingAsset(null)} className="flex-1 bg-white/10 hover:bg-white/15 text-white font-bold py-3 rounded-2xl">Cancelar</Button>
              <Button onClick={() => handleReview(reviewingAsset.id, "REJECTED")} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-2xl">Confirmar Rejeição</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
