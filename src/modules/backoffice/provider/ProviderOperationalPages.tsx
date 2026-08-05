import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../../api/client";
import { Conversation } from "../../../services/inboxService";
import { Button, Card, Badge, AnimateIn } from "@/components/ui";
import { ArrowRight, Briefcase, CheckCircle2, Clock, CreditCard, FileText, MessageSquare, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { logger } from "@/utils/logger";

interface ProviderExecution {
    id: string;
    serviceType: string;
    status: string;
    approvedBudget?: number | string | null;
    requestedAt?: string | null;
    notaFiscalUrl?: string | null;
    culturalProject?: { title?: string | null } | null;
    project?: { title?: string | null } | null;
}

interface ProviderStats {
    pendingQuotes?: number;
    activeConversations?: number;
    completedExecutions?: number;
    totalFaturamento?: number;
    subscriptionStatus?: string;
    subscriptionMonthlyPriceBRL?: string;
    canSendProposals?: boolean;
    hasStripeConnect?: boolean;
}

interface SubscriptionResponse {
    checkoutUrl: string;
}

const money = (value: unknown) => Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function useProviderOpsData() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [executions, setExecutions] = useState<ProviderExecution[]>([]);
    const [stats, setStats] = useState<ProviderStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        async function load() {
            try {
                setLoading(true);
                const [conversationRes, executionRes, statsRes] = await Promise.all([
                    api.get<Conversation[]>("/inbox"),
                    api.get<ProviderExecution[]>("/providers/me/executions"),
                    api.get<ProviderStats>("/providers/me/stats"),
                ]);
                if (!mounted) return;
                setConversations(Array.isArray(conversationRes.data) ? conversationRes.data : []);
                setExecutions(Array.isArray(executionRes.data) ? executionRes.data : []);
                setStats(statsRes.data);
            } catch (error) {
                logger.error("Error loading provider operational data", error);
                toast.error("Nao foi possivel carregar os dados do prestador.");
            } finally {
                if (mounted) setLoading(false);
            }
        }
        void load();
        return () => {
            mounted = false;
        };
    }, []);

    return { conversations, executions, stats, loading };
}

