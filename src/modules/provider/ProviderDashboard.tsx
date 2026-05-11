import React, { useState, useEffect } from "react";
import {
    MessageSquare,
    ArrowUpRight,
    Clock,
    DollarSign,
    CheckCircle,
    CreditCard,
    ShieldCheck,
    TrendingUp,
    Banknote,
    ExternalLink
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { api } from "../../api/client";
import { useNavigate } from "react-router-dom";

export const ProviderDashboard: React.FC = () => {
    const { name } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [onboardingLoading, setOnboardingLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, activitiesRes] = await Promise.all([
                    api.get("/providers/me/stats"),
                    api.get("/inbox")
                ]);
                setStats(statsRes.data);
                setActivities(activitiesRes.data.slice(0, 5));
            } catch (err) {
                console.error("Error fetching provider dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleStripeOnboarding = async () => {
        try {
            setOnboardingLoading(true);
            const { data } = await api.get("/stripe/onboarding-link");
            window.location.href = data.url;
        } catch (err) {
            console.error("Error generating onboarding link", err);
            alert("Erro ao conectar com o Stripe. Tente novamente.");
        } finally {
            setOnboardingLoading(false);
        }
    };

    const handleStripeDashboard = async () => {
        try {
            const { data } = await api.get("/stripe/dashboard-link");
            window.open(data.url, "_blank");
        } catch (err) {
            console.error("Error generating dashboard link", err);
        }
    };

    const statCards = [
        { label: "Orçamentos Pendentes", value: stats?.pendingQuotes ?? "0", icon: <Clock size={24} />, color: "text-orange-400", bg: "bg-orange-400/10" },
        { label: "Conversas Ativas", value: stats?.activeConversations ?? "0", icon: <MessageSquare size={24} />, color: "text-blue-400", bg: "bg-blue-400/10" },
        { label: "Serviços Concluídos", value: stats?.completedExecutions ?? "0", icon: <CheckCircle size={24} />, color: "text-green-400", bg: "bg-green-400/10" },
        { label: "Total de Execuções", value: stats?.totalExecutions ?? "0", icon: <DollarSign size={24} />, color: "text-purple-400", bg: "bg-purple-400/10" },
    ];

    if (loading) return (
        <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9f7aea]"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">
                        Olá, <span className="text-[#9f7aea]">{name?.split(" ")[0]}</span>!
                    </h1>
                    <p className="text-[#b794f4] mt-2 text-lg">
                        {stats?.pendingQuotes > 0 ? (
                            <>Você tem <span className="text-white font-bold">{stats.pendingQuotes} novas solicitações</span> aguardando resposta.</>
                        ) : (
                            "Sua agenda está em dia por enquanto."
                        )}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate("/provider/inbox")}
                        className="bg-[#9f7aea] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#805ad5] transition-all flex items-center gap-2 shadow-lg shadow-[#9f7aea]/20"
                    >
                        Ver Inbox <ArrowUpRight size={18} />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-[#1a0f2c] p-6 rounded-2xl border border-[#3b2164] shadow-xl hover:border-[#9f7aea]/50 transition-all group">
                        <div className="flex items-start justify-between">
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                                {stat.icon}
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="text-[2.5rem] font-black text-white leading-none">{stat.value}</div>
                            <div className="text-[#b794f4] font-medium mt-1">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activities */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Clock size={20} className="text-[#9f7aea]" /> Atividades Recentes
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {activities.length > 0 ? activities.map((conv, i) => (
                            <div
                                key={i}
                                onClick={() => navigate(`/provider/inbox?id=${conv.id}`)}
                                className="bg-black/20 p-5 rounded-2xl border border-[#3b2164] flex items-center justify-between group hover:bg-black/40 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#3b2164] rounded-full flex items-center justify-center text-[#9f7aea] font-bold">
                                        {conv.producer?.name?.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="text-white font-bold group-hover:text-[#9f7aea]">{conv.producer?.name}</div>
                                        <div className="text-[#b794f4] text-sm">
                                            {conv.messages?.[0]?.content?.slice(0, 60)}...
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <div className="text-xs text-[#b794f4]">
                                        {new Date(conv.lastMessageAt).toLocaleDateString()}
                                    </div>
                                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${conv.messages?.[0]?.senderType === "PRODUCER" ? "text-orange-400 bg-orange-400/10" : "text-[#9f7aea] bg-[#9f7aea]/10"
                                        }`}>
                                        {conv.messages?.[0]?.senderType === "PRODUCER" ? "Pendente" : "Respondido"}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <div className="text-[#b794f4] italic text-center py-10">Nenhuma atividade recente.</div>
                        )}
                    </div>
                </div>

                {/* Payments & Subscription */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Banknote size={20} className="text-[#9f7aea]" /> Configuração de Pagamentos
                    </h2>

                    <div className="bg-[#1a0f2c] p-6 rounded-[32px] border border-[#3b2164] relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-[#b794f4] text-sm mb-6 leading-relaxed">
                                Para receber pagamentos dos produtores culturais, você precisa configurar sua conta no Stripe Connect.
                            </p>
                            
                            {stats?.hasStripeConnect ? (
                                <button
                                    onClick={handleStripeDashboard}
                                    className="w-full bg-[#1a0f2c] border-2 border-[#9f7aea] text-white font-bold py-3 rounded-xl hover:bg-[#9f7aea]/10 transition-all text-sm flex items-center justify-center gap-2"
                                >
                                    Ver Painel Financeiro <ExternalLink size={16} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleStripeOnboarding}
                                    disabled={onboardingLoading}
                                    className="w-full bg-[#9f7aea] text-white font-bold py-3 rounded-xl hover:bg-[#805ad5] transition-all text-sm shadow-lg shadow-[#9f7aea]/20 flex items-center justify-center gap-2"
                                >
                                    {onboardingLoading ? "Carregando..." : "Configurar Recebimentos"} <ArrowUpRight size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <CreditCard size={20} className="text-[#9f7aea]" /> Assinatura
                    </h2>
                    
                    <div className="bg-gradient-to-br from-[#2c1e10] to-[#1a0f2c] p-6 rounded-[32px] border border-[#9f7aea]/30 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                            <ShieldCheck size={80} />
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-[#b794f4] text-xs font-bold uppercase tracking-widest mb-4">
                                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded">Ativa</span>
                                <span>Plano Mensal Elite</span>
                            </div>
                            <div className="text-3xl font-black text-white mb-1">R$ 50,00</div>
                            <div className="text-[#b794f4] text-xs mb-6">Próxima renovação: 12/06/2026</div>
                            
                            <button className="w-full bg-white/5 border border-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-all text-sm">
                                Gerenciar Assinatura
                            </button>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <TrendingUp size={20} className="text-[#9f7aea]" /> Visibilidade
                    </h2>
                    <div className="bg-[#1a0f2c] p-6 rounded-2xl border border-[#3b2164]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-sm text-[#b794f4]">Visualizações do Perfil</div>
                            <div className="text-green-400 text-xs font-bold flex items-center gap-1">
                                +12% <ArrowUpRight size={12} />
                            </div>
                        </div>
                        <div className="h-2 w-full bg-black/30 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#9f7aea] to-[#b794f4] w-[65%]" />
                        </div>
                        <div className="mt-4 flex justify-between items-end">
                            <div className="text-2xl font-bold text-white">428</div>
                            <div className="text-[10px] text-[#b794f4] uppercase tracking-widest">Este mês</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
