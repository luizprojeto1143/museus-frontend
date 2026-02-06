import React, { useEffect, useState } from "react";
import { api } from "../../../api/client";
import { Link } from "react-router-dom";

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
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await api.get("/plans");
            setPlans(response.data);
        } catch (err) {
            console.error("Erro ao carregar planos", err);
        } finally {
            setLoading(false);
        }
    };

    const deletePlan = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este plano?")) return;
        try {
            await api.delete(`/plans/${id}`);
            fetchPlans();
        } catch (err: any) {
            alert(err.response?.data?.message || "Erro ao excluir plano");
        }
    };

    if (loading) {
        return <div style={{ padding: 32, textAlign: "center" }}>Carregando...</div>;
    }

    return (
        <div style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>Planos Contratuais</h1>
                <button
                    onClick={() => { setEditingPlan(null); setShowForm(true); }}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#7c3aed",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontWeight: 600
                    }}
                >
                    + Novo Plano
                </button>
            </div>

            {/* Plans Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 24 }}>
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        style={{
                            backgroundColor: "white",
                            borderRadius: 12,
                            overflow: "hidden",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                        }}
                    >
                        <div style={{ backgroundColor: "#7c3aed", color: "white", padding: 16 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 700 }}>{plan.name}</h2>
                            {plan.monthlyPrice && (
                                <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>
                                    R$ {plan.monthlyPrice.toLocaleString("pt-BR")}/mês
                                </div>
                            )}
                        </div>

                        <div style={{ padding: 16 }}>
                            {plan.description && (
                                <p style={{ color: "#6b7280", marginBottom: 16 }}>{plan.description}</p>
                            )}

                            <div style={{ fontSize: 14, color: "#374151" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb" }}>
                                    <span>Obras</span>
                                    <strong>{plan.maxWorks}</strong>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb" }}>
                                    <span>Eventos</span>
                                    <strong>{plan.maxEvents}</strong>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb" }}>
                                    <span>Projetos Ativos</span>
                                    <strong>{plan.maxActiveProjects}</strong>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb" }}>
                                    <span>Usuários</span>
                                    <strong>{plan.maxUsers}</strong>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb" }}>
                                    <span>Equipamentos Filhos</span>
                                    <strong>{plan.maxChildTenants}</strong>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb" }}>
                                    <span>IA</span>
                                    <strong>{aiTierLabels[plan.aiTier]}</strong>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb" }}>
                                    <span>SLA</span>
                                    <strong>{slaTierLabels[plan.slaTier]}</strong>
                                </div>
                            </div>

                            {/* Features */}
                            <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {plan.hasExecutiveReports && <Badge label="Relatórios Executivos" />}
                                {plan.hasLegalCompliance && <Badge label="Conformidade Legal" />}
                                {plan.hasAPIAccess && <Badge label="API" />}
                                {plan.hasWhiteLabel && <Badge label="White Label" />}
                            </div>

                            {/* Tenants count */}
                            <div style={{ marginTop: 16, padding: 12, backgroundColor: "#f3f4f6", borderRadius: 8, textAlign: "center" }}>
                                <span style={{ color: "#6b7280" }}>
                                    {plan._count?.tenants || 0} tenant(s) usando este plano
                                </span>
                            </div>

                            {/* Actions */}
                            <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
                                <button
                                    onClick={() => { setEditingPlan(plan); setShowForm(true); }}
                                    style={{
                                        flex: 1,
                                        padding: 10,
                                        backgroundColor: "#e0e7ff",
                                        color: "#4338ca",
                                        border: "none",
                                        borderRadius: 6,
                                        cursor: "pointer",
                                        fontWeight: 500
                                    }}
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => deletePlan(plan.id)}
                                    style={{
                                        flex: 1,
                                        padding: 10,
                                        backgroundColor: "#fee2e2",
                                        color: "#dc2626",
                                        border: "none",
                                        borderRadius: 6,
                                        cursor: "pointer",
                                        fontWeight: 500
                                    }}
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Form Modal */}
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

