import React, { useState, useEffect } from "react";
import { logger } from "@/utils/logger";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft, Building, MapPin, DollarSign } from "lucide-react";
import { useAuth } from "../../../auth/AuthContext";
import { api } from "../../../../api/client";
import { toast } from "react-hot-toast";
import { isAxiosError } from "axios";
import { z } from "zod";

const providerTypes = ["TOUR_GUIDE", "RESTAURANT", "HOTEL", "TRANSPORT", "EXPERIENCE"] as const;
type ProviderType = typeof providerTypes[number];

interface ServiceProviderFormData {
  name: string;
  type: ProviderType;
  description: string;
  phone: string;
  email: string;
  address: string;
  feePercentage: number;
  active: boolean;
}

interface ServiceProviderResponse extends Partial<ServiceProviderFormData> {
  id: string;
}

interface ApiErrorResponse {
  error?: string;
  message?: string;
}

const providerSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do parceiro."),
  type: z.enum(providerTypes),
  description: z.string().trim().optional().default(""),
  phone: z.string().trim().optional().default(""),
  email: z.string().trim().email("Informe um e-mail valido.").or(z.literal("")),
  address: z.string().trim().optional().default(""),
  feePercentage: z.number().min(0, "A taxa nao pode ser negativa.").max(100, "A taxa maxima permitida e 100%."),
  active: z.boolean()
});

function getApiErrorMessage(err: unknown, fallback: string) {
  if (isAxiosError<ApiErrorResponse>(err)) {
    return err.response?.data?.message || err.response?.data?.error || fallback;
  }
  return fallback;
}

const emptyProvider: ServiceProviderFormData = {
  name: "",
  type: "TOUR_GUIDE",
  description: "",
  phone: "",
  email: "",
  address: "",
  feePercentage: 10,
  active: true,
};

export const ServiceProviderForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { tenantSlug } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(false);
  const [formData, setFormData] = useState(emptyProvider);

  useEffect(() => {
    if (!id || id === "novo" || !tenantSlug) return;

    setLoadingProvider(true);
    api.get<ServiceProviderResponse>(`/roteiro/${tenantSlug}/providers/${id}`)
      .then(res => {
        const data = res.data || {};
        setFormData({
          name: data.name || "",
          type: providerTypes.includes(data.type as ProviderType) ? data.type as ProviderType : "TOUR_GUIDE",
          description: data.description || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          feePercentage: Number(data.feePercentage ?? 10),
          active: data.active ?? true,
        });
      })
      .catch((error: unknown) => {
        logger.error("Error fetching service provider", error);
        toast.error(getApiErrorMessage(error, "Erro ao carregar parceiro."));
      })
      .finally(() => setLoadingProvider(false));
  }, [id, tenantSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantSlug) {
      toast.error("Tenant nao identificado.");
      return;
    }

    const validation = providerSchema.safeParse(formData);
    if (!validation.success) {
      toast.error(validation.error.issues[0]?.message || "Revise os dados do parceiro.");
      return;
    }

    setLoading(true);
    try {
      if (id === "novo") {
        await api.post<ServiceProviderResponse>(`/roteiro/${tenantSlug}/providers`, validation.data);
      } else {
        await api.put<ServiceProviderResponse>(`/roteiro/${tenantSlug}/providers/${id}`, validation.data);
      }
      toast.success("Parceiro salvo com sucesso.");
      navigate("/admin/parceiros-roteiro");
    } catch (error: unknown) {
      logger.error("Error saving service provider", error);
      toast.error(getApiErrorMessage(error, "Erro ao salvar parceiro."));
    } finally {
      setLoading(false);
    }
  };

  if (loadingProvider) {
    return <div className="p-6 max-w-4xl mx-auto text-gray-500">Carregando parceiro...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {id === "novo" ? "Cadastrar Novo Parceiro" : "Editar Parceiro"}
          </h1>
          <p className="text-gray-500">Adicione restaurantes, guias ou hoteis ao Roteiro Cultural.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700 p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
            <Building size={20} className="text-amber-500" /> Identificacao e Detalhes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Estabelecimento / Profissional</label>
              <input type="text" required className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Servico</label>
              <select className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as ProviderType })}>
                <option value="TOUR_GUIDE">Guia Turistico</option>
                <option value="RESTAURANT">Restaurante / Gastronomia</option>
                <option value="HOTEL">Hospedagem</option>
                <option value="TRANSPORT">Transporte</option>
                <option value="EXPERIENCE">Experiencia (Oficina, Passeio)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descricao Comercial</label>
              <textarea rows={3} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
            <MapPin size={20} className="text-amber-500" /> Contato e Localizacao
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone / WhatsApp</label>
              <input type="text" className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endereco Fisico (se aplicavel)</label>
              <input type="text" className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
            <DollarSign size={20} className="text-amber-500" /> Configuracao Financeira
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Taxa da Plataforma (%)</label>
              <input type="number" min="0" max="100" className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" value={formData.feePercentage} onChange={e => {
                const value = Number(e.target.value);
                setFormData({ ...formData, feePercentage: Number.isFinite(value) ? value : 0 });
              }} />
              <p className="text-xs text-gray-500 mt-1">Essa taxa sera retida nas vendas geradas via app para este parceiro.</p>
            </div>
            <div className="flex items-center h-full pt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Parceiro Ativo no Aplicativo</span>
              </label>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-lg font-medium text-white bg-amber-500 hover:bg-amber-600 transition-colors flex items-center gap-2">
            {loading ? "Salvando..." : <><Save size={20} /> Salvar Parceiro</>}
          </button>
        </div>
      </form>
    </div>
  );
};
