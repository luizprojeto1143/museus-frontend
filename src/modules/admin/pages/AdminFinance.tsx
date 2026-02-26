import React, { useState, useEffect } from 'react';
import { api } from '../../../api/client';
import { useAuth } from '../../../modules/auth/AuthContext';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { DollarSign, TrendingUp, CreditCard, ShoppingBag, Heart, Ticket, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface FinanceSummary {
    grossTotal: number;
    platformFee: number;
    netTotal: number;
    totalTransactions: number;
}

interface DistributionItem {
    name: string;
    value: number;
}

interface DailyRevenue {
    date: string;
    loja: number;
    doacoes: number;
}

interface FinanceData {
    summary: FinanceSummary;
    distribution: DistributionItem[];
    dailyRevenue: DailyRevenue[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export const AdminFinance: React.FC = () => {
    const { tenantId } = useAuth();
    const [data, setData] = useState<FinanceData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (tenantId) {
            fetchData();
        }
    }, [tenantId]);

    const fetchData = async () => {
        try {
            const res = await api.get('/finance/dashboard');
            setData(res.data);
        } catch (error) {
            console.error('Error fetching finance data:', error);
            toast.error('Erro ao buscar dados financeiros.');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}`;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20">
                <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
                <p className="text-slate-500">Calculando receitas consolidadas...</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="admin-finance p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                        <DollarSign className="text-emerald-500" size={32} />
                        Dashboard Financeiro
                    </h1>
                    <p className="text-slate-500 mt-1">Visão consolidada das receitas processadas via Asaas.</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl text-indigo-800 text-sm font-medium flex items-center gap-2 shadow-sm">
                    <TrendingUp size={16} />
                    <span>Liquidação D+1</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-center">
                    <div className="text-slate-500 font-medium text-sm flex items-center gap-2 mb-2">
                        <CreditCard size={18} /> Receita Bruta
                    </div>
                    <div className="text-3xl font-black text-slate-800">{formatCurrency(data.summary.grossTotal)}</div>
                    <p className="text-xs text-slate-400 mt-2">Soma de todas as vendas e doações</p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-center">
                    <div className="text-rose-500 font-medium text-sm flex items-center gap-2 mb-2">
                        Taxa da Plataforma (5%)
                    </div>
                    <div className="text-3xl font-black text-rose-600">-{formatCurrency(data.summary.platformFee)}</div>
                    <p className="text-xs text-slate-400 mt-2">Retida automaticamente no split</p>
                </div>

                <div className="bg-emerald-50 rounded-3xl p-6 shadow-sm border border-emerald-200 flex flex-col justify-center md:col-span-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10 text-emerald-600">
                        <DollarSign size={80} />
                    </div>
                    <div className="text-emerald-700 font-medium text-sm flex items-center gap-2 mb-2 relative z-10">
                        Receita Líquida Estimada (Museu)
                    </div>
                    <div className="text-5xl font-black text-emerald-600 relative z-10">{formatCurrency(data.summary.netTotal)}</div>
                    <p className="text-sm font-medium text-emerald-800 mt-2 relative z-10 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Repassado para sua Asaas Wallet
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Gráfico Origem Receita */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Distribuição de Receita</h2>

                    {data.distribution.length > 0 ? (
                        <div className="h-[300px] w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.distribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.distribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-slate-400 text-center flex-col gap-2">
                            <CreditCard size={40} className="opacity-50" />
                            <p>Nenhuma receita registrada ainda.</p>
                        </div>
                    )}

                    <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="bg-slate-50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                            <ShoppingBag size={20} className="text-indigo-500 mb-1" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Loja</span>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                            <Heart size={20} className="text-emerald-500 mb-1" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Doações</span>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                            <Ticket size={20} className="text-amber-500 mb-1" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Ingressos</span>
                        </div>
                    </div>
                </div>

                {/* Gráfico 7 Dias */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 lg:col-span-2">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Receita Diária (Últimos 7 dias)</h2>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.dailyRevenue} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="date" tickFormatter={formatDate} axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
                                <YAxis tickFormatter={(val) => `R$${val}`} axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dx={-10} />
                                <RechartsTooltip
                                    formatter={(value: number) => formatCurrency(value)}
                                    labelFormatter={(label) => `Data: ${formatDate(label)}`}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                <Line type="monotone" name="Loja" dataKey="loja" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" name="Doações" dataKey="doacoes" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

        </div>
    );
};
