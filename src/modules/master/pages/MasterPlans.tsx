import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { Plus, Edit, Trash2, Shield, Zap, FileText, CheckCircle2, DollarSign } from "lucide-react";
import { Button, Input, Select, Textarea, Card } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";

type Plan = {
    id: string;
    name: string;
    description?: string;
    maxActiveProjects: number;
    maxAccessibilityReqs: number;
    maxReportsPerMonth: number;
    maxAIAnalyses: number;
    maxWorks: number;
    maxEvents: number;
    maxChildTenants: number;
    maxUsers: number;
    aiTier: string;
    slaTier: string;
    supportResponseHours: number;
    monthlyPrice?: number;
    hasExecutiveReports: boolean;
    hasLegalCompliance: boolean;
    hasAPIAccess: boolean;
    hasWhiteLabel: boolean;
    _count?: { tenants: number };
};

const aiTierLabels: Record<string, string> = {
    BASIC: "Básico",
    CONTINUOUS: "Contínuo",
    ADVANCED: "Avançado"
};

const slaTierLabels: Record<string, string> = {
    STANDARD: "Padrão (48h)",
    EXTENDED: "Estendido (24h)",
    DEDICATED: "Dedicado (4h)"
};

const MasterPlans: React.FC = () => {
    const { addToast } = useToast();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

    const fetchPlans = useCallback(async () => {
        try {
            const response = await api.get("/plans");
            setPlans(response.data);
        } catch (err) {
            console.error("Erro ao carregar planos", err);
            addToast("Erro ao carregar planos", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const deletePlan = async (id: string) => {
        if (!window.confirm("Tem certeza que deseja excluir este plano?")) return;
        try {
            await api.delete(`/plans/${id}`);
            addToast("Plano removido com sucesso!", "success");
            fetchPlans();
        } catch (err: any) {
            addToast(err.response?.data?.message || "Erro ao excluir plano", "error");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="animate-pulse opacity-50 text-slate-400">Carregando planos...</p>
            </div>
        );
    }

    return (
        <div className="master-page-container">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Planos Contratuais</h1>
                    <p className="opacity-70 mt-1">Gerencie camadas de serviço e limites para instituições</p>
                </div>
                <Button
                    onClick={() => { setEditingPlan(null); setShowForm(true); }}
                    leftIcon={<Plus size={18} />}
                    className="w-full md:w-auto"
                >
                    Novo Plano
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div key={plan.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col hover:ring-2 hover:ring-blue-500/50 transition-all">
                        <div className="bg-blue-600/20 p-6 border-b border-white/5 relative">
                            <div className="flex justify-between items-start">
                                <h2 className="text-xl font-bold text-white">{plan.name}</h2>
                                <Shield className="text-blue-400" size={20} />
                            </div>
                            {plan.monthlyPrice !== undefined && (
                                <div className="text-2xl font-black mt-4 flex items-baseline gap-1">
                                    <span className="text-sm font-normal opacity-70">R$</span>
                                    {plan.monthlyPrice.toLocaleString("pt-BR")}
                                    <span className="text-sm font-normal opacity-70">/mês</span>
                                </div>
                            )}
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                            {plan.description && (
                                <p className="text-slate-400 text-sm mb-6 line-clamp-2 italic">
                                    "{plan.description}"
                                </p>
                            )}

                            <div className="space-y-2 text-sm">
                                <FeatureRow label="Obras" value={plan.maxWorks} />
                                <FeatureRow label="Eventos" value={plan.maxEvents} />
                                <FeatureRow label="Projetos Ativos" value={plan.maxActiveProjects} />
                                <FeatureRow label="Usuários" value={plan.maxUsers} />
                                <FeatureRow label="Equipamentos Filhos" value={plan.maxChildTenants} />
                                <FeatureRow label="Nível IA" value={aiTierLabels[plan.aiTier]} />
                                <FeatureRow label="SLA" value={slaTierLabels[plan.slaTier]} />
                            </div>

                            <div className="mt-6 flex flex-wrap gap-1.5">
                                {plan.hasExecutiveReports && <FeatureBadge label="Executivo" />}
                                {plan.hasLegalCompliance && <FeatureBadge label="Jurídico" />}
                                {plan.hasAPIAccess && <FeatureBadge label="API" />}
                                {plan.hasWhiteLabel && <FeatureBadge label="White Label" />}
                            </div>

                            <div className="mt-6 p-4 bg-white/5 rounded-xl text-center">
                                <span className="text-xs text-slate-500 font-medium">
                                    {plan._count?.tenants || 0} instituições usando este plano
                                </span>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => { setEditingPlan(plan); setShowForm(true); }}
                                    className="flex-1"
                                    leftIcon={<Edit size={16} />}
                                >
                                    Editar
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => deletePlan(plan.id)}
                                    className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500/10"
                                    leftIcon={<Trash2 size={16} />}
                                >
                                    Excluir
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showForm && (
                <PlanFormModal
                    plan={editingPlan}
                    onClose={() => setShowForm(false)}
                    onSave={() => { setShowForm(false); fetchPlans(); }}
                />
            )}
        </div>
    );
};

const FeatureRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="flex justify-between py-1.5 border-b border-white/5">
        <span className="text-slate-500">{label}</span>
        <span className="font-bold text-white uppercase text-xs">{value}</span>
    </div>
);

const FeatureBadge: React.FC<{ label: string }> = ({ label }) => (
    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px] font-bold uppercase tracking-wider">
        {label}
    </span>
);

