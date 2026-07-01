import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import {
    Percent,
    Plus,
    Building2,
    Calendar,
    CheckCircle2,
    XCircle,
    Info,
    Search,
    SlidersHorizontal,
    Play,
    Edit2,
    Trash2,
    RefreshCw,
    X,
    FileText,
    TrendingUp,
    ShieldAlert,
    Clock,
    DollarSign
} from "lucide-react";
import { Button, Badge, AnimateIn, Card } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

interface TenantOption {
    id: string;
    name: string;
    slug: string;
}

interface FeeConfig {
    id: string;
    tenantId: string | null;
    sourceType: string;
    sourceLabel: string;
    name: string | null;
    priority: number;
    percentage: number;
    fixedFee: number | null;
    feePaidBy: "BUYER" | "SELLER";
    isActive: boolean;
    startsAt: string | null;
    endsAt: string | null;
    notes: string | null;
    createdAt: string;
    tenant?: {
        id: string;
        name: string;
        slug: string;
    } | null;
}

interface OverviewData {
    total: number;
    totalActive: number;
    globalConfigs: number;
    tenantSpecific: number;
    expiringIn30Days: number;
    averageGlobalFee: number;
    globalFeesBySource: {
        sourceType: string;
        label: string;
        percentage: number;
        feePaidBy: string;
    }[];
}

interface SimulationResult {
    configId: string | null;
    sourceType: string;
    sourceLabel: string;
    percentage: number;
    fixedFeeCents: number;
    platformFeeCents: number;
    feePaidBy: "BUYER" | "SELLER";
    baseAmountCents: number;
    buyerPaysCents: number;
    sellerGrossCents: number;
    isTenantSpecific: boolean;
    appliedRule: "TENANT" | "GLOBAL" | "FALLBACK";
    tenantName: string | null;
    baseAmountBRL: string;
    platformFeeBRL: string;
    buyerPaysBRL: string;
    sellerGrossBRL: string;
    estimatedStripeFeeCents: number;
    estimatedStripeFeeBRL: string;
    estimatedNetSellerCents: number;
    estimatedNetSellerBRL: string;
}

interface AuditLogEntry {
    id: string;
    createdAt: string;
    action: string;
    metadata: {
        action?: string;
        sourceType?: string;
        configName?: string;
        tenantName?: string;
        percentage?: number;
        reason?: string;
        diff?: Record<string, { from: any; to: any }>;
    } | null;
    user?: {
        name: string;
        email: string;
    } | null;
}

