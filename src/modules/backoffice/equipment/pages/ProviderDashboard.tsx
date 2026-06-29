import React, { useState, useEffect } from 'react';
import { logger } from "@/utils/logger";

import { useAuth } from '../../../auth/AuthContext';
import { api } from '../../../../api/client';
import { DollarSign, Star, Package, MapPin, ExternalLink, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export const ProviderDashboard: React.FC = () => {
  const { tenantSlug, user } = useAuth();
  const [stats, setStats] = useState<unknown>(null);
  const [loadingStripe, setLoadingStripe] = useState(false);

  // In a real scenario, the logged-in user would have a providerId linked.
  // For demo, we assume the providerId is 'provider-123'
  const providerId = 'provider-123'; 

  useEffect(() => {
    if (tenantSlug) {
      api.get(`/${tenantSlug}/provider/dashboard?providerId=${providerId}`)
        .then(res => setStats(res.data))
        .catch(console.error);
    }
  }, [tenantSlug]);

  const handleStripeConnect = async () => {
    setLoadingStripe(true);
    try {
      const response = await api.post(`/${tenantSlug}/provider/stripe/onboard`, { providerId });
      // Redirect to Stripe Connect URL
      window.location.href = response.data.url;
    } catch (error) {
      logger.error(error);
      setLoadingStripe(false);
    }
  };

  if (!stats) return <div className="p-8 text-center">Carregando painel do parceiro...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meu Negócio</h1>
          <p className="text-gray-500">Acompanhe suas vendas, avaliações e fluxo de turistas.</p>
        </div>
        {!stats.stripeAccountId ? (
          <button 
            onClick={handleStripeConnect}
            disabled={loadingStripe}
            className="bg-[#635BFF] hover:bg-[#4B44E6] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors"
          >
            <DollarSign size={20} />
            {loadingStripe ? 'Conectando...' : 'Conectar Conta Bancária'}
          </button>
        ) : (
          <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
            <DollarSign size={18} /> Recebimentos Ativos
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div whileHover={{ y: -5 }} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="text-gray-500 mb-2 flex items-center justify-between">
            Faturamento
            <DollarSign size={20} className="text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            R$ {stats.totalRevenue.toFixed(2)}
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="text-gray-500 mb-2 flex items-center justify-between">
            Avaliação Média
            <Star size={20} className="text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.averageRating} <span className="text-sm text-gray-400 font-normal">({stats.totalReviews} reviews)</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="text-gray-500 mb-2 flex items-center justify-between">
            Produtos Ativos
            <Package size={20} className="text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.activeProducts}
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="text-gray-500 mb-2 flex items-center justify-between">
            Fluxo Hoje (Heatmap)
            <Activity size={20} className="text-red-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.viewsToday} <span className="text-sm text-gray-400 font-normal">turistas perto</span>
          </div>
        </motion.div>
      </div>

      {/* Promo Banner B2B */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl p-8 text-white flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Aumente suas vendas com Pacotes!</h2>
          <p className="text-indigo-200 max-w-2xl">
            Junte-se a outros guias ou restaurantes locais para oferecer um "Combo Histórico". O sistema divide o pagamento automaticamente.
          </p>
        </div>
        <button className="bg-white text-indigo-900 px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-gray-50 transition-colors">
          Criar Pacote B2B
        </button>
      </div>
    </div>
  );
};
