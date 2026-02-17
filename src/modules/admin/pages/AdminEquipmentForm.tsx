import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../api/client";
import { useToast } from "../../../contexts/ToastContext";
import {
    Landmark, Save, ArrowLeft, Building2,
    Tent, Music, Mail, Lock, User, Globe, CheckCircle2
} from "lucide-react";
import { Button, Input, Select } from "../../../components/ui";
import "./AdminShared.css";

type EquipmentType = "MUSEUM" | "CULTURAL_SPACE" | "PRODUCER";

export const AdminEquipmentForm: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const isNew = id === 'novo' || !id;

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form Data
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [type, setType] = useState<EquipmentType>("MUSEUM");

    // Admin Credentials (only for new)
    const [adminName, setAdminName] = useState("");
    const [adminEmail, setAdminEmail] = useState("");
    const [adminPassword, setAdminPassword] = useState("");

    // Basic Features (Simplified)
    const [featureEvents, setFeatureEvents] = useState(true);
    const [featureWorks, setFeatureWorks] = useState(true);
    const [featureGamification, setFeatureGamification] = useState(false);

    useEffect(() => {
        if (!isNew && id) {
            loadEquipment();
        }
    }, [id, isNew]);

    const loadEquipment = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/tenants/${id}`);
            const data = res.data;

            setName(data.name);
            setSlug(data.slug);
            setType(data.type);

            // Load features
            setFeatureEvents(data.featureEvents ?? true);
            setFeatureWorks(data.featureWorks ?? true);
            setFeatureGamification(data.featureGamification ?? false);

        } catch (error) {
            console.error(error);
            addToast("Erro ao carregar equipamento. Verifique suas permissões.", "error");
            navigate("/admin/equipamentos");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload: any = {
                name,
                slug,
                type,
                featureEvents,
                featureWorks,
                featureGamification,
                // Defaults
                plan: "START",
                isCityMode: false
            };

            if (isNew) {
                payload.adminName = adminName;
                payload.adminEmail = adminEmail;
                payload.adminPassword = adminPassword;

                await api.post("/tenants", payload);
                addToast("Equipamento criado com sucesso!", "success");
            } else {
                await api.put(`/tenants/${id}`, payload);
                addToast("Equipamento atualizado com sucesso!", "success");
            }

            navigate("/admin/equipamentos");

        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.message || "Erro ao salvar equipamento";
            addToast(msg, "error");
        } finally {
            setSaving(false);
        }
    };

    const typeOptions = [
        { value: "MUSEUM", label: "Museu / Memorial", icon: <Landmark size={20} /> },
        { value: "CULTURAL_SPACE", label: "Espaço Cultural / Teatro", icon: <Tent size={20} /> },
        { value: "PRODUCER", label: "Produtora / Coletivo", icon: <Music size={20} /> }
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[var(--bg-root)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[var(--fg-muted)] text-sm">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-form-container">
            {/* Header */}
            <div className="admin-wizard-header">
                <Button
                    onClick={() => navigate("/admin/equipamentos")}
                    variant="ghost"
                    className="p-0 text-[var(--fg-muted)] hover:text-white"
                >
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="admin-wizard-title">
                        {isNew ? "Novo Equipamento Cultural" : "Editar Equipamento"}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 pb-24">
                {/* Basic Info */}
                <div className="admin-section">
                    <h3 className="admin-section-title">
                        <Building2 className="text-[var(--accent-gold)]" size={20} /> Identificação
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group md:col-span-2">
                            <label className="text-xs font-bold text-[var(--fg-muted)] uppercase mb-2 block">Tipo de Equipamento</label>
                            <div className="grid grid-cols-3 gap-4">
                                {typeOptions.map(opt => (
                                    <div
                                        key={opt.value}
                                        onClick={() => setType(opt.value as any)}
                                        className={`cursor-pointer p-4 rounded-xl border transition-all flex flex-col items-center gap-2 text-center
                                            ${type === opt.value
                                                ? 'bg-[var(--accent-gold)]/10 border-[var(--accent-gold)] text-[var(--accent-gold)]'
                                                : 'bg-[var(--bg-surface-active)] border-[var(--border-subtle)] hover:bg-[var(--bg-surface-hover)]'
                                            }
                                        `}
                                    >
                                        {opt.icon}
                                        <span className="font-bold text-sm">{opt.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <Input
                                label="Nome Oficial"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Ex: Teatro Municipal"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <Input
                                label="Slug (URL)"
                                value={slug}
                                onChange={e => setSlug(e.target.value)}
                                placeholder="ex: teatro-municipal"
                                required
                                leftIcon={<Globe size={16} />}
                                style={{ fontFamily: 'monospace' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Credentials (Only for New) */}
                {isNew && (
                    <div className="admin-section">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="admin-section-title mb-0">
                                <User className="text-[var(--accent-gold)]" size={20} /> Acesso Administrativo
                            </h3>
                            <span className="text-xs text-[var(--accent-gold)] bg-[var(--accent-gold)]/10 px-2 py-1 rounded">
                                Primeiro Administrador
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group">
                                <Input
                                    label="Nome do Gestor"
                                    value={adminName}
                                    onChange={e => setAdminName(e.target.value)}
                                    placeholder="Nome completo"
                                    required
                                    leftIcon={<User size={16} />}
                                />
                            </div>
                            <div className="form-group">
                                <Input
                                    label="E-mail de Login"
                                    type="email"
                                    value={adminEmail}
                                    onChange={e => setAdminEmail(e.target.value)}
                                    placeholder="gestor@cultura.gov.br"
                                    required
                                    leftIcon={<Mail size={16} />}
                                />
                            </div>
                            <div className="form-group md:col-span-2">
                                <Input
                                    label="Senha Inicial"
                                    type="password"
                                    value={adminPassword}
                                    onChange={e => setAdminPassword(e.target.value)}
                                    placeholder="********"
                                    required
                                    leftIcon={<Lock size={16} />}
                                />
                                <p className="text-xs text-[var(--fg-muted)] mt-2">
                                    O gestor poderá alterar esta senha no primeiro acesso.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modules */}
                <div className="admin-section">
                    <h3 className="admin-section-title">
                        <CheckCircle2 className="text-[var(--accent-gold)]" size={20} /> Módulos Habilitados
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div
                            onClick={() => setFeatureWorks(!featureWorks)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${featureWorks ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-[var(--bg-surface-active)] border-[var(--border-subtle)]'}`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${featureWorks ? 'bg-emerald-500 border-emerald-500' : 'border-[var(--fg-muted)]'}`}>
                                    {featureWorks && <CheckCircle2 size={12} className="text-black" />}
                                </div>
                                <span className="font-bold text-[var(--fg-main)]">Acervo & Obras</span>
                            </div>
                            <p className="text-xs text-[var(--fg-muted)]">Permite cadastrar obras, peças e itens do acervo.</p>
                        </div>

                        <div
                            onClick={() => setFeatureEvents(!featureEvents)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${featureEvents ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-[var(--bg-surface-active)] border-[var(--border-subtle)]'}`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${featureEvents ? 'bg-emerald-500 border-emerald-500' : 'border-[var(--fg-muted)]'}`}>
                                    {featureEvents && <CheckCircle2 size={12} className="text-black" />}
                                </div>
                                <span className="font-bold text-[var(--fg-main)]">Agenda de Eventos</span>
                            </div>
                            <p className="text-xs text-[var(--fg-muted)]">Gestão de eventos, ingressos e calendário.</p>
                        </div>

                        <div
                            onClick={() => setFeatureGamification(!featureGamification)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${featureGamification ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-[var(--bg-surface-active)] border-[var(--border-subtle)]'}`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${featureGamification ? 'bg-emerald-500 border-emerald-500' : 'border-[var(--fg-muted)]'}`}>
                                    {featureGamification && <CheckCircle2 size={12} className="text-black" />}
                                </div>
                                <span className="font-bold text-[var(--fg-main)]">Gamificação</span>
                            </div>
                            <p className="text-xs text-[var(--fg-muted)]">Ranking, visitas premiadas e caça ao tesouro.</p>
                        </div>
                    </div>
                </div>

                <div className="admin-wizard-footer">
                    <div className="admin-wizard-footer-inner">
                        <Button
                            type="button"
                            onClick={() => navigate("/admin/equipamentos")}
                            variant="ghost"
                            className="text-[var(--fg-muted)] hover:text-white"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            isLoading={saving}
                            className="btn-primary"
                            leftIcon={!saving ? <Save size={18} /> : undefined}
                        >
                            {isNew ? "Criar Equipamento" : "Salvar Alterações"}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};