const Badge: React.FC<{ label: string }> = ({ label }) => (
    <span style={{
        padding: "4px 10px",
        backgroundColor: "#ddd6fe",
        color: "#6d28d9",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500
    }}>
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
            } else {
                await api.post("/plans", form);
            }
            onSave();
        } catch (err: any) {
            alert(err.response?.data?.message || "Erro ao salvar plano");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: "white",
                borderRadius: 12,
                padding: 24,
                width: "100%",
                maxWidth: 600,
                maxHeight: "90vh",
                overflow: "auto"
            }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>
                    {plan ? "Editar Plano" : "Novo Plano"}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div style={{ gridColumn: "span 2" }}>
                            <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Nome</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                                style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 6 }}
                            />
                        </div>

                        <div style={{ gridColumn: "span 2" }}>
                            <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Descrição</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 6 }}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Preço Mensal (R$)</label>
                            <input
                                type="number"
                                value={form.monthlyPrice}
                                onChange={(e) => setForm({ ...form, monthlyPrice: Number(e.target.value) })}
                                style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 6 }}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Max Obras</label>
                            <input
                                type="number"
                                value={form.maxWorks}
                                onChange={(e) => setForm({ ...form, maxWorks: Number(e.target.value) })}
                                style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 6 }}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Max Eventos</label>
                            <input
                                type="number"
                                value={form.maxEvents}
                                onChange={(e) => setForm({ ...form, maxEvents: Number(e.target.value) })}
                                style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 6 }}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Max Projetos Ativos</label>
                            <input
                                type="number"
                                value={form.maxActiveProjects}
                                onChange={(e) => setForm({ ...form, maxActiveProjects: Number(e.target.value) })}
                                style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 6 }}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Max Usuários</label>
                            <input
                                type="number"
                                value={form.maxUsers}
                                onChange={(e) => setForm({ ...form, maxUsers: Number(e.target.value) })}
                                style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 6 }}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Max Equipamentos Filhos</label>
                            <input
                                type="number"
                                value={form.maxChildTenants}
                                onChange={(e) => setForm({ ...form, maxChildTenants: Number(e.target.value) })}
                                style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 6 }}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Tier IA</label>
                            <select
                                value={form.aiTier}
                                onChange={(e) => setForm({ ...form, aiTier: e.target.value })}
                                style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 6 }}
                            >
                                <option value="BASIC">Básico</option>
                                <option value="CONTINUOUS">Contínuo</option>
                                <option value="ADVANCED">Avançado</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Tier SLA</label>
                            <select
                                value={form.slaTier}
                                onChange={(e) => setForm({ ...form, slaTier: e.target.value })}
                                style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 6 }}
                            >
                                <option value="STANDARD">Padrão (48h)</option>
                                <option value="EXTENDED">Estendido (24h)</option>
                                <option value="DEDICATED">Dedicado (4h)</option>
                            </select>
                        </div>

                        {/* Checkboxes */}
                        <div style={{ gridColumn: "span 2", display: "flex", flexWrap: "wrap", gap: 16, marginTop: 8 }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                                <input
                                    type="checkbox"
                                    checked={form.hasExecutiveReports}
                                    onChange={(e) => setForm({ ...form, hasExecutiveReports: e.target.checked })}
                                />
                                Relatórios Executivos
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                                <input
                                    type="checkbox"
                                    checked={form.hasLegalCompliance}
                                    onChange={(e) => setForm({ ...form, hasLegalCompliance: e.target.checked })}
                                />
                                Conformidade Legal
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                                <input
                                    type="checkbox"
                                    checked={form.hasAPIAccess}
                                    onChange={(e) => setForm({ ...form, hasAPIAccess: e.target.checked })}
                                />
                                Acesso API
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                                <input
                                    type="checkbox"
                                    checked={form.hasWhiteLabel}
                                    onChange={(e) => setForm({ ...form, hasWhiteLabel: e.target.checked })}
                                />
                                White Label
                            </label>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: 12,
                                backgroundColor: "#f3f4f6",
                                border: "none",
                                borderRadius: 8,
                                cursor: "pointer",
                                fontWeight: 500
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                flex: 1,
                                padding: 12,
                                backgroundColor: "#7c3aed",
                                color: "white",
                                border: "none",
                                borderRadius: 8,
                                cursor: "pointer",
                                fontWeight: 600
                            }}
                        >
                            {saving ? "Salvando..." : "Salvar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MasterPlans;
