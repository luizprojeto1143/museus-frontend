import React, { useState, useEffect, useCallback } from "react";
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
    ExternalLink,
    Zap,
    Briefcase,
    Activity,
    ChevronRight,
    Sparkles,
    AlertCircle
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";
import { useNavigate } from "react-router-dom";
import { 
    Card, 
    AnimatedCounter, 
    Button, 
    Badge, 
    AnimateIn 
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export const ProviderDashboard: React.FC = () => {
    const { name } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [onboardingLoading, setOnboardingLoading] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [statsRes, activitiesRes] = await Promise.all([
                api.get("/providers/me/stats"),
                api.get("/inbox")
            ]);
            setStats(statsRes.data);
            setActivities(activitiesRes.data.slice(0, 5));
        } catch (err) {
            console.error("Error fetching provider dashboard data", err);
            toast.error("Erro ao sincronizar dados do painel.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleStripeOnboarding = async () => {
        try {
            setOnboardingLoading(true);
            const { data } = await api.get("/stripe/onboarding-link");
            window.location.href = data.url;
        } catch (err) {
            console.error("Error generating onboarding link", err);
            toast.error("Erro ao conectar com o gateway de pagamento.");
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
            toast.error("Não foi possível abrir o painel financeiro.");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">Sincronizando Terminal...</p>
        </div>
    );

    const statCards = [
        { label: "Solicitações", value: stats?.pendingQuotes ?? 0, icon: <Clock size={20} />, color: "text-amber-400", bg: "bg-amber-400/10" },
        { label: "Conversas", value: stats?.activeConversations ?? 0, icon: <MessageSquare size={20} />, color: "text-blue-400", bg: "bg-blue-400/10" },
        { label: "Concluídos", value: stats?.completedExecutions ?? 0, icon: <CheckCircle size={20} />, color: "text-green-400", bg: "bg-green-400/10" },
        { label: "Faturamento (R$)", value: stats?.totalFaturamento ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalFaturamento) : "R$ 0,00", isString: true, icon: <DollarSign size={20} />, color: "text-indigo-400", bg: "bg-indigo-400/10" },
    ];

    return (
        <AnimateIn className="space-y-10 pb-20 max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                        Olá, <span className="text-indigo-500">{name?.split(" ")[0]}!</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg">
                        {stats?.pendingQuotes > 0 ? (
                            <span className="flex items-center gap-2">
                                <Sparkles size={18} className="text-amber-400" />
                                Você tem <span className="text-white font-bold">{stats.pendingQuotes} novas solicitações</span> pendentes.
                            </span>
                        ) : (
                            "Sua agenda estratégica está em dia."
                        )}
                    </p>
                </div>
                <div className="flex gap-3">
                    {!stats?.active && (
                         <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                             <AlertCircle size={14} /> Perfil Pendente de Ativação
                         </Badge>
                    )}
                    <Button
                        onClick={() => navigate("/provider/inbox")}
                        className="h-14 px-8 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20 active:scale-95"
                        rightIcon={<ArrowUpRight size={18} />}
                    >
                        Abrir Inbox
                    </Button>
                </div>
            </div>

            {/* Inactive Profile Banner */}
            {!stats?.active && (
                <Card className="p-8 bg-amber-500/5 border-amber-500/20 rounded-[32px] border-dashed">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                            <Zap size={32} />
                        </div>
                        <div className="flex-1 space-y-2 text-center md:text-left">
                            <h3 className="text-xl font-black text-white tracking-tight">Ativação de Perfil Necessária</h3>
                            <p className="text-slate-400 text-sm font-medium">
                                Seu cadastro foi recebido com sucesso! Para começar a receber solicitações de museus e produtores, é necessário concluir o pagamento da assinatura ou aguardar a validação administrativa.
                            </p>
                        </div>
                        <Button
                            className="bg-amber-500 text-black font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
                            onClick={() => window.location.reload()} // Just reload for now or link to stripe if we have session info
                        >
                            Verificar Status
                        </Button>
                    </div>
                </Card>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <Card key={i} className="p-8 bg-white/[0.02] border-white/5 rounded-[32px] group hover:bg-white/[0.04] transition-all relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 transition-all group-hover:scale-110 ${stat.bg} ${stat.color}`}>
                                {stat.icon}
                            </div>
                        </div>
                        <div className="relative z-10">
                            <div className="text-4xl font-black text-white leading-none tracking-tighter">
                                {stat.isString ? (
                                    <span>{stat.value as string}</span>
                                ) : (
                                    <AnimatedCounter value={stat.value as number} />
                                )}
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-3">{stat.label}</div>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                            {React.cloneElement(stat.icon as React.ReactElement, { size: 80 })}
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Recent Activities */}
                <Card className="lg:col-span-8 p-0 bg-white/[0.02] border-white/5 rounded-[40px] overflow-hidden">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center">
                                <Activity size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight">Atividades Críticas</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Últimas interações com produtores</p>
                            </div>
                        </div>
                        <Button variant="glass" className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-white/5" onClick={() => navigate("/provider/inbox")}>
                            Ver Todas
                        </Button>
                    </div>

                    <div className="divide-y divide-white/5">
                        {activities.length > 0 ? activities.map((conv, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => navigate(`/provider/inbox?id=${conv.id}`)}
                                className="p-6 flex items-center justify-between group hover:bg-white/[0.02] transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-indigo-600/20 text-indigo-400 rounded-2xl flex items-center justify-center font-black text-lg border border-indigo-400/10 group-hover:scale-105 transition-transform">
                                        {conv.producer?.name?.slice(0, 2).toUpperCase() || "??"}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-white font-bold group-hover:text-indigo-400 transition-colors">{conv.producer?.name || "Produtor Desconhecido"}</div>
                                        <div className="text-slate-500 text-xs truncate max-w-[280px] mt-1 font-medium">
                                            {conv.messages?.[0]?.content || "Iniciou uma nova conversa estratégica."}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-2">
                                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                        {new Date(conv.lastMessageAt).toLocaleDateString("pt-BR")}
                                    </div>
                                    <Badge className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                        conv.messages?.[0]?.senderType === "PRODUCER" 
                                        ? "text-amber-400 bg-amber-400/10 border-amber-400/20" 
                                        : "text-indigo-400 bg-indigo-400/10 border-indigo-400/20"
                                    }`}>
                                        {conv.messages?.[0]?.senderType === "PRODUCER" ? "Pendente" : "Respondido"}
                                    </Badge>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-600 space-y-4">
                                <AlertCircle size={48} className="opacity-20" />
                                <p className="text-sm font-medium italic">Nenhum fluxo de atividade registrado.</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Right Column: Payments & Account */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Stripe Section */}
                    <Card className="p-8 bg-white/[0.02] border-white/5 rounded-[40px] relative overflow-hidden group">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.2)]">
                                <Banknote size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white tracking-tight">Pagamentos</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Gateway Stripe Connect</p>
                            </div>
                        </div>

                        <p className="text-slate-400 text-xs leading-relaxed mb-8 font-medium">
                            Configure seus recebimentos para processar faturamentos de serviços executados com segurança bancária.
                        </p>
                        
                        <AnimatePresence mode="wait">
                            {stats?.hasStripeConnect ? (
                                <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                    <Button
                                        onClick={handleStripeDashboard}
                                        variant="glass"
                                        className="w-full h-14 rounded-2xl border-white/5 text-white font-black text-[10px] uppercase tracking-[0.2em]"
                                        leftIcon={<ExternalLink size={16} />}
                                    >
                                        Painel Financeiro
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div key="onboarding" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                    <Button
                                        onClick={handleStripeOnboarding}
                                        isLoading={onboardingLoading}
                                        className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20"
                                        rightIcon={<ArrowUpRight size={16} />}
                                    >
                                        Configurar Conta
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-all" />
                    </Card>

                    {/* Subscription Section */}
                    <Card className="p-8 bg-gradient-to-br from-indigo-950/20 to-black/40 border-indigo-500/20 rounded-[40px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                            <ShieldCheck size={120} />
                        </div>
                        
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <Badge className={`uppercase text-[8px] font-black tracking-widest px-3 py-1 ${
                                    stats?.active 
                                    ? "bg-green-500/10 text-green-400 border-green-500/20" 
                                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                }`}>
                                    {stats?.active ? "Assinatura Ativa" : "Aguardando Ativação"}
                                </Badge>
                                <CreditCard size={18} className={stats?.active ? "text-indigo-400" : "text-slate-500"} />
                            </div>
                            
                            <div>
                                <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Plano Mensal Elite</h4>
                                <div className="text-4xl font-black text-white tracking-tighter">R$ 50,00</div>
                            </div>
                            
                            <div className="text-slate-500 text-[10px] font-medium italic">
                                Renovação automática em 12 de Junho, 2026
                            </div>
                            
                            <Button variant="glass" className="w-full h-12 rounded-xl border-white/5 text-white/60 font-black text-[9px] uppercase tracking-[0.2em] hover:text-white transition-colors">
                                Gerenciar Faturamento
                            </Button>
                        </div>
                    </Card>

                    {/* Visibility Card */}
                    <Card className="p-8 bg-white/[0.02] border-white/5 rounded-[32px] space-y-6 group">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <TrendingUp size={18} className="text-indigo-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Visibilidade</span>
                            </div>
                            <div className="text-green-400 text-[10px] font-black flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded-lg">
                                +12% <ArrowUpRight size={10} />
                            </div>
                        </div>
                        
                        <div>
                            <div className="flex justify-between items-end mb-4">
                                <div className="text-3xl font-black text-white leading-none">428</div>
                                <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Views este mês</div>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: '65%' }}
                                    className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 shadow-[0_0_10px_rgba(79,70,229,0.3)]" 
                                />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AnimateIn>
    );
};
