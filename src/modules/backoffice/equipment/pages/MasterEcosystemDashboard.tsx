import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/AuthContext';
import { api } from '../../../../api/client';
import { Globe, TrendingUp, Users, Video, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const MasterEcosystemDashboard: React.FC = () => {
  const { tenantSlug } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (tenantSlug) {
      api.get(`/${tenantSlug}/master-ecosystem/stats`)
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Atividade Recente */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Atividade em Tempo Real</h2>
          <div className="space-y-4">
            {stats.recentActivity.map((act: any, i: number) => (
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

        {/* Moderação de Vídeos Rápida */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Video size={24} className="text-red-500" /> Moderação de Vídeos (Reviews)
            </h2>
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-bold">1 Pendente</span>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden relative">
            <div className="aspect-video bg-gray-900 flex items-center justify-center">
              <p className="text-gray-500">Player de Vídeo (TikTok/Reels format)</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Maria Guia Turística</p>
                <p className="text-sm text-gray-500">Enviado por: @turista_feliz (5 estrelas)</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-bold">Bloquear</button>
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-bold">Aprovar Vídeo</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
