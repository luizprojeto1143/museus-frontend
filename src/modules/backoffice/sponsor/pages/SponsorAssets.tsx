import React, { useState, useEffect } from "react";
import { api } from "../../../../api/client";
import { toast } from "react-hot-toast";
import { Building2, UploadCloud, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "../../../../components/ui";

interface Contract {
  id: string;
  sponsorName: string;
  status: string;
  opportunity: {
    title: string;
  };
}

interface Asset {
  id: string;
  type: string;
  url: string;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
}

export const SponsorAssets: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [loadingAssets, setLoadingAssets] = useState(false);

  // Asset Form
  const [assetType, setAssetType] = useState("LOGO");
  const [assetUrl, setAssetUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    setLoadingContracts(true);
    try {
      const res = await api.get("/sponsor-portal/my-sponsorships");
      setContracts(res.data);
      if (res.data.length > 0) {
        setSelectedContract(res.data[0]);
        fetchAssets(res.data[0].id);
      }
    } catch (err) {
      toast.error("Erro ao carregar contratos.");
    } finally {
      setLoadingContracts(false);
    }
  };

  const fetchAssets = async (contractId: string) => {
    setLoadingAssets(true);
    try {
      const res = await api.get(`/sponsor-portal/contracts/${contractId}/assets`);
      setAssets(res.data);
    } catch (err) {
      toast.error("Erro ao carregar arquivos da marca.");
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleContractChange = (contract: Contract) => {
    setSelectedContract(contract);
    fetchAssets(contract.id);
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract || !assetUrl) {
      toast.error("Preencha a URL do recurso.");
      return;
    }

    setUploading(true);
    try {
      await api.post(`/sponsor-portal/contracts/${selectedContract.id}/assets`, {
        type: assetType,
        url: assetUrl
      });
      toast.success("Arquivo enviado com sucesso para aprovação!");
      setAssetUrl("");
      fetchAssets(selectedContract.id);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erro ao enviar arquivo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black text-white italic tracking-tight">Meus Contratos & Marca</h1>
        <p className="text-slate-400 mt-1">Gerencie os logotipos e materiais promocionais exibidos nas obras e eventos patrocinados.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div>
          <div className="premium-glass p-6 rounded-[32px] border-white/5 space-y-4">
            <h3 className="text-lg font-bold text-white italic">Selecione o Contrato</h3>
            {loadingContracts ? (
              <div className="text-slate-500 animate-pulse font-bold">Carregando contratos...</div>
            ) : contracts.length > 0 ? (
              <div className="space-y-2">
                {contracts.map(c => (
                  <div
                    key={c.id}
                    onClick={() => handleContractChange(c)}
                    className={`p-4 rounded-2xl cursor-pointer border transition-all ${selectedContract?.id === c.id ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                  >
                    <h4 className="text-sm font-bold text-white">{c.opportunity?.title || 'Patrocínio'}</h4>
                    <span className="text-[10px] text-slate-500 uppercase font-black block mt-2">Status: {c.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500 text-sm italic">Nenhum contrato ativo.</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {selectedContract ? (
            <>
              {/* Asset list */}
              <div className="premium-glass p-8 rounded-[40px] border-white/5 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white italic">Marca e Documentação Vinculados</h3>
                  <span className="text-xs text-amber-400 font-bold uppercase">{selectedContract.opportunity?.title}</span>
                </div>

                {loadingAssets ? (
                  <div className="text-center py-6 text-slate-500 animate-pulse font-bold">Buscando arquivos...</div>
                ) : assets.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assets.map(asset => (
                      <div key={asset.id} className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-black text-slate-500 uppercase">{asset.type}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${asset.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' : asset.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {asset.status}
                          </span>
                        </div>
                        {asset.type === 'LOGO' && (
                          <div className="w-16 h-16 rounded-xl bg-white/5 overflow-hidden flex items-center justify-center">
                            <img src={asset.url} alt="Logo" className="max-w-full max-h-full object-contain" />
                          </div>
                        )}
                        <a href={asset.url} target="_blank" rel="noreferrer" className="text-xs text-amber-400 font-bold flex items-center gap-1 hover:underline">
                          Visualizar Arquivo <ExternalLink size={12} />
                        </a>
                        {asset.status === 'REJECTED' && asset.rejectionReason && (
                          <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[11px] text-red-400">
                            Motivo da Rejeição: {asset.rejectionReason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-500 italic">Nenhum logotipo ou documento enviado.</div>
                )}
              </div>

              {/* Upload new asset */}
              <div className="premium-glass p-8 rounded-[40px] border-white/5 space-y-6">
                <h3 className="text-lg font-bold text-white italic flex items-center gap-2">
                  <UploadCloud size={20} className="text-amber-500" /> Enviar Novo Item de Marca
                </h3>

                <form onSubmit={handleAddAsset} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Tipo de Item</label>
                    <select
                      value={assetType}
                      onChange={(e) => setAssetType(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm outline-none"
                    >
                      <option value="LOGO">Logotipo</option>
                      <option value="DOCUMENT">Documento / CNPJ</option>
                      <option value="BRAND_GUIDE">Manual da Marca</option>
                      <option value="RECEIPT">Comprovante</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 flex gap-4">
                    <div className="flex-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">URL da Imagem / Arquivo</label>
                      <input
                        type="url"
                        required
                        value={assetUrl}
                        onChange={(e) => setAssetUrl(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                        placeholder="https://exemplo.com/logo.png"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={uploading}
                      className="bg-amber-500 hover:bg-amber-600 text-black font-black italic rounded-xl px-6 h-[46px]"
                    >
                      {uploading ? "..." : "Enviar"}
                    </Button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="premium-glass p-12 rounded-[48px] border-white/5 text-center text-slate-500 italic py-24">
              Selecione ou adquira um contrato ativo para gerenciar ativos de marca.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
