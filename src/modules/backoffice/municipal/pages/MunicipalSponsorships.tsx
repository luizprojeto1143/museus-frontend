import React, { useState, useEffect } from "react";
import { api } from "../../../../api/client";
import { toast } from "react-hot-toast";
import { Award, CheckCircle, XCircle, Handshake, Plus, X } from "lucide-react";
import { Button } from "../../../../components/ui";

interface Opportunity {
  id: string;
  title: string;
  targetType: string;
  price: string;
  quotaLimit: number;
  isActive: boolean;
}

export const MunicipalSponsorships: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetType, setTargetType] = useState("CITY_PROGRAM");
  const [price, setPrice] = useState(500);
  const [quotaLimit, setQuotaLimit] = useState(3);
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
      toast.error("Erro ao carregar oportunidades de patrocínio.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/municipal/sponsorship-opportunities", {
        title,
        description,
        targetType,
        price: Number(price),
        quotaLimit: Number(quotaLimit)
      });
      toast.success("Oportunidade de patrocínio municipal criada!");
      setShowAddModal(false);
      setTitle("");
      setDescription("");
      setPrice(500);
      setQuotaLimit(3);
      fetchOpportunities();
    } catch (err) {
      toast.error("Erro ao criar oportunidade.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-white italic tracking-tight">Painel de Patrocínios Municipais</h1>
          <p className="text-slate-400 mt-1">Gerencie editais, campanhas culturais e crie novas cotas de fomento público.</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-black font-black flex items-center gap-2 rounded-2xl py-3 px-5"
        >
          <Plus size={18} /> Nova Oportunidade
        </Button>
      </div>

      {loading ? (
        <div className="p-20 text-center animate-pulse text-amber-500 font-bold italic">Carregando oportunidades...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.length > 0 ? (
            opportunities.map(opp => (
              <div key={opp.id} className="p-6 rounded-[32px] bg-white/5 border border-white/5 space-y-4">
                <div>
                  <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2.5 py-1 rounded-full uppercase font-black tracking-wider mb-2 inline-block">
                    {opp.targetType}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">{opp.title}</h3>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/5 text-sm text-slate-400">
                  <span>Valor: R$ {Number(opp.price).toLocaleString()}</span>
                  <span>Limite de Cotas: {opp.quotaLimit}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full p-10 text-center text-slate-500 italic font-bold">Nenhuma oportunidade ativa cadastrada.</div>
          )}
        </div>
      )}

      {/* Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="premium-glass p-8 rounded-[40px] border-white/5 max-w-lg w-full space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-white italic">Criar Oportunidade</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateOpportunity} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Título do Projeto / Campanha *</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-amber-500"
                  placeholder="Ex: Fomento de Natal 2026"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Descrição Detalhada *</label>
                <textarea 
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-amber-500 h-24 resize-none"
                  placeholder="Explicação da cota e visibilidade oferecida ao patrocinador..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Valor da Cota (R$) *</label>
                  <input 
                    type="number" 
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Limite de Cotistas</label>
                  <input 
                    type="number" 
                    required
                    value={quotaLimit}
                    onChange={(e) => setQuotaLimit(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Tipo de Meta</label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-amber-500"
                >
                  <option value="CITY_PROGRAM">Programa Geral da Cidade</option>
                  <option value="ACCESSIBILITY_ACTION">Ação de Acessibilidade</option>
                  <option value="NOTICE">Edital de Premiação</option>
                  <option value="EVENT">Grande Evento</option>
                </select>
              </div>

              <div className="flex gap-4 pt-2">
                <Button onClick={() => setShowAddModal(false)} className="flex-1 bg-white/10 hover:bg-white/15 text-white font-bold py-3.5 rounded-2xl">Cancelar</Button>
                <Button type="submit" disabled={submitting} className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-black italic py-3.5 rounded-2xl">
                  {submitting ? "Criando..." : "Criar Oportunidade"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
