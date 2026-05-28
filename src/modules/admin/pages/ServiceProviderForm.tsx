import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Save, ArrowLeft, Building, MapPin, Phone, DollarSign } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../../api/client';

export const ServiceProviderForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { tenantSlug } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'TOUR_GUIDE',
    description: '',
    phone: '',
    email: '',
    address: '',
    feePercentage: 10,
    active: true,
  });

  useEffect(() => {
    if (id && id !== 'novo') {
      // Simulate fetching existing provider
      setFormData({
        name: 'Maria Guia Turística',
        type: 'TOUR_GUIDE',
        description: 'Guia bilíngue especializada no centro histórico.',
        phone: '+55 31 99999-9999',
        email: 'maria@guia.com',
        address: 'Praça da Liberdade, S/N',
        feePercentage: 15,
        active: true,
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id === 'novo') {
        await api.post(`/${tenantSlug}/providers`, formData);
      } else {
        await api.put(`/${tenantSlug}/providers/${id}`, formData);
      }
      setLoading(false);
      navigate(`/admin/parceiros-roteiro`);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {id === 'novo' ? 'Cadastrar Novo Parceiro' : 'Editar Parceiro'}
          </h1>
          <p className="text-gray-500">Adicione restaurantes, guias ou hotéis ao Roteiro Cultural.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700 p-6 space-y-6">
        
        {/* Identificação */}
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
            <Building size={20} className="text-amber-500" /> Identificação e Detalhes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Estabelecimento / Profissional</label>
              <input
                type="text"
                required
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Serviço</label>
              <select
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="TOUR_GUIDE">Guia Turístico</option>
                <option value="RESTAURANT">Restaurante / Gastronomia</option>
                <option value="HOTEL">Hospedagem</option>
                <option value="TRANSPORT">Transporte</option>
                <option value="EXPERIENCE">Experiência (Oficina, Passeio)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição Comercial</label>
              <textarea
                rows={3}
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Contato & Localização */}
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
            <MapPin size={20} className="text-amber-500" /> Contato e Localização
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endereço Físico (se aplicável)</label>
              <input
                type="text"
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Financeiro */}
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
            <DollarSign size={20} className="text-amber-500" /> Configuração Financeira
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Taxa da Plataforma (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                value={formData.feePercentage}
                onChange={e => setFormData({ ...formData, feePercentage: parseFloat(e.target.value) })}
              />
              <p className="text-xs text-gray-500 mt-1">Essa taxa será retida nas vendas geradas via app para este parceiro.</p>
            </div>
            
            <div className="flex items-center h-full pt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                  checked={formData.active}
                  onChange={e => setFormData({ ...formData, active: e.target.checked })}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Parceiro Ativo no Aplicativo</span>
              </label>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg font-medium text-white bg-amber-500 hover:bg-amber-600 transition-colors flex items-center gap-2"
          >
            {loading ? 'Salvando...' : <><Save size={20} /> Salvar Parceiro</>}
          </button>
        </div>
      </form>
    </div>
  );
};
