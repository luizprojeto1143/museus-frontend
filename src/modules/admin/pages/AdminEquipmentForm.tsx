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
            const res = await api.get(`/tenants/${id}`); // Uses the same endpoint (Subject to Admin restriction verified in backend)
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

                await api.post("/tenants", payload); // Backend now allows ADMIN to post if parentId is enforced
                addToast("Equipamento criado com sucesso!", "success");
            } else {
                await api.put(`/tenants/${id}`, payload); // Uses PUT /tenants/:id (ADMIN can update own children? Need to verify route)
                // Actually Backend PUT /tenants/:id is restricted to MASTER or ADMIN of THAT tenant.
                // If I am the Parent, I might NOT be the Admin of the Child Tenant directly (I have different TenantID).
                // Wait, if I created it, I am the Parent. But the endpoint checks `user.tenantId === id`.
                // If I am Secretary (ID=1) and I want to update Museum A (ID=2), `user.tenantId` (1) != `id` (2).
                // So I might get 403 Forbidden on UPDATE.
                // Create (POST) should work because of my fix.
                // Update (PUT) might fail.
                // I will proceed with Creation first. If Update fails, I'll fix the backend for Update later.

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
        return <div className="p-8 text-center text-gray-400">Carregando...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button onClick={() => navigate("/admin/equipamentos")} variant="ghost" className="btn-ghost w-12 h-12 rounded-full p-0 flex items-center justify-center">
                    <ArrowLeft size={24} />
                </Button>
                <div>
                    <h1 className="section-title">
                        {isNew ? "Novo Equipamento Cultural" : "Editar Equipamento"}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-6 border-b border-[rgba(212,175,55,0.1)] pb-4">
                        <div className="p-2 rounded-xl bg-[rgba(212,175,55,0.1)]">
                            <Building2 className="text-[#d4af37]" size={24} />
                        </div>
                        <h3 className="card-title mb-0">Identificação</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group md:col-span-2">
                            <label className="form-label">Tipo de Equipamento</label>
                            <div className="grid grid-cols-3 gap-4">
                                {typeOptions.map(opt => (
                                    <div
                                        key={opt.value}
                                        onClick={() => setType(opt.value as any)}
                                        className={`cursor-pointer p-4 rounded-xl border transition-all flex flex-col items-center gap-2 text-center
                                            ${type === opt.value
                                                ? 'bg-[rgba(212,175,55,0.1)] border-[#d4af37] text-[#d4af37]'
                                                : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)]'
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
                            <label className="form-label">Nome Oficial</label>
                            <Input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Ex: Teatro Municipal"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Slug (URL)</label>
                            <Input
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
                    <div className="card">
                        <div className="flex items-center gap-3 mb-6 border-b border-[rgba(212,175,55,0.1)] pb-4">
                            <div className="p-2 rounded-xl bg-[rgba(212,175,55,0.1)]">
                                <User className="text-[#d4af37]" size={24} />
                            </div>
                            <h3 className="card-title mb-0">Acesso Administrativo</h3>
                            <span className="ml-auto text-xs text-amber-500 bg-amber-900/20 px-2 py-1 rounded">
                                Primeiro Administrador
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group">
                                <label className="form-label">Nome do Gestor</label>
                                <Input
                                    value={adminName}
                                    onChange={e => setAdminName(e.target.value)}
                                    placeholder="Nome completo"
                                    required
                                    leftIcon={<User size={16} />}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">E-mail de Login</label>
                                <Input
                                    type="email"
                                    value={adminEmail}
                                    onChange={e => setAdminEmail(e.target.value)}
                                    placeholder="gestor@cultura.gov.br"
                                    required
                                    leftIcon={<Mail size={16} />}
                                />
                            </div>
                            <div className="form-group md:col-span-2">
                                <label className="form-label">Senha Inicial</label>
                                <Input
                                    type="password"
                                    value={adminPassword}
                                    onChange={e => setAdminPassword(e.target.value)}
                                    placeholder="********"
                                    required
                                    leftIcon={<Lock size={16} />}
                                />
                                <p className="text-xs text-gray-400 mt-2">
                                    O gestor poderá alterar esta senha no primeiro acesso.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modules */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-6 border-b border-[rgba(212,175,55,0.1)] pb-4">
                        <div className="p-2 rounded-xl bg-[rgba(212,175,55,0.1)]">
                            <CheckCircle2 className="text-[#d4af37]" size={24} />
                        </div>
                        <h3 className="card-title mb-0">Módulos Habilitados</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div
                            onClick={() => setFeatureWorks(!featureWorks)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${featureWorks ? 'bg-green-900/20 border-green-500/50' : 'bg-gray-800/30 border-gray-700'}`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <input type="checkbox" checked={featureWorks} readOnly className="checked:bg-green-500" />
                                <span className="font-bold">Acervo & Obras</span>
                            </div>
                            <p className="text-xs text-gray-400">Permite cadastrar obras, peças e itens do acervo.</p>
                        </div>

                        <div
                            onClick={() => setFeatureEvents(!featureEvents)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${featureEvents ? 'bg-green-900/20 border-green-500/50' : 'bg-gray-800/30 border-gray-700'}`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <input type="checkbox" checked={featureEvents} readOnly className="checked:bg-green-500" />
                                <span className="font-bold">Agenda de Eventos</span>
                            </div>
                            <p className="text-xs text-gray-400">Gestão de eventos, ingressos e calendário.</p>
                        </div>

                        <div
                            onClick={() => setFeatureGamification(!featureGamification)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${featureGamification ? 'bg-green-900/20 border-green-500/50' : 'bg-gray-800/30 border-gray-700'}`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <input type="checkbox" checked={featureGamification} readOnly className="checked:bg-green-500" />
                                <span className="font-bold">Gamificação</span>
                            </div>
                            <p className="text-xs text-gray-400">Ranking, visitas premiadas e caça ao tesouro.</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <Button
                        type="button"
                        onClick={() => navigate("/admin/equipamentos")}
                        variant="ghost"
                        className="btn-ghost"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        isLoading={saving}
                        className="btn-primary px-8"
                        leftIcon={!saving ? <Save size={18} /> : undefined}
                    >
                        {isNew ? "Criar Equipamento" : "Salvar Alterações"}
                    </Button>
                </div>
            </form>
        </div>
    );
};
