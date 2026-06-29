import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../../auth/AuthContext';
import { api } from '../../../../api/client';
import { useNavigate } from 'react-router-dom';

export const ServiceProvidersManagement: React.FC = () => {
  const { tenantSlug } = useAuth();
  const navigate = useNavigate();
  const [providers, setProviders] = useState<any[]>([]);

  useEffect(() => {
    if (tenantSlug) {
      api.get(`/${tenantSlug}/providers`).then(res => {
        setProviders(res.data);
      }).catch(console.error);
    }
  }, [tenantSlug]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Parceiros Locais</h1>
          <p className="text-gray-500">Gerencie guias, restaurantes e hotéis do Roteiro Cultural.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/parceiros-roteiro/novo')}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} /> Novo Parceiro
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Nome</th>
              <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Tipo</th>
              <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">KYC Verificado</th>
              <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
              <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {providers.map(provider => (
              <tr key={provider.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="p-4 text-gray-900 dark:text-white font-medium">{provider.name}</td>
                <td className="p-4">
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-semibold">
                    {provider.type}
                  </span>
                </td>
                <td className="p-4">
                  {provider.verified ? (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400"><CheckCircle size={16} /> Aprovado</span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400"><XCircle size={16} /> Pendente</span>
                  )}
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${provider.active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {provider.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="p-4 flex justify-end gap-2">
                  <button className="p-2 text-gray-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors">
                    <Edit size={18} />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {providers.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">Nenhum parceiro cadastrado ainda.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
