import React, { useEffect, useState } from 'react';
import { DollarSign, Ticket, Users, TrendingUp } from 'lucide-react';
import { api } from '../../../api/client';

export const DashboardSalesWidget: React.FC = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        ticketsSold: 0,
        checkInCount: 0,
        conversionRate: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/analytics/sales-summary')
            .then(res => setStats(res.data))
            .catch(err => console.error("Failed to load sales stats", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-gray-500">Receita Total</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Ticket className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-gray-500">Ingressos Vendidos</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.ticketsSold}
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                        <Users className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-gray-500">Check-ins Feitos</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.checkInCount}
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-gray-500">Taxa de Presença</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.ticketsSold > 0 ? Math.round((stats.checkInCount / stats.ticketsSold) * 100) : 0}%
                </p>
            </div>
        </div>
    );
};
