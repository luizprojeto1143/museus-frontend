import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { 
    Plus, 
    Edit, 
    Trash2, 
    Shield, 
    Zap, 
    FileText, 
    CheckCircle2, 
    DollarSign,
    Target,
    Layers,
    Cpu,
    Activity,
    Globe,
    Crown,
    ArrowUpRight,
    X,
    Server,
    ShieldCheck,
    BarChart,
    Diamond,
    Rocket,
    CloudCog,
    Briefcase,
    Gem,
    Workflow,
    RefreshCw,
    TrendingUp,
    ShieldAlert,
    User, Code,
} from "lucide-react";
import { 
    Button, 
    Input, 
    Select, 
    Textarea, 
    Card, 
    Badge, 
    AnimateIn,
    AnimatedCounter
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

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

export const MasterPlans: React.FC = () => {
    const { t } = useTranslation();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

    const fetchPlans = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get("/plans");
            setPlans(response.data || []);
        } catch (err: unknown) {
            toast.error("Erro na sincronização de camadas de serviço.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const deletePlan = async (id: string) => {
        if (!window.confirm("PROTOCOL: Tem certeza que deseja eliminar esta camada de serviço? Todas as instâncias vinculadas poderão ser afetadas.")) return;
        try {
            await api.delete(`/plans/${id}`);
            toast.success("Plano removido com sucesso.");
            fetchPlans();
        } catch (err: unknown) {
            toast.error("Erro ao excluir plano: verifique dependências ativas.");
        }
    };

    if (loading && plans.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">Modelando Camadas de Serviço...</p>
        </div>
    );

    return (
        <AnimateIn className="space-y-12 pb-32">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-blue-600/10 text-blue-400 border-none px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.3em] italic">
                            Subscription Architecture & Tiers
                        </Badge>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic leading-none">
                        Planos <span className="text-blue-600">SaaS Elite</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-xl max-w-3xl leading-relaxed">
                        Gestão estratégica de níveis de serviço, limites operacionais e paridade tecnológica para a rede global de museus.
                    </p>
                </div>
                
                <Button 
                    onClick={() => { setEditingPlan(null); setShowForm(true); }}
                    className="h-16 px-10 rounded-2xl bg-blue-600 text-white font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/20 active:scale-95 flex items-center gap-4"
                >
                    <Plus size={20} /> Provisionar Camada
                </Button>
            </div>

            {/* Strategic Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <Card className="p-8 bg-white/[0.02] border-white/5 rounded-[40px] flex items-center gap-6 group hover:border-blue-500/20 transition-all shadow-2xl relative overflow-hidden">
                    <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform shadow-xl">
                        <Diamond size={32} />
                    </div>
                    <div className="space-y-1 relative z-10">
                        <p className="text-[10px] font-black text-blue-400/50 uppercase tracking-widest italic leading-none">Tiers de Valor</p>
                        <p className="text-4xl font-black text-white tracking-tighter italic leading-none">
                            <AnimatedCounter value={plans.length} />
                        </p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-600/5 rounded-full blur-2xl pointer-events-none" />
                </Card>

                <Card className="p-8 bg-emerald-500/5 border-emerald-500/10 rounded-[40px] flex items-center gap-6 group hover:border-emerald-500/20 transition-all shadow-2xl relative overflow-hidden">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform shadow-xl">
                        <TrendingUp size={32} />
                    </div>
                    <div className="space-y-1 relative z-10">
                        <p className="text-[10px] font-black text-emerald-400/50 uppercase tracking-widest italic leading-none">Market Share</p>
                        <p className="text-4xl font-black text-white tracking-tighter italic leading-none">
                            <AnimatedCounter value={plans.reduce((acc, p) => acc + (p._count?.tenants || 0), 0)} />
                        </p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                </Card>

                <Card className="p-8 bg-amber-500/5 border-amber-500/10 rounded-[40px] flex items-center gap-6 group hover:border-amber-500/20 transition-all shadow-2xl relative overflow-hidden">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform shadow-xl">
                        <Crown size={32} />
                    </div>
                    <div className="space-y-1 relative z-10">
                        <p className="text-[10px] font-black text-amber-400/50 uppercase tracking-widest italic leading-none">Elite Adherence</p>
                        <p className="text-4xl font-black text-white tracking-tighter italic leading-none">84<span className="text-lg ml-1">%</span></p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                </Card>

                <Card className="p-8 bg-indigo-500/5 border-indigo-500/10 rounded-[40px] flex items-center gap-6 group hover:border-indigo-500/20 transition-all shadow-2xl relative overflow-hidden">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform shadow-xl">
                        <DollarSign size={32} />
                    </div>
                    <div className="space-y-1 relative z-10">
                        <p className="text-[10px] font-black text-indigo-400/50 uppercase tracking-widest italic leading-none">Revenue Node</p>
                        <p className="text-4xl font-black text-white tracking-tighter italic leading-none">72<span className="text-lg ml-1">k</span></p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                </Card>
            </div>

            {/* Plans Showcase Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <AnimatePresence mode="popLayout">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            transition={{ delay: idx * 0.1, ease: "circOut" }}
                            className="h-full"
                        >
                            <Card className="h-full bg-[#0b1120]/60 border-2 border-white/5 rounded-[56px] overflow-hidden flex flex-col group hover:bg-white/[0.04] hover:border-blue-500/30 transition-all duration-500 shadow-2xl relative border-t-white/10">
                                {/* Plan Identity Header */}
                                <div className="p-12 bg-gradient-to-br from-blue-600/20 to-indigo-600/5 border-b border-white/5 relative overflow-hidden">
                                    <div className="relative z-10 flex justify-between items-start">
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none group-hover:text-blue-400 transition-colors">{plan.name}</h2>
                                            <Badge variant="glass" className="bg-white/5 border-white/10 text-blue-400/70 text-[9px] font-black uppercase tracking-[0.2em] italic px-4 py-1.5 rounded-xl">
                                                {plan._count?.tenants || 0} Instâncias no Node
                                            </Badge>
                                        </div>
                                        <div className="w-14 h-14 bg-gradient-to-tr from-slate-900 to-slate-800 rounded-2xl flex items-center justify-center text-blue-500 border border-white/10 shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                                            {plan.monthlyPrice && plan.monthlyPrice > 1000 ? <Crown size={28} /> : plan.monthlyPrice && plan.monthlyPrice > 500 ? <Gem size={28} /> : <Rocket size={28} />}
                                        </div>
                                    </div>
                                    <div className="mt-12 flex items-baseline gap-3 relative z-10 group-hover:translate-x-1 transition-transform">
                                        <span className="text-xl font-black text-blue-500/50 uppercase tracking-widest italic">R$</span>
                                        <span className="text-6xl font-black text-white tracking-tighter italic leading-none drop-shadow-2xl">
                                            {(plan.monthlyPrice || 0).toLocaleString("pt-BR")}
                                        </span>
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic">/ ciclo</span>
                                    </div>
                                    <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-blue-600/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-blue-600/20 transition-all duration-1000" />
                                </div>

                                {/* Feature Matrix Content */}
                                <div className="p-12 flex-1 flex flex-col space-y-10 bg-black/20">
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed italic border-l-4 border-blue-600/40 pl-6 group-hover:text-slate-400 transition-colors">
                                        "{plan.description || "Solução estratégica provisionada para gestão municipal integrada e escalabilidade de rede global."}"
                                    </p>

                                    <div className="space-y-3">
                                        <FeatureRow label="Obras em Acervo" value={plan.maxWorks} icon={<Layers size={16} />} />
                                        <FeatureRow label="Projetos Ativos" value={plan.maxActiveProjects} icon={<Workflow size={16} />} />
                                        <FeatureRow label="Capacidade IA" value={aiTierLabels[plan.aiTier]} icon={<Cpu size={16} />} />
                                        <FeatureRow label="Acordo SLA" value={slaTierLabels[plan.slaTier]} icon={<ShieldCheck size={16} />} />
                                    </div>

                                    {/* Exclusive Modules */}
                                    <div className="pt-6 flex flex-wrap gap-3">
                                        {plan.hasExecutiveReports && <FeatureBadge label="Executive Reports" />}
                                        {plan.hasLegalCompliance && <FeatureBadge label="LBI Compliance" />}
                                        {plan.hasAPIAccess && <FeatureBadge label="API Hub Access" />}
                                        {plan.hasWhiteLabel && <FeatureBadge label="Full White Label" />}
                                    </div>

                                    {/* Action Hub */}
                                    <div className="pt-12 flex gap-4 mt-auto">
                                        <Button
                                            variant="glass"
                                            onClick={() => { setEditingPlan(plan); setShowForm(true); }}
                                            className="flex-1 h-14 rounded-2xl border-white/5 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white hover:border-blue-500/30 transition-all shadow-xl active:scale-95"
                                        >
                                            <Edit size={18} className="mr-3" /> Revisar Tier
                                        </Button>
                                        <button
                                            onClick={() => deletePlan(plan.id)}
                                            className="w-14 h-14 rounded-2xl bg-rose-500/5 text-rose-500/40 border border-rose-500/10 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all active:scale-95 group/del shadow-xl"
                                        >
                                            <Trash2 size={18} className="group-hover/del:scale-110 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none group-hover:opacity-100 opacity-20 transition-opacity" />
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Strategic Footer */}
            <div className="bg-[#0f172a]/60 p-12 rounded-[56px] border border-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group shadow-2xl">
                <div className="flex items-center gap-8 relative z-10">
                    <div className="w-20 h-20 bg-blue-600/10 rounded-[28px] flex items-center justify-center text-blue-500 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 border border-blue-500/20 shadow-xl">
                        <Briefcase size={40} />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-white font-black text-2xl italic tracking-tighter uppercase italic leading-none">Governança Comercial Master</h4>
                        <p className="text-sm text-slate-500 font-medium max-w-xl leading-relaxed italic mt-2">
                            A arquitetura de planos define a escalabilidade financeira e técnica de cada nodo da rede. Alterações em tiers de topo exigem auditoria de governança de nível 4.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-4 relative z-10">
                    <Badge variant="glass" className="bg-emerald-500/10 text-emerald-400 border-none px-8 py-4 text-[11px] font-black uppercase tracking-[0.3em] italic rounded-2xl flex items-center gap-3 shadow-xl border border-emerald-500/20">
                        <ShieldCheck size={18} /> Revenue Integrity: Secure
                    </Badge>
                </div>
                <div className="absolute top-[-50%] right-[-10%] w-[700px] h-[700px] bg-blue-600/5 rounded-full blur-[180px] pointer-events-none" />
            </div>

            {/* Modal de Formulário - Elite Architect UI */}
            <AnimatePresence>
                {showForm && (
                    <PlanFormModal
                        plan={editingPlan}
                        onClose={() => setShowForm(false)}
                        onSave={() => { setShowForm(false); fetchPlans(); }}
                    />
                )}
            </AnimatePresence>
        </AnimateIn>
    );
};