function EmptyState({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
    return (
        <Card className="p-10 bg-white/[0.02] border-white/5 rounded-[32px] text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-slate-500">{icon}</div>
            <h3 className="text-lg font-black text-white">{title}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{text}</p>
        </Card>
    );
}

export const ProviderRequests: React.FC = () => {
    const navigate = useNavigate();
    const { conversations, loading } = useProviderOpsData();
    const openRequests = conversations.filter((conv) => conv.status !== "CLOSED");

    if (loading) return <div className="p-8 text-white">Carregando chamados...</div>;

    return (
        <AnimateIn className="mx-auto max-w-6xl space-y-6">
            <div>
                <h1 className="text-3xl font-black text-white">Chamados e Contratacoes</h1>
                <p className="mt-2 text-sm text-slate-500">Entrada operacional dos produtores, convites e conversas comerciais em aberto.</p>
            </div>
            {openRequests.length === 0 ? (
                <EmptyState icon={<Briefcase size={28} />} title="Nenhum chamado em aberto" text="Quando um produtor solicitar orcamento ou iniciar uma contratacao, ela aparece aqui." />
            ) : (
                <div className="grid gap-4">
                    {openRequests.map((conv) => (
                        <Card key={conv.id} className="p-6 bg-white/[0.02] border-white/5 rounded-[28px]">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/20 text-[10px] uppercase">Aberto</Badge>
                                        <span className="text-xs text-slate-500">{new Date(conv.lastMessageAt).toLocaleDateString("pt-BR")}</span>
                                    </div>
                                    <h2 className="mt-3 text-xl font-black text-white">{conv.producer?.name || "Produtor cultural"}</h2>
                                    <p className="mt-1 max-w-2xl truncate text-sm text-slate-400">{conv.messages?.[0]?.content || "Conversa comercial iniciada."}</p>
                                </div>
                                <Button onClick={() => navigate(`/provider/mensagens?id=${conv.id}`)} rightIcon={<ArrowRight size={16} />}>Abrir conversa</Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </AnimateIn>
    );
};

export const ProviderQuotes: React.FC = () => {
    const navigate = useNavigate();
    const { conversations, stats, loading } = useProviderOpsData();
    const pending = useMemo(() => conversations.filter((conv) => !conv.messages?.some((msg) => msg.senderType === "PROVIDER")), [conversations]);

    if (loading) return <div className="p-8 text-white">Carregando orcamentos...</div>;

    return (
        <AnimateIn className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white">Orcamentos</h1>
                    <p className="mt-2 text-sm text-slate-500">Propostas pendentes e historico de negociacao com produtores.</p>
                </div>
                {!stats?.canSendProposals && (
                    <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/20 px-4 py-2 text-[10px] uppercase">Mensalidade obrigatoria para enviar propostas</Badge>
                )}
            </div>
            {pending.length === 0 ? (
                <EmptyState icon={<FileText size={28} />} title="Nenhum orcamento pendente" text="As solicitacoes novas ficam destacadas aqui ate voce responder pelo inbox." />
            ) : (
                <div className="grid gap-4">
                    {pending.map((conv) => (
                        <Card key={conv.id} className="p-6 bg-white/[0.02] border-white/5 rounded-[28px]">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className="text-xl font-black text-white">{conv.producer?.name || "Produtor cultural"}</h2>
                                    <p className="mt-1 max-w-2xl text-sm text-slate-400">{conv.messages?.[0]?.content || "Solicitacao aguardando proposta."}</p>
                                </div>
                                <Button onClick={() => navigate(`/provider/mensagens?id=${conv.id}`)} leftIcon={<MessageSquare size={16} />}>Responder</Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </AnimateIn>
    );
};

export const ProviderExecutions: React.FC = () => {
    const { executions, loading } = useProviderOpsData();

    if (loading) return <div className="p-8 text-white">Carregando execucoes...</div>;

    return (
        <AnimateIn className="mx-auto max-w-6xl space-y-6">
            <div>
                <h1 className="text-3xl font-black text-white">Execucoes</h1>
                <p className="mt-2 text-sm text-slate-500">Servicos aprovados, entregas, validacoes e notas fiscais vinculadas.</p>
            </div>
            {executions.length === 0 ? (
                <EmptyState icon={<CheckCircle2 size={28} />} title="Nenhuma execucao atribuida" text="Projetos aprovados que contratarem seus servicos aparecem nesta fila." />
            ) : (
                <div className="grid gap-4">
                    {executions.map((execution) => (
                        <Card key={execution.id} className="p-6 bg-white/[0.02] border-white/5 rounded-[28px]">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 text-[10px] uppercase">{execution.serviceType}</Badge>
                                        <Badge className="bg-white/5 text-slate-300 border-white/10 text-[10px] uppercase">{execution.status}</Badge>
                                        {execution.notaFiscalUrl && <Badge className="bg-green-500/10 text-green-300 border-green-500/20 text-[10px] uppercase">NF enviada</Badge>}
                                    </div>
                                    <h2 className="mt-3 text-xl font-black text-white">{execution.culturalProject?.title || execution.project?.title || "Servico de acessibilidade"}</h2>
                                    <p className="mt-1 text-sm text-slate-400">Valor aprovado: {money(execution.approvedBudget)}</p>
                                </div>
                                <div className="text-sm text-slate-500">{execution.requestedAt ? new Date(execution.requestedAt).toLocaleDateString("pt-BR") : "--"}</div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </AnimateIn>
    );
};

export const ProviderWallet: React.FC = () => {
    const { stats, executions, loading } = useProviderOpsData();
    const [subscriptionLoading, setSubscriptionLoading] = useState(false);

    const paidExecutions = executions.filter((execution) => execution.status === "VALIDATED");
    const pendingExecutions = executions.filter((execution) => execution.status !== "VALIDATED");

    const activateSubscription = async () => {
        try {
            setSubscriptionLoading(true);
            const { data } = await api.post<SubscriptionResponse>("/providers/me/subscription/checkout");
            window.location.href = data.checkoutUrl;
        } catch (error) {
            logger.error("Error starting provider subscription", error);
            toast.error("Nao foi possivel iniciar a assinatura.");
        } finally {
            setSubscriptionLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-white">Carregando carteira...</div>;

    return (
        <AnimateIn className="mx-auto max-w-6xl space-y-6">
            <div>
                <h1 className="text-3xl font-black text-white">Carteira e Financeiro</h1>
                <p className="mt-2 text-sm text-slate-500">Resumo de faturamento, mensalidade e liberacao comercial do prestador.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="p-6 bg-white/[0.02] border-white/5 rounded-[28px]">
                    <Wallet className="mb-4 text-green-400" size={24} />
                    <div className="text-3xl font-black text-white">{money(stats?.totalFaturamento)}</div>
                    <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Faturamento validado</div>
                </Card>
                <Card className="p-6 bg-white/[0.02] border-white/5 rounded-[28px]">
                    <Clock className="mb-4 text-amber-400" size={24} />
                    <div className="text-3xl font-black text-white">{pendingExecutions.length}</div>
                    <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Execucoes pendentes</div>
                </Card>
                <Card className="p-6 bg-white/[0.02] border-white/5 rounded-[28px]">
                    <CreditCard className="mb-4 text-indigo-400" size={24} />
                    <div className="text-3xl font-black text-white">R$ {stats?.subscriptionMonthlyPriceBRL || "50.00"}</div>
                    <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Mensalidade</div>
                </Card>
            </div>
            <Card className="p-8 bg-white/[0.02] border-white/5 rounded-[32px]">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div>
                        <Badge className={stats?.canSendProposals ? "bg-green-500/10 text-green-300 border-green-500/20" : "bg-amber-500/10 text-amber-300 border-amber-500/20"}>
                            {stats?.canSendProposals ? "Propostas liberadas" : "Propostas bloqueadas"}
                        </Badge>
                        <h2 className="mt-4 text-2xl font-black text-white">Cadastro gratuito, operacao comercial com mensalidade</h2>
                        <p className="mt-2 max-w-3xl text-sm text-slate-400">
                            O prestador pode criar perfil e vitrine sem custo. Para responder solicitacoes, enviar propostas em projetos aprovados e solicitar pagamentos, precisa manter a mensalidade ativa.
                        </p>
                    </div>
                    {!stats?.canSendProposals && (
                        <Button onClick={activateSubscription} isLoading={subscriptionLoading}>Ativar mensalidade</Button>
                    )}
                </div>
            </Card>
            <Card className="p-6 bg-white/[0.02] border-white/5 rounded-[28px]">
                <h2 className="text-lg font-black text-white">Historico financeiro</h2>
                <div className="mt-4 divide-y divide-white/5">
                    {paidExecutions.length === 0 ? (
                        <p className="py-8 text-sm text-slate-500">Ainda nao ha execucoes validadas para repasse.</p>
                    ) : paidExecutions.map((execution) => (
                        <div key={execution.id} className="flex items-center justify-between py-4">
                            <div>
                                <div className="font-bold text-white">{execution.culturalProject?.title || execution.project?.title || "Servico de acessibilidade"}</div>
                                <div className="text-xs text-slate-500">{execution.serviceType}</div>
                            </div>
                            <div className="font-black text-green-300">{money(execution.approvedBudget)}</div>
                        </div>
                    ))}
                </div>
            </Card>
        </AnimateIn>
    );
};