export function MasterFinancialFees() {
    const { t } = useTranslation();

    // Data lists & loading states
    const [configs, setConfigs] = useState<FeeConfig[]>([]);
    const [tenants, setTenants] = useState<TenantOption[]>([]);
    const [sources, setSources] = useState<{ value: string; label: string }[]>([]);
    const [overview, setOverview] = useState<OverviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);

    // Filters
    const [filterTenant, setFilterTenant] = useState<string>("");
    const [filterSource, setFilterSource] = useState<string>("");
    const [filterStatus, setFilterStatus] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modals
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingConfig, setEditingConfig] = useState<FeeConfig | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    // Form fields
    const [formTenantId, setFormTenantId] = useState<string>("");
    const [formSourceType, setFormSourceType] = useState<string>("");
    const [formName, setFormName] = useState<string>("");
    const [formPercentage, setFormPercentage] = useState<number>(5);
    const [formFixedFee, setFormFixedFee] = useState<string>("");
    const [formFeePaidBy, setFormFeePaidBy] = useState<"BUYER" | "SELLER">("SELLER");
    const [formIsActive, setFormIsActive] = useState<boolean>(true);
    const [formStartsAt, setFormStartsAt] = useState<string>("");
    const [formEndsAt, setFormEndsAt] = useState<string>("");
    const [formNotes, setFormNotes] = useState<string>("");
    const [formPriority, setFormPriority] = useState<number>(0);

    // Simulation tool
    const [simAmount, setSimAmount] = useState<string>("100.00");
    const [simSource, setSimSource] = useState<string>("TICKET");
    const [simTenant, setSimTenant] = useState<string>("");
    const [simResult, setSimResult] = useState<SimulationResult | null>(null);
    const [simulating, setSimulating] = useState(false);

    // Audit logs drawer
    const [selectedConfigForAudit, setSelectedConfigForAudit] = useState<FeeConfig | null>(null);
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [loadingAudit, setLoadingAudit] = useState(false);

    // Load initial data
    const fetchOverview = useCallback(async () => {
        try {
            const res = await api.get("/master/fees/overview");
            setOverview(res.data);
        } catch (err) {
            console.error("Erro ao carregar overview:", err);
        }
    }, []);

    const fetchSources = useCallback(async () => {
        try {
            const res = await api.get("/master/fees/sources");
            setSources(res.data.sources || []);
            if (res.data.sources?.length > 0 && !formSourceType) {
                setFormSourceType(res.data.sources[0].value);
            }
        } catch (err) {
            console.error("Erro ao carregar fontes de taxas:", err);
        }
    }, [formSourceType]);

    const fetchTenants = useCallback(async () => {
        try {
            const res = await api.get("/tenants/list/options"); // rota de opções de inquilinos
            setTenants(res.data || []);
        } catch (err) {
            console.error("Erro ao carregar lista de tenants:", err);
        }
    }, []);

    const fetchConfigs = useCallback(async () => {
        try {
            setLoading(true);
            const params: any = {
                page,
                limit: 10
            };
            if (filterTenant) params.tenantId = filterTenant;
            if (filterSource) params.sourceType = filterSource;
            if (filterStatus) params.isActive = filterStatus;
            if (searchTerm) params.search = searchTerm;

            const res = await api.get("/master/fees", { params });
            setConfigs(res.data.data || []);
            setTotalPages(res.data.pagination.pages || 1);
        } catch (err) {
            console.error("Erro ao carregar configs de taxas:", err);
            toast.error(t("master.fees.error_load", "Erro ao carregar configurações de taxas."));
        } finally {
            setLoading(false);
        }
    }, [page, filterTenant, filterSource, filterStatus, searchTerm, t]);

    useEffect(() => {
        fetchOverview();
        fetchSources();
        fetchTenants();
    }, [fetchOverview, fetchSources, fetchTenants]);

    useEffect(() => {
        fetchConfigs();
    }, [fetchConfigs]);

    // Handle Seeding Defaults
    const handleSeedDefaults = async () => {
        if (!confirm(t("master.fees.confirm_seed", "Confirma a criação das taxas globais padrão do sistema?"))) return;
        setSeeding(true);
        try {
            const res = await api.post("/master/fees/seed-defaults");
            toast.success(res.data.message || t("master.fees.seed_success", "Taxas padrão criadas com sucesso!"));
            fetchOverview();
            fetchConfigs();
        } catch (err: any) {
            toast.error(err.response?.data?.error || t("master.fees.seed_error", "Erro ao rodar seed de taxas."));
        } finally {
            setSeeding(false);
        }
    };

    // Open Form for Create
    const handleOpenCreate = () => {
        setEditingConfig(null);
        setFormTenantId("");
        setFormSourceType(sources[0]?.value || "TICKET");
        setFormName("");
        setFormPercentage(5);
        setFormFixedFee("");
        setFormFeePaidBy("SELLER");
        setFormIsActive(true);
        setFormStartsAt("");
        setFormEndsAt("");
        setFormNotes("");
        setFormPriority(0);
        setFormError(null);
        setIsFormOpen(true);
    };

    // Open Form for Edit
    const handleOpenEdit = (cfg: FeeConfig) => {
        setEditingConfig(cfg);
        setFormTenantId(cfg.tenantId || "");
        setFormSourceType(cfg.sourceType);
        setFormName(cfg.name || "");
        setFormPercentage(cfg.percentage);
        setFormFixedFee(cfg.fixedFee !== null ? cfg.fixedFee.toString() : "");
        setFormFeePaidBy(cfg.feePaidBy);
        setFormIsActive(cfg.isActive);
        setFormStartsAt(cfg.startsAt ? cfg.startsAt.substring(0, 16) : "");
        setFormEndsAt(cfg.endsAt ? cfg.endsAt.substring(0, 16) : "");
        setFormNotes(cfg.notes || "");
        setFormPriority(cfg.priority);
        setFormError(null);
        setIsFormOpen(true);
    };

    // Save/Submit Form
    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        const payload = {
            tenantId: formTenantId || null,
            sourceType: formSourceType,
            name: formName || null,
            percentage: Number(formPercentage),
            fixedFee: formFixedFee ? Number(formFixedFee) : null,
            feePaidBy: formFeePaidBy,
            isActive: formIsActive,
            startsAt: formStartsAt ? new Date(formStartsAt).toISOString() : null,
            endsAt: formEndsAt ? new Date(formEndsAt).toISOString() : null,
            notes: formNotes || null,
            priority: Number(formPriority)
        };

        try {
            if (editingConfig) {
                await api.patch(`/master/fees/${editingConfig.id}`, payload);
                toast.success(t("master.fees.update_success", "Taxa atualizada com sucesso!"));
            } else {
                await api.post("/master/fees", payload);
                toast.success(t("master.fees.create_success", "Nova regra de taxa criada com sucesso!"));
            }
            setIsFormOpen(false);
            fetchOverview();
            fetchConfigs();
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.response?.data?.error || t("master.fees.save_error", "Erro ao salvar regra de taxa.");
            setFormError(errorMsg);
        }
    };

    // Deactivate Config
    const handleDeactivate = async (id: string) => {
        if (!confirm(t("master.fees.confirm_deactivate", "Deseja realmente desativar esta regra de taxa?"))) return;
        try {
            await api.delete(`/master/fees/${id}`);
            toast.success(t("master.fees.deactivate_success", "Regra desativada com sucesso."));
            fetchOverview();
            fetchConfigs();
        } catch (err) {
            toast.error(t("master.fees.deactivate_error", "Erro ao desativar taxa."));
        }
    };

    // Run Simulation
    const handleSimulate = async () => {
        setSimulating(true);
        try {
            const valCents = Math.round(Number(simAmount) * 100);
            const params: any = {
                sourceType: simSource,
                amountCents: valCents
            };
            if (simTenant) params.tenantId = simTenant;

            const res = await api.get("/master/fees/simulate", { params });
            setSimResult(res.data);
        } catch (err) {
            toast.error(t("master.fees.simulate_error", "Erro ao simular taxa."));
        } finally {
            setSimulating(false);
        }
    };

    // Open Audit Logs
    const handleOpenAudit = async (cfg: FeeConfig) => {
        setSelectedConfigForAudit(cfg);
        setLoadingAudit(true);
        try {
            const res = await api.get(`/master/fees/${cfg.id}/audit`);
            setAuditLogs(res.data.data || []);
        } catch (err) {
            toast.error(t("master.fees.audit_error", "Erro ao buscar histórico de auditoria."));
        } finally {
            setLoadingAudit(false);
        }
    };

    return (
        <AnimateIn className="space-y-12 pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-blue-500 rounded-full" />
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                            {t("master.fees.title", "Central")} <span className="text-blue-500">{t("master.fees.title_suffix", "de Taxas")}</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 font-medium text-lg">
                        {t("master.fees.subtitle", "Controle, simule e gerencie todas as regras de taxas da plataforma por prefeitura ou global.")}
                    </p>
                </div>

                <div className="flex flex-wrap gap-4">
                    <Button
                        variant="glass"
                        onClick={handleSeedDefaults}
                        disabled={seeding}
                        className="bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                    >
                        <RefreshCw size={16} className={`mr-2 ${seeding ? "animate-spin" : ""}`} />
                        {t("master.fees.seed_defaults_btn", "Resetar Taxas Globais")}
                    </Button>
                    <Button
                        onClick={handleOpenCreate}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-6"
                    >
                        <Plus size={18} className="mr-2" />
                        {t("master.fees.create_btn", "Nova Taxa")}
                    </Button>
                </div>
            </div>

            {/* Overview Metrics */}
            {overview && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-6 bg-white/[0.02] border-white/5 rounded-3xl flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t("master.fees.metric.active", "Taxas Ativas")}</p>
                            <h3 className="text-3xl font-black text-white mt-1">{overview.totalActive}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <CheckCircle2 size={24} />
                        </div>
                    </Card>

                    <Card className="p-6 bg-white/[0.02] border-white/5 rounded-3xl flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t("master.fees.metric.custom", "Personalizadas Cidades")}</p>
                            <h3 className="text-3xl font-black text-white mt-1">{overview.tenantSpecific}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                            <Building2 size={24} />
                        </div>
                    </Card>

                    <Card className="p-6 bg-white/[0.02] border-white/5 rounded-3xl flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t("master.fees.metric.expiring", "Expirando em 30d")}</p>
                            <h3 className="text-3xl font-black text-white mt-1">{overview.expiringIn30Days}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                            <Clock size={24} />
                        </div>
                    </Card>

                    <Card className="p-6 bg-white/[0.02] border-white/5 rounded-3xl flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t("master.fees.metric.avg", "Taxa Média Global")}</p>
                            <h3 className="text-3xl font-black text-white mt-1">{overview.averageGlobalFee}%</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
                            <Percent size={24} />
                        </div>
                    </Card>
                </div>
            )}

            {/* main body split: simulation and filters/table */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Rules Table */}
                <div className="xl:col-span-2 space-y-6">
                    <Card className="p-8 bg-white/[0.01] border-white/5 rounded-[32px] space-y-6">
                        {/* Filters and search */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                <input
                                    type="text"
                                    placeholder={t("master.fees.search_placeholder", "Pesquisar por nome ou anotação...")}
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setPage(1);
                                    }}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white text-sm focus:border-blue-500/50 outline-none transition-colors"
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                <select
                                    value={filterTenant}
                                    onChange={(e) => {
                                        setFilterTenant(e.target.value);
                                        setPage(1);
                                    }}
                                    className="bg-white/5 border border-white/5 rounded-2xl py-3 px-4 text-white text-xs outline-none focus:border-blue-500/50"
                                >
                                    <option value="">{t("master.fees.filter_tenant_all", "Todos Inquilinos")}</option>
                                    <option value="global">{t("master.fees.filter_tenant_global", "Apenas Globais")}</option>
                                    {tenants.map((t) => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>

                                <select
                                    value={filterSource}
                                    onChange={(e) => {
                                        setFilterSource(e.target.value);
                                        setPage(1);
                                    }}
                                    className="bg-white/5 border border-white/5 rounded-2xl py-3 px-4 text-white text-xs outline-none focus:border-blue-500/50"
                                >
                                    <option value="">{t("master.fees.filter_source_all", "Todas Fontes")}</option>
                                    {sources.map((s) => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>

                                <select
                                    value={filterStatus}
                                    onChange={(e) => {
                                        setFilterStatus(e.target.value);
                                        setPage(1);
                                    }}
                                    className="bg-white/5 border border-white/5 rounded-2xl py-3 px-4 text-white text-xs outline-none focus:border-blue-500/50"
                                >
                                    <option value="">{t("master.fees.filter_status_all", "Todos Status")}</option>
                                    <option value="true">{t("master.fees.filter_status_active", "Ativos")}</option>
                                    <option value="false">{t("master.fees.filter_status_inactive", "Inativos")}</option>
                                </select>
                            </div>
                        </div>

                        {/* Configs Table */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("master.fees.loading_rules", "Carregando Regras...")}</span>
                            </div>
                        ) : configs.length === 0 ? (
                            <div className="text-center py-20 space-y-3">
                                <Info className="mx-auto text-slate-600" size={32} />
                                <p className="text-slate-500 font-bold">{t("master.fees.no_rules_found", "Nenhuma regra de taxa encontrada.")}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-600">
                                            <th className="pb-4">{t("master.fees.table.tenant", "Prefeitura / Equipamento")}</th>
                                            <th className="pb-4">{t("master.fees.table.source", "Fonte")}</th>
                                            <th className="pb-4 text-right">{t("master.fees.table.rate", "Taxa %")}</th>
                                            <th className="pb-4 text-right">{t("master.fees.table.fixed", "Taxa Fixa")}</th>
                                            <th className="pb-4">{t("master.fees.table.paid_by", "Quem Paga")}</th>
                                            <th className="pb-4">{t("master.fees.table.status", "Status")}</th>
                                            <th className="pb-4 text-right">{t("master.fees.table.actions", "Ações")}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                                        {configs.map((cfg) => {
                                            const hasVigency = cfg.startsAt || cfg.endsAt;
                                            return (
                                                <tr key={cfg.id} className="group hover:bg-white/[0.01] transition-colors">
                                                    <td className="py-4">
                                                        {cfg.tenant ? (
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-white">{cfg.tenant.name}</span>
                                                                <span className="text-[10px] text-purple-400 font-black uppercase tracking-widest mt-0.5">{t("master.fees.rule_tenant", "Personalizada")}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-400">Global</span>
                                                                <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest mt-0.5">{t("master.fees.rule_global", "Padrão Sistema")}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-4 font-bold text-white">{cfg.sourceLabel}</td>
                                                    <td className="py-4 text-right font-black text-white">{cfg.percentage}%</td>
                                                    <td className="py-4 text-right font-medium text-slate-500">
                                                        {cfg.fixedFee !== null ? `R$ ${cfg.fixedFee.toFixed(2)}` : "—"}
                                                    </td>
                                                    <td className="py-4">
                                                        <Badge variant="glass" className={cfg.feePaidBy === "BUYER" ? "text-blue-400" : "text-green-400"}>
                                                            {cfg.feePaidBy === "BUYER" ? t("master.fees.paid_buyer", "Comprador") : t("master.fees.paid_seller", "Vendedor")}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-4">
                                                        {cfg.isActive ? (
                                                            <div className="flex flex-col">
                                                                <Badge className="bg-green-500/10 text-green-500 border-none w-max">Ativa</Badge>
                                                                {hasVigency && (
                                                                    <span className="text-[9px] text-slate-500 mt-1 flex items-center gap-1">
                                                                        <Calendar size={10} /> Vigência
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <Badge className="bg-slate-500/10 text-slate-500 border-none">Inativa</Badge>
                                                        )}
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleOpenAudit(cfg)}
                                                                title={t("master.fees.view_audit", "Histórico de Auditoria")}
                                                                className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                                                            >
                                                                <FileText size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenEdit(cfg)}
                                                                title={t("master.fees.edit", "Editar")}
                                                                className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            {cfg.isActive && (
                                                                <button
                                                                    onClick={() => handleDeactivate(cfg.id)}
                                                                    title={t("master.fees.deactivate", "Desativar")}
                                                                    className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-white/5 pt-6 text-xs text-slate-500">
                                <span>Página {page} de {totalPages}</span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="glass"
                                        disabled={page === 1}
                                        onClick={() => setPage(p => p - 1)}
                                        className="h-9 px-3 rounded-xl"
                                    >
                                        Anterior
                                    </Button>
                                    <Button
                                        variant="glass"
                                        disabled={page === totalPages}
                                        onClick={() => setPage(p => p + 1)}
                                        className="h-9 px-3 rounded-xl"
                                    >
                                        Próxima
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Simulation Side Tool */}
                <div className="space-y-6">
                    <Card className="p-8 bg-gradient-to-b from-blue-950/10 to-indigo-950/10 border-white/5 rounded-[32px] space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="text-blue-500" size={20} />
                                <h3 className="text-lg font-black text-white uppercase tracking-wider">{t("master.fees.sim.title", "Simulador Comercial")}</h3>
                            </div>
                            <p className="text-xs text-slate-500">
                                {t("master.fees.sim.subtitle", "Simule a divisão exata de receita e impacto da Stripe baseado nas regras vigentes.")}
                            </p>
                        </div>

                        {/* Inputs */}
                        <div className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">{t("master.fees.sim.amount", "Valor da Venda (R$)")}</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={simAmount}
                                    onChange={(e) => setSimAmount(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 text-white font-bold outline-none focus:border-blue-500/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">{t("master.fees.sim.source", "Tipo de Venda")}</label>
                                <select
                                    value={simSource}
                                    onChange={(e) => setSimSource(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 text-white outline-none focus:border-blue-500/50"
                                >
                                    {sources.map((s) => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">{t("master.fees.sim.tenant", "Cidade / Equipamento")}</label>
                                <select
                                    value={simTenant}
                                    onChange={(e) => setSimTenant(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 text-white outline-none focus:border-blue-500/50"
                                >
                                    <option value="">{t("master.fees.sim.tenant_none", "Regra Global")}</option>
                                    {tenants.map((t) => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <Button
                                onClick={handleSimulate}
                                disabled={simulating}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-3"
                            >
                                <Play size={16} className="mr-2 fill-current" />
                                {t("master.fees.sim.calculate_btn", "Calcular Impacto")}
                            </Button>
                        </div>

                        {/* Simulation Output */}
                        {simResult && (
                            <div className="space-y-4 pt-6 border-t border-white/5">
                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">Regra Aplicada</span>
                                        <Badge variant="glass" className={simResult.appliedRule === "TENANT" ? "text-purple-400" : "text-blue-400"}>
                                            {simResult.appliedRule === "TENANT" ? "Customizada Cidade" : simResult.appliedRule === "GLOBAL" ? "Global" : "Fallback"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">Taxa Reter %</span>
                                        <span className="text-white font-bold">{simResult.percentage}%</span>
                                    </div>
                                    {simResult.fixedFeeCents > 0 && (
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-500">Taxa Fixa R$</span>
                                            <span className="text-white font-bold">R$ {(simResult.fixedFeeCents / 100).toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">Quem Absorve Taxa</span>
                                        <span className="text-white font-bold">{simResult.feePaidBy === "BUYER" ? "Comprador (Soma)" : "Vendedor (Desconto)"}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">Comprador Paga</span>
                                        <span className="text-lg font-black text-white">R$ {simResult.buyerPaysBRL}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">Plataforma Retém</span>
                                        <span className="text-sm font-bold text-blue-400">R$ {simResult.platformFeeBRL}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">Stripe Estimado (2.9% + R$0.39)</span>
                                        <span className="text-sm text-slate-500">R$ {simResult.estimatedStripeFeeBRL}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                                        <span className="text-slate-500 font-bold">Líquido do Museu/Produtor</span>
                                        <span className="text-md font-black text-green-400">R$ {simResult.estimatedNetSellerBRL}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0b0f19] border border-white/10 rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl"
                        >
                            <div className="p-8 flex items-center justify-between border-b border-white/5">
                                <h3 className="text-xl font-black text-white">
                                    {editingConfig ? t("master.fees.modal.edit", "Editar Regra de Taxa") : t("master.fees.modal.create", "Nova Regra de Taxa")}
                                </h3>
                                <button onClick={() => setIsFormOpen(false)} className="text-slate-500 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmitForm} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                {formError && (
                                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-start gap-3 text-xs">
                                        <ShieldAlert className="shrink-0 mt-0.5" size={16} />
                                        <span>{formError}</span>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {/* Application Target */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-wider text-slate-500">Aplicação</label>
                                        <select
                                            value={formTenantId}
                                            onChange={(e) => setFormTenantId(e.target.value)}
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 text-white outline-none focus:border-blue-500/50"
                                        >
                                            <option value="">Global (Todas cidades sem regra customizada)</option>
                                            {tenants.map((t) => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Source Type */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-wider text-slate-500">Fonte de Receita</label>
                                        <select
                                            value={formSourceType}
                                            onChange={(e) => setFormSourceType(e.target.value)}
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 text-white outline-none focus:border-blue-500/50"
                                        >
                                            {sources.map((s) => (
                                                <option key={s.value} value={s.value}>{s.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Config Name */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-wider text-slate-500">Nome / Identificação</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Betim - Piloto 6 meses"
                                            value={formName}
                                            onChange={(e) => setFormName(e.target.value)}
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 text-white outline-none focus:border-blue-500/50"
                                        />
                                    </div>

                                    {/* Percentage and Fixed Fee */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-wider text-slate-500">Taxa (%)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                value={formPercentage}
                                                onChange={(e) => setFormPercentage(Number(e.target.value))}
                                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 text-white font-bold outline-none focus:border-blue-500/50"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-wider text-slate-500">Taxa Fixa (R$)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={formFixedFee}
                                                onChange={(e) => setFormFixedFee(e.target.value)}
                                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 text-white outline-none focus:border-blue-500/50"
                                            />
                                        </div>
                                    </div>

                                    {/* Who pays */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-wider text-slate-500">Quem paga a taxa?</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setFormFeePaidBy("SELLER")}
                                                className={`py-3 rounded-2xl border text-xs font-bold transition-all ${
                                                    formFeePaidBy === "SELLER"
                                                        ? "bg-blue-600/10 border-blue-500 text-white"
                                                        : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                                                }`}
                                            >
                                                Vendedor (Descontado do repasse)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormFeePaidBy("BUYER")}
                                                className={`py-3 rounded-2xl border text-xs font-bold transition-all ${
                                                    formFeePaidBy === "BUYER"
                                                        ? "bg-blue-600/10 border-blue-500 text-white"
                                                        : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                                                }`}
                                            >
                                                Comprador (Acrescido na venda)
                                            </button>
                                        </div>
                                    </div>

                                    {/* Priority */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-wider text-slate-500">Prioridade de Resolução</label>
                                        <input
                                            type="number"
                                            value={formPriority}
                                            onChange={(e) => setFormPriority(Number(e.target.value))}
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 text-white outline-none focus:border-blue-500/50"
                                        />
                                        <p className="text-[10px] text-slate-500 mt-1">Valores maiores sobrepõem outras regras em caso de vigências idênticas.</p>
                                    </div>

                                    {/* Start and End date vigency */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-wider text-slate-500">Início Vigência (Opcional)</label>
                                            <input
                                                type="datetime-local"
                                                value={formStartsAt}
                                                onChange={(e) => setFormStartsAt(e.target.value)}
                                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 text-white outline-none focus:border-blue-500/50"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-wider text-slate-500">Fim Vigência (Opcional)</label>
                                            <input
                                                type="datetime-local"
                                                value={formEndsAt}
                                                onChange={(e) => setFormEndsAt(e.target.value)}
                                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 text-white outline-none focus:border-blue-500/50"
                                            />
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-wider text-slate-500">Observações / Motivo Comercial</label>
                                        <textarea
                                            rows={3}
                                            placeholder="Descreva detalhes ou negociações comerciais..."
                                            value={formNotes}
                                            onChange={(e) => setFormNotes(e.target.value)}
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 text-white text-sm outline-none focus:border-blue-500/50 resize-none"
                                        />
                                    </div>

                                    {/* Active status */}
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-xs font-black uppercase tracking-wider text-slate-500">Regra Ativa?</span>
                                        <button
                                            type="button"
                                            onClick={() => setFormIsActive(!formIsActive)}
                                            className={`w-14 h-8 rounded-full transition-colors relative flex items-center px-1 ${
                                                formIsActive ? "bg-blue-600" : "bg-slate-800"
                                            }`}
                                        >
                                            <motion.div
                                                layout
                                                className="w-6 h-6 bg-white rounded-full shadow-lg"
                                                animate={{ x: formIsActive ? 24 : 0 }}
                                            />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                                    <Button
                                        type="button"
                                        variant="glass"
                                        onClick={() => setIsFormOpen(false)}
                                        className="h-12 px-6 rounded-2xl border-white/5 text-slate-400 hover:text-white"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="h-12 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        {editingConfig ? "Salvar Alterações" : "Criar Regra"}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Audit Logs Drawer */}
            <AnimatePresence>
                {selectedConfigForAudit && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
                        {/* overlay closer */}
                        <div className="absolute inset-0" onClick={() => setSelectedConfigForAudit(null)} />
                        
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "tween", duration: 0.3 }}
                            className="bg-[#0b0f19] border-l border-white/10 w-full max-w-lg h-full flex flex-col z-10 shadow-2xl relative"
                        >
                            <div className="p-8 flex items-center justify-between border-b border-white/5">
                                <div>
                                    <h3 className="text-xl font-black text-white">Histórico de Alterações</h3>
                                    <p className="text-xs text-slate-500 mt-1">Auditoria de mudanças na regra de taxa</p>
                                </div>
                                <button onClick={() => setSelectedConfigForAudit(null)} className="text-slate-500 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
                                {loadingAudit ? (
                                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Buscando auditoria...</span>
                                    </div>
                                ) : auditLogs.length === 0 ? (
                                    <div className="text-center py-20 text-slate-500">
                                        Nenhum registro de auditoria encontrado para esta taxa.
                                    </div>
                                ) : (
                                    <div className="relative border-l border-white/5 pl-6 ml-3 space-y-8">
                                        {auditLogs.map((log) => {
                                            const metadata = log.metadata;
                                            const diff = metadata?.diff;
                                            return (
                                                <div key={log.id} className="relative space-y-2">
                                                    {/* marker */}
                                                    <div className="absolute -left-[31px] top-1 w-4 h-4 bg-blue-500 rounded-full border-4 border-[#0b0f19]" />
                                                    
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-black text-white uppercase tracking-wider">
                                                            {metadata?.action || log.action}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500">
                                                            {new Date(log.createdAt).toLocaleString()}
                                                        </span>
                                                    </div>

                                                    <p className="text-xs text-slate-400">
                                                        Efetuado por: <span className="font-bold text-white">{log.user?.name || "Sistema"}</span> ({log.user?.email || "—"})
                                                    </p>

                                                    {diff && (
                                                        <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-1 text-xs">
                                                            {Object.entries(diff).map(([key, value]: any) => (
                                                                <div key={key} className="flex flex-wrap items-center gap-1.5">
                                                                    <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider">{key}:</span>
                                                                    <span className="text-rose-400 line-through">{String(value.from)}</span>
                                                                    <span className="text-slate-500">→</span>
                                                                    <span className="text-green-400 font-bold">{String(value.to)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {metadata?.reason && (
                                                        <p className="text-[11px] text-slate-500 italic">"Motivo: {metadata.reason}"</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AnimateIn>
    );
}