const FeatureRow: React.FC<{ label: string; value: string | number; icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="flex justify-between items-center py-4 border-b border-white/5 group/row">
        <div className="flex items-center gap-4">
            <span className="text-slate-600 group-hover/row:text-blue-500 transition-colors group-hover/row:scale-110 transition-transform">{icon}</span>
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] italic group-hover/row:text-slate-400 transition-colors">{label}</span>
        </div>
        <span className="font-black text-white text-sm italic tracking-tight group-hover/row:text-blue-200 transition-colors">{value}</span>
    </div>
);

const FeatureBadge: React.FC<{ label: string }> = ({ label }) => (
    <span className="px-4 py-2 bg-blue-600/5 text-blue-400 border border-blue-500/10 rounded-xl text-[8px] font-black uppercase tracking-widest italic group-hover:bg-blue-600/10 transition-all">
        {label}
    </span>
);

const PlanFormModal: React.FC<{ plan: Plan | null; onClose: () => void; onSave: () => void }> = ({ plan, onClose, onSave }) => {
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
                toast.success("Plano atualizado estrategicamente.");
            } else {
                await api.post("/plans", form);
                toast.success("Nova camada de serviço provisionada.");
            }
            onSave();
        } catch (err: unknown) {
            toast.error("Erro na autorização do plano.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-[#0b1120] border-2 border-white/10 w-full max-w-4xl rounded-[64px] shadow-[0_0_80px_rgba(37,99,235,0.2)] overflow-hidden max-h-[90vh] flex flex-col"
            >
                {/* Modal Header */}
                <div className="p-12 border-b border-white/5 flex items-center justify-between bg-white/[0.02] relative">
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 rounded-[24px] bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-xl">
                            <CloudCog size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase leading-none">
                                {plan ? "Revisar Camada" : "Forjar Novo Tier"}
                            </h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mt-2 italic">Architect Tablet: SaaS Strategy Module</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-14 h-14 rounded-2xl bg-white/5 text-slate-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center border border-white/5 group">
                        <X size={24} className="group-hover:rotate-90 transition-transform" />
                    </button>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
                </div>

                <form onSubmit={handleSubmit} className="p-12 overflow-y-auto custom-scrollbar space-y-12 bg-black/20">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic">Identidade Comercial do Tier</label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="EX: Enterprise Pro" className="h-16 bg-white/5 border-white/10 rounded-2xl px-8 text-white font-black italic tracking-tight" />
                        </div>
                        <div className="space-y-4 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic">Narrativa Estratégica</label>
                            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Descreva o posicionamento de valor deste plano..." className="bg-white/5 border-white/10 rounded-[32px] p-8 text-white font-medium italic leading-relaxed resize-none min-h-[120px]" />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic">Precificação Mensal (BRL)</label>
                            <div className="relative">
                                <Input type="number" step="0.01" value={form.monthlyPrice} onChange={(e) => setForm({ ...form, monthlyPrice: Number(e.target.value) })} className="h-16 bg-white/5 border-white/10 rounded-2xl pl-16 pr-8 font-black text-blue-400" />
                                <DollarSign size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic">Protocolo de Inteligência IA</label>
                            <div className="relative">
                                <Select value={form.aiTier} onChange={(e) => setForm({ ...form, aiTier: e.target.value })} className="h-16 bg-white/5 border-white/10 rounded-2xl px-8 font-black uppercase tracking-widest text-white appearance-none">
                                    <option value="BASIC" className="bg-slate-950">Basic (Legacy Engine)</option>
                                    <option value="CONTINUOUS" className="bg-slate-950">Continuous (GPT-4o Mesh)</option>
                                    <option value="ADVANCED" className="bg-slate-950">Advanced (Neural Custom)</option>
                                </Select>
                                <Cpu size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Operational Limits Matrix */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4 text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] italic">
                            <Server size={18} /> Operational Limits Matrix
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { id: 'maxWorks', label: 'Obras', icon: <Layers size={14} /> },
                                { id: 'maxActiveProjects', label: 'Projetos', icon: <Workflow size={14} /> },
                                { id: 'maxAIAnalyses', label: 'IA Tokens', icon: <Cpu size={14} /> },
                                { id: 'maxUsers', label: 'Users', icon: <User size={14} /> }
                            ].map(limit => (
                                <div key={limit.id} className="space-y-3">
                                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest italic ml-4">
                                        {limit.icon} {limit.label}
                                    </div>
                                    <Input 
                                        type="number" 
                                        value={form[limit.id as keyof typeof form] as number} 
                                        onChange={(e) => setForm({ ...form, [limit.id]: Number(e.target.value) })} 
                                        className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 font-black text-center" 
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Feature Toggles */}
                    <div className="p-10 bg-white/[0.01] border-2 border-white/5 rounded-[48px] space-y-8">
                        <div className="flex items-center gap-4 text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] italic leading-none mb-4">
                            <Zap size={18} /> Entitlements & Premium Módulos
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                { id: 'hasExecutiveReports', label: 'Executive Insights', icon: <BarChart size={16} /> },
                                { id: 'hasLegalCompliance', label: 'LBI Governance', icon: <Shield size={16} /> },
                                { id: 'hasAPIAccess', label: 'API Sovereign Hub', icon: <Code size={16} /> },
                                { id: 'hasWhiteLabel', label: 'Full White Label', icon: <Globe size={16} /> }
                            ].map(feature => (
                                <button
                                    key={feature.id}
                                    type="button"
                                    onClick={() => setForm({ ...form, [feature.id]: !form[feature.id as keyof typeof form] })}
                                    className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all duration-500 group/btn ${
                                        form[feature.id as keyof typeof form] 
                                        ? 'bg-blue-600/10 border-blue-500/40 text-white shadow-[0_0_30px_rgba(37,99,235,0.1)]' 
                                        : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${form[feature.id as keyof typeof form] ? 'bg-blue-600 text-white shadow-xl' : 'bg-white/5 text-slate-600'}`}>
                                            {feature.icon}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">{feature.label}</span>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${form[feature.id as keyof typeof form] ? 'bg-blue-500 text-white shadow-lg' : 'border-2 border-white/10'}`}>
                                        {form[feature.id as keyof typeof form] && <CheckCircle2 size={14} />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-6 pt-10">
                        <Button 
                            variant="glass" 
                            type="button" 
                            onClick={onClose} 
                            className="h-20 flex-1 rounded-[24px] border-white/5 text-slate-500 font-black uppercase text-xs tracking-widest hover:bg-rose-500/10 hover:text-rose-500 transition-all shadow-xl"
                        >
                            Abortar Design
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={saving} 
                            className="h-20 flex-[1.5] rounded-[24px] bg-blue-600 text-white font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-blue-600/30 hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center gap-4 group"
                        >
                            {saving ? (
                                <>
                                    <RefreshCw size={20} className="animate-spin" /> Sincronizando...
                                </>
                            ) : (
                                <>
                                    Confirmar Provisionamento <ShieldCheck size={20} className="group-hover:scale-110 transition-transform" />
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default MasterPlans;
