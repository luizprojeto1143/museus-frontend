import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/AuthContext';
import { api } from '../../../../api/client';
import { Globe, TrendingUp, Users, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

type EcosystemActivity = {
  text: string;
  time: string;
};

type EcosystemStats = {
  ecosystemVolume: number;
  platformRevenue: number;
  totalProviders: number;
  totalPassports: number;
  recentActivity?: EcosystemActivity[];
};

export const MasterEcosystemDashboard: React.FC = () => {
  const { tenantSlug } = useAuth();
  const [stats, setStats] = useState<EcosystemStats | null>(null);

  useEffect(() => {
    if (tenantSlug) {
      api.get<EcosystemStats>(`/${tenantSlug}/master-ecosystem/stats`)
        .then(res => setStats(res.data))
        .catch(console.error);
    }
  }, [tenantSlug]);

  if (!stats) return <div className="p-8 text-center">Carregando painel master do ecossistema...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-red-500">
            Controle do Ecossistema Cultural
          </h1>
          <p className="text-gray-500 text-lg mt-1">Visão macro de tudo que está acontecendo na cidade/museu.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-500 font-medium">Volume Transacionado (PIB)</h3>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg"><TrendingUp size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">R$ {(stats.ecosystemVolume).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-500 font-medium">Receita da Plataforma (10%)</h3>
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg"><ShieldCheck size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">R$ {(stats.platformRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-500 font-medium">Parceiros Conectados</h3>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg"><Globe size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalProviders}</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-500 font-medium">Turistas com Passaporte</h3>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg"><Users size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalPassports}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Atividade em Tempo Real</h2>
          <div className="space-y-4">
            {(stats.recentActivity || []).length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma atividade recente reportada pelo backend.</p>
            ) : (stats.recentActivity || []).map((act, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                <div className="w-2 h-2 mt-2 rounded-full bg-amber-500 animate-pulse"></div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">{act.text}</p>
                  <p className="text-sm text-gray-500">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
