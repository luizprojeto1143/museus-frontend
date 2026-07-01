import React, { useState, useEffect } from "react";
import { api } from "../../../../api/client";
import { toast } from "react-hot-toast";
import { Handshake, Landmark, FileText, CheckCircle } from "lucide-react";
import { Button } from "../../../../components/ui";

interface Opportunity {
  id: string;
  title: string;
  description: string;
  targetType: string;
  targetId: string | null;
  quotaLimit: number;
  price: string;
  currency: string;
  startsAt: string | null;
  endsAt: string | null;
}

export const SponsorOpportunities: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);

  // Form states
  const [sponsorName, setSponsorName] = useState("");
  const [sponsorCNPJ, setSponsorCNPJ] = useState("");
  const [sponsorEmail, setSponsorEmail] = useState("");
  const [sponsorWebsite, setSponsorWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await api.get("/sponsor-portal/opportunities");
      setOpportunities(res.data);
    } catch (err) {
      toast.error("Erro ao carregar oportunidades de patrocínio");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp) return;

    if (!sponsorName || !sponsorCNPJ || !sponsorEmail) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/sponsor-portal/opportunities/${selectedOpp.id}/apply`, {
        sponsorName,
        sponsorCNPJ,
        sponsorEmail,
        sponsorWebsite
      });

      if (res.data.checkoutUrl) {
        toast.success("Redirecionando para o pagamento seguro...");
        window.location.href = res.data.checkoutUrl;
      } else {
        toast.error("Não foi possível gerar a sessão de checkout.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erro ao solicitar patrocínio.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black text-white italic tracking-tight">Oportunidades de Patrocínio</h1>
        <p className="text-slate-400 mt-1">Selecione projetos, editais ou ações culturais da cidade para apoiar.</p>
      </div>

      {loading ? (
        <div className="p-20 text-center animate-pulse text-amber-500 font-bold italic">Buscando cotas de patrocínio...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {opportunities.length > 0 ? (
              opportunities.map((opp) => (
                <div 
                  key={opp.id} 
                  className={`p-6 rounded-[32px] bg-white/5 border transition-all cursor-pointer flex flex-col justify-between gap-4 ${selectedOpp?.id === opp.id ? 'border-amber-500 bg-white/10' : 'border-white/5 hover:bg-white/10'}`}
                  onClick={() => setSelectedOpp(opp)}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2.5 py-1 rounded-full uppercase font-black tracking-wider mb-2 inline-block">
                        {opp.targetType}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-1">{opp.title}</h3>
                      <p className="text-sm text-slate-400 mt-2 line-clamp-3">{opp.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider">Investimento</span>
                      <span className="text-2xl font-black text-white italic">
                        {opp.currency} {Number(opp.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-1">Cota Limite: {opp.quotaLimit}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-slate-500 italic font-bold">Nenhuma oportunidade ativa no momento.</div>
            )}
          </div>

          <div>
            {selectedOpp ? (
              <div className="premium-glass p-8 rounded-[40px] border-white/5 space-y-6">
                <div>
                  <h3 className="text-lg font-black text-white italic flex items-center gap-2">
                    <Handshake size={20} className="text-amber-500" /> Detalhes do Apoio
                  </h3>
                  <p className="text-xs text-slate-400 mt-2">Preencha os dados da marca patrocinadora.</p>
                </div>

                <form onSubmit={handleApply} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Nome Fantasia (Marca) *</label>
                    <input 
                      type="text" 
                      required
                      value={sponsorName}
                      onChange={(e) => setSponsorName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-amber-500"
                      placeholder="Ex: Banco da Cidade"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">CNPJ *</label>
                    <input 
                      type="text" 
                      required
                      value={sponsorCNPJ}
                      onChange={(e) => setSponsorCNPJ(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-amber-500"
                      placeholder="00.000.000/0001-00"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">E-mail para Faturamento *</label>
                    <input 
                      type="email" 
                      required
                      value={sponsorEmail}
                      onChange={(e) => setSponsorEmail(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-amber-500"
                      placeholder="financeiro@empresa.com"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Website Oficial (URL)</label>
                    <input 
                      type="url" 
                      value={sponsorWebsite}
                      onChange={(e) => setSponsorWebsite(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-amber-500"
                      placeholder="https://empresa.com"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black italic rounded-[20px] py-4 shadow-xl shadow-amber-500/20"
                  >
                    {submitting ? "Processando..." : "Confirmar e Ir para o Pagamento"}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="premium-glass p-8 rounded-[40px] border-white/5 text-center py-20 text-slate-500 italic">
                Selecione uma cota de patrocínio ao lado para iniciar.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