const PlanFormModal: React.FC<{ plan: Plan | null; onClose: () => void; onSave: () => void }> = ({ plan, onClose, onSave }) => {
    const { addToast } = useToast();
    const [form, setForm] = useState({
        name: plan?.name || "",
        description: plan?.description || "",
        maxActiveProjects: plan?.maxActiveProjects || 10,
        maxAccessibilityReqs: plan?.maxAccessibilityReqs || 5,
        maxReportsPerMonth: plan?.maxReportsPerMonth || 10,
        maxAIAnalyses: plan?.maxAIAnalyses || 100,
        maxWorks: plan?.maxWorks || 50,
        maxEvents: plan?.maxEvents || 20,
        maxChildTenants: plan?.maxChildTenants || 0,
        maxUsers: plan?.maxUsers || 5,
        aiTier: plan?.aiTier || "BASIC",
        slaTier: plan?.slaTier || "STANDARD",
        supportResponseHours: plan?.supportResponseHours || 48,
        monthlyPrice: plan?.monthlyPrice || 0,
        hasExecutiveReports: plan?.hasExecutiveReports || false,
        hasLegalCompliance: plan?.hasLegalCompliance || false,
        hasAPIAccess: plan?.hasAPIAccess || false,
        hasWhiteLabel: plan?.hasWhiteLabel || false
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (plan) {
                await api.put(`/plans/${plan.id}`, form);
                addToast("Plano atualizado com sucesso!", "success");
            } else {
                await api.post("/plans", form);
                addToast("Plano criado com sucesso!", "success");
            }
            onSave();
        } catch (err: any) {
            addToast(err.response?.data?.message || "Erro ao salvar plano", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0f172a] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        {plan ? <Edit size={20} /> : <Plus size={20} />}
                        {plan ? "Editar Plano" : "Novo Plano"}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="col-span-1 sm:col-span-2">
                            <Input
                                label="Nome do Plano"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-span-1 sm:col-span-2">
                            <Textarea
                                label="Descrição"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <Input
                            label="Preço Mensal (R$)"
                            type="number"
                            value={form.monthlyPrice}
                            onChange={(e) => setForm({ ...form, monthlyPrice: Number(e.target.value) })}
                            leftIcon={<DollarSign size={16} />}
                        />
                        <Input
                            label="Max Obras"
                            type="number"
                            value={form.maxWorks}
                            onChange={(e) => setForm({ ...form, maxWorks: Number(e.target.value) })}
                            leftIcon={<Zap size={16} />}
                        />
                        <Input
                            label="Max Eventos"
                            type="number"
                            value={form.maxEvents}
                            onChange={(e) => setForm({ ...form, maxEvents: Number(e.target.value) })}
                        />
                        <Input
                            label="Max Projetos Ativos"
                            type="number"
                            value={form.maxActiveProjects}
                            onChange={(e) => setForm({ ...form, maxActiveProjects: Number(e.target.value) })}
                            leftIcon={<FileText size={16} />}
                        />
                        <Input
                            label="Max Usuários"
                            type="number"
                            value={form.maxUsers}
                            onChange={(e) => setForm({ ...form, maxUsers: Number(e.target.value) })}
                        />
                        <Input
                            label="Max Equipamentos Filhos"
                            type="number"
                            value={form.maxChildTenants}
                            onChange={(e) => setForm({ ...form, maxChildTenants: Number(e.target.value) })}
                        />

                        <Select
                            label="Tier IA"
                            value={form.aiTier}
                            onChange={(e) => setForm({ ...form, aiTier: e.target.value })}
                        >
                            <option value="BASIC">Básico</option>
                            <option value="CONTINUOUS">Contínuo</option>
                            <option value="ADVANCED">Avançado</option>
                        </Select>

                        <Select
                            label="SLA de Suporte"
                            value={form.slaTier}
                            onChange={(e) => setForm({ ...form, slaTier: e.target.value })}
                        >
                            <option value="STANDARD">Padrão (48h)</option>
                            <option value="EXTENDED">Estendido (24h)</option>
                            <option value="DEDICATED">Dedicado (4h)</option>
                        </Select>
                    </div>

                    <div className="space-y-3 p-4 bg-white/5 rounded-xl mb-8">
                        <p className="text-xs font-bold uppercase text-slate-500 mb-2">Recursos Inclusos</p>
                        <div className="grid grid-cols-2 gap-3">
                            <CheckboxField
                                label="Relatórios Executivos"
                                checked={form.hasExecutiveReports}
                                onChange={(v) => setForm({ ...form, hasExecutiveReports: v })}
                            />
                            <CheckboxField
                                label="Conformidade Jurídica"
                                checked={form.hasLegalCompliance}
                                onChange={(v) => setForm({ ...form, hasLegalCompliance: v })}
                            />
                            <CheckboxField
                                label="Acesso via API"
                                checked={form.hasAPIAccess}
                                onChange={(v) => setForm({ ...form, hasAPIAccess: v })}
                            />
                            <CheckboxField
                                label="Marca Branca (WL)"
                                checked={form.hasWhiteLabel}
                                onChange={(v) => setForm({ ...form, hasWhiteLabel: v })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-white/10 sticky bottom-0 bg-[#0f172a]">
                        <Button variant="outline" type="button" onClick={onClose} className="flex-1">Cancelar</Button>
                        <Button type="submit" disabled={saving} className="flex-1">
                            {saving ? "Salvando..." : "Salvar Plano"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CheckboxField: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, checked, onChange }) => (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${checked ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-transparent border-white/10 text-slate-400 hover:border-white/20'}`}
    >
        <div className={`w-4 h-4 rounded border flex items-center justify-center ${checked ? 'bg-blue-500 border-blue-500' : 'border-white/20'}`}>
            {checked && <CheckCircle2 size={12} className="text-white" />}
        </div>
        <span className="text-xs font-medium">{label}</span>
    </button>
);

export default MasterPlans;
