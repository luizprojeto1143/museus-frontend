import React, { useState, useEffect } from 'react';
import { api } from '../../../api/client';
import { useAuth } from '../../../modules/auth/AuthContext';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { DollarSign, TrendingUp, CreditCard, ShoppingBag, Heart, Ticket, Loader2, ArrowUpRight, PieChart as PieChartIcon } from 'lucide-react';
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

// Premium dark mode colors for charts
const COLORS = ['#d4af37', '#10b981', '#3b82f6', '#a855f7'];

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
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const [year, month, day] = parts;
            return `${day}/${month}`;
        }
        return dateStr;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-zinc-500 font-medium">Calculando receitas consolidadas...</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="admin-finance p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-fadeIn pb-24">

            {/* Header section matching premium style */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 flex items-center gap-3">
                        <DollarSign className="text-gold" size={32} />
                        Dashboard Financeiro
                    </h1>
                    <p className="text-zinc-400 text-sm font-medium mt-1">
                        Visão consolidada das receitas processadas localmente e via Asaas.
                    </p>
                </div>
                <div className="bg-gold/10 border border-gold/20 px-4 py-2 rounded-xl text-gold text-sm font-bold flex items-center gap-2 shadow-md shadow-black/20 shadow-gold/5 backdrop-blur-sm">
                    <TrendingUp size={16} />
                    <span>Liquidação D+1</span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors rounded-3xl p-6 border border-white/5 flex flex-col justify-center">
                    <div className="text-zinc-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2 mb-3">
                        <CreditCard size={16} className="text-zinc-500" /> Receita Bruta
                    </div>
                    <div className="text-3xl font-black text-white">{formatCurrency(data.summary.grossTotal)}</div>
                    <p className="text-[11px] text-zinc-500 mt-2 font-medium">Soma de todas as vendas e doações</p>
                </div>

                <div className="bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors rounded-3xl p-6 border border-white/5 flex flex-col justify-center">
                    <div className="text-rose-500/80 font-bold text-xs uppercase tracking-wider flex items-center gap-2 mb-3">
                        Taxa da Plataforma (5%)
                    </div>
                    <div className="text-3xl font-black text-rose-500">-{formatCurrency(data.summary.platformFee)}</div>
                    <p className="text-[11px] text-zinc-500 mt-2 font-medium">Retida automaticamente no split</p>
                </div>

                <div className="bg-gradient-to-br from-gold/10 to-transparent rounded-3xl p-6 shadow-lg shadow-gold/5 border border-gold/20 flex flex-col justify-center md:col-span-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 text-gold group-hover:scale-110 group-hover:opacity-10 transition-all duration-500">
                        <DollarSign size={100} />
                    </div>
                    <div className="text-gold/80 font-bold text-xs uppercase tracking-wider flex items-center gap-2 mb-3 relative z-10">
                        Receita Líquida Estimada (Museu)
                    </div>
                    <div className="text-5xl font-black text-gold relative z-10 drop-shadow-md">
                        {formatCurrency(data.summary.netTotal)}
                    </div>
                    <div className="text-[11px] font-bold text-gold/70 mt-3 relative z-10 flex items-center gap-2 uppercase tracking-wide">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
                        </span>
                        Repassado para sua Asaas Wallet
                    </div>
                </div>
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gráfico Origem Receita */}
                <div className="bg-zinc-900/40 rounded-3xl p-6 border border-white/5">
                    <h2 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-4 flex items-center justify-between">
                        <span>Distribuição</span>
                        <PieChartIcon size={18} className="text-zinc-500" />
                    </h2>

                    {data.distribution.length > 0 ? (
                        <div className="h-[280px] w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.distribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={95}
                                        paddingAngle={5}
                                        stroke="none"
                                        dataKey="value"
                                    >
                                        {data.distribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        formatter={(value: any) => formatCurrency(Number(value))}
                                        contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.95)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: '#a1a1aa', fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[280px] flex items-center justify-center text-zinc-500 text-center flex-col gap-3">
                            <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center">
                                <CreditCard size={28} className="opacity-50" />
                            </div>
                            <p className="font-medium text-sm">Nenhuma receita registrada.</p>
                        </div>
                    )}

                    <div className="mt-6 grid grid-cols-3 gap-3">
                        <div className="bg-zinc-900/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-white/5 hover:border-gold/30 transition-colors cursor-default">
                            <ShoppingBag size={20} className="text-gold mb-2" />
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Loja</span>
                        </div>
                        <div className="bg-zinc-900/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-white/5 hover:border-emerald-500/30 transition-colors cursor-default">
                            <Heart size={20} className="text-emerald-500 mb-2" />
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Doações</span>
                        </div>
                        <div className="bg-zinc-900/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-white/5 hover:border-blue-500/30 transition-colors cursor-default">
                            <Ticket size={20} className="text-blue-500 mb-2" />
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Ingressos</span>
                        </div>
                    </div>
                </div>

                {/* Gráfico 7 Dias */}
                <div className="bg-zinc-900/40 rounded-3xl p-6 border border-white/5 lg:col-span-2 flex flex-col">
                    <h2 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-4 flex items-center justify-between">
                        <span>Receita Diária (Últimos 7 dias)</span>
                        <ArrowUpRight size={18} className="text-zinc-500" />
                    </h2>
                    <div className="flex-1 w-full min-h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.dailyRevenue} margin={{ top: 20, right: 20, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={formatDate}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#71717a', fontSize: 12, fontWeight: 500 }}
                                    dy={15}
                                />
                                <YAxis
                                    tickFormatter={(val: any) => `R$${val}`}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#71717a', fontSize: 12, fontWeight: 500 }}
                                    dx={-10}
                                />
                                <RechartsTooltip
                                    formatter={(value: any) => formatCurrency(Number(value))}
                                    labelFormatter={(label: any) => `Data: ${formatDate(label)}`}
                                    contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.95)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                                    itemStyle={{ color: '#fff', fontWeight: 600 }}
                                    labelStyle={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px', fontWeight: 500 }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', color: '#a1a1aa', fontSize: '12px' }} />
                                <Line
                                    type="monotone"
                                    name="Loja"
                                    dataKey="loja"
                                    stroke="#d4af37"
                                    strokeWidth={3}
                                    dot={{ r: 4, strokeWidth: 2, fill: '#18181b', stroke: '#d4af37' }}
                                    activeDot={{ r: 6, fill: '#d4af37', stroke: '#fff', strokeWidth: 2 }}
                                />
                                <Line
                                    type="monotone"
                                    name="Doações"
                                    dataKey="doacoes"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ r: 4, strokeWidth: 2, fill: '#18181b', stroke: '#10b981' }}
                                    activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

        </div>
    );
};

