import React, { useState } from "react";
import { 
    Gem, Users, TrendingUp, CreditCard, 
    Gift, Star, ArrowUpRight, Plus, 
    Search, Filter, CheckCircle2, ShieldCheck,
    Sparkles, Flame
} from "lucide-react";
import { motion } from "framer-motion";
import { Button, Input } from "../../../components/ui";

export const TheaterSubscriptions: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const plans = [
        { id: 1, name: "Amigo do Palco", price: 29.90, color: "text-blue-400", bg: "bg-blue-500/10", members: 124 },
        { id: 2, name: "Membro VIP", price: 89.90, color: "text-gold-500", bg: "bg-gold-500/10", members: 56 },
        { id: 3, name: "Patrono Pro", price: 199.90, color: "text-red-500", bg: "bg-red-500/10", members: 12 },
    ];

    const recentSubscribers = [
        { name: "Ana Beatriz", plan: "VIP", status: "ACTIVE", date: "Hoje" },
        { name: "Carlos Eduardo", plan: "Amigo", status: "ACTIVE", date: "Ontem" },
        { name: "Mariana S.", plan: "Patrono", status: "PENDING", date: "Ontem" },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20 px-4">
            {/* ═══ HEADER ═══════════ */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <span className="text-red-500 font-black text-[10px] uppercase tracking-[0.4em] mb-2 block italic">Recurring Revenue Engine</span>
                    <h1 className="text-5xl font-black text-white tracking-tighter italic">Clube do Teatro</h1>
                    <p className="text-slate-500 font-medium mt-2">Fidelize seu público e garanta receita recorrente para suas produções.</p>
                </div>
                <div className="flex gap-4">
                    <Button className="bg-white text-black px-10 py-7 rounded-3xl font-black italic shadow-2xl flex items-center gap-3">
                        <Plus size={20} /> Criar Novo Plano
                    </Button>
                </div>
            </div>

            {/* ═══ STATS GRID ═════════ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map(plan => (
                    <div key={plan.id} className="premium-glass p-8 rounded-[48px] border-white/5 relative overflow-hidden group">
                        <div className={`absolute -right-4 -top-4 w-24 h-24 ${plan.bg} rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`} />
                        <div className={`w-12 h-12 ${plan.bg} ${plan.color} rounded-2xl flex items-center justify-center mb-6`}>
                            <Gem size={24} />
                        </div>
                        <h3 className="text-xl font-black text-white italic">{plan.name}</h3>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">{plan.members} Membros Ativos</p>
                        <div className="mt-8 flex items-baseline gap-1">
                            <span className="text-3xl font-black text-white italic">R$ {plan.price.toFixed(2)}</span>
                            <span className="text-xs text-slate-500 font-bold">/mês</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ═══ MEMBERS LIST ═════════ */}
                <div className="lg:col-span-2 premium-glass p-10 rounded-[48px] border-white/5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
                        <h3 className="text-2xl font-black text-white italic flex items-center gap-3">
                            <Users className="text-red-500" /> Gestão de Membros
                        </h3>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={16} />
                            <Input className="bg-white/5 border-white/5 pl-12 py-5 rounded-2xl text-xs w-full sm:w-64" placeholder="Buscar assinante..." />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {recentSubscribers.map((sub, i) => (
                            <div key={i} className="flex items-center justify-between p-6 rounded-[32px] bg-white/5 border border-white/5 hover:border-red-500/20 transition-all cursor-pointer group">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-black flex items-center justify-center text-white font-black group-hover:scale-110 transition-transform">
                                        {sub.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-black text-sm">{sub.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{sub.date}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                                            <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">{sub.plan}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${sub.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gold-500/10 text-gold-400 border-gold-500/20'}`}>
                                        {sub.status}
                                    </div>
                                    <button className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-white transition-colors">
                                        <ArrowUpRight size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button variant="ghost" className="w-full mt-8 py-6 rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:text-white">Ver Todos os Assinantes</Button>
                </div>

                {/* ═══ INSIGHTS & RETENTION ═════════ */}
                <div className="space-y-6">
                    <div className="premium-glass p-8 rounded-[48px] border-emerald-500/20 bg-emerald-500/5">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                                <TrendingUp size={20} />
                            </div>
                            <h4 className="text-white font-black italic">Previsibilidade</h4>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed">
                            Suas assinaturas geram um MRR (Receita Mensal Recorrente) de <strong className="text-white text-lg block mt-1 italic">R$ 14.520,00</strong>
                        </p>
                    </div>

                    <div className="premium-glass p-8 rounded-[48px] border-blue-500/20 bg-blue-500/5">
                         <div className="flex items-center gap-3 mb-4 text-blue-400 font-black text-[10px] uppercase tracking-widest italic">
                            <Sparkles size={14} /> Recomendação IA
                         </div>
                         <p className="text-[11px] text-slate-400 leading-relaxed">
                            "Membros do plano <strong>Amigo do Palco</strong> têm uma taxa de churn 15% menor quando recebem cupons para a bomboniere. Recomendo criar um benefício automático."
                         </p>
                    </div>

                    <div className="premium-glass p-8 rounded-[48px] border-white/5 space-y-6">
                        <h4 className="text-xs font-black text-white italic">Benefícios Ativos</h4>
                        <div className="space-y-4">
                            {[
                                { label: "Meia Entrada Ilimitada", icon: <CheckCircle2 className="text-emerald-500" /> },
                                { label: "Pré-venda Exclusiva", icon: <CheckCircle2 className="text-emerald-500" /> },
                                { label: "Welcome Drink", icon: <Gift className="text-slate-500" /> },
                            ].map((b, i) => (
                                <div key={i} className="flex items-center gap-3 text-[11px] font-bold text-slate-400">
                                    <div className="scale-75">{b.icon}</div>
                                    {b.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
