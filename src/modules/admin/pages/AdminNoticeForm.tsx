import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { Input, Select, Textarea, Button } from "../../../components/ui";
import { ArrowLeft, Save, Calendar, DollarSign, FileText, MapPin, X, Plus } from "lucide-react";

const STATUS_OPTIONS = [
    { value: "DRAFT", label: "Rascunho" },
    { value: "PUBLISHED", label: "Publicado" },
    { value: "INSCRIPTIONS_OPEN", label: "Inscrições Abertas" },
    { value: "INSCRIPTIONS_CLOSED", label: "Inscrições Encerradas" },
    { value: "EVALUATION", label: "Em Avaliação" },
    { value: "RESULTS_PUBLISHED", label: "Resultados Publicados" },
    { value: "FINISHED", label: "Finalizado" }
];

const CULTURAL_CATEGORIES = [
    "Artes Visuais", "Música", "Teatro", "Dança", "Literatura",
    "Audiovisual", "Patrimônio Cultural", "Cultura Popular", "Artesanato"
];

export const AdminNoticeForm: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const { addToast } = useToast();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        inscriptionStart: "",
        inscriptionEnd: "",
        resultsDate: "",
        executionEnd: "",
        totalBudget: "",
        maxPerProject: "",
        culturalCategories: [] as string[],
        targetRegions: [] as string[],
        status: "DRAFT",
        documentUrl: "",
        requiresAccessibilityPlan: true
    });

    const [newRegion, setNewRegion] = useState("");

    useEffect(() => {
        if (id && tenantId) {
            setLoading(true);
            api.get(`/notices/${id}`)
                .then(res => {
                    const data = res.data;
                    setFormData({
                        title: data.title || "",
                        description: data.description || "",
                        inscriptionStart: data.inscriptionStart ? data.inscriptionStart.split("T")[0] : "",
                        inscriptionEnd: data.inscriptionEnd ? data.inscriptionEnd.split("T")[0] : "",
                        resultsDate: data.resultsDate ? data.resultsDate.split("T")[0] : "",
                        executionEnd: data.executionEnd ? data.executionEnd.split("T")[0] : "",
                        totalBudget: data.totalBudget?.toString() || "",
                        maxPerProject: data.maxPerProject?.toString() || "",
                        culturalCategories: data.culturalCategories || [],
                        targetRegions: data.targetRegions || [],
                        status: data.status || "DRAFT",
                        documentUrl: data.documentUrl || "",
                        requiresAccessibilityPlan: data.requiresAccessibilityPlan ?? true
                    });
                })
                .catch(err => {
                    console.error(err);
                    addToast("Erro ao carregar edital", "error");
                })
                .finally(() => setLoading(false));
        }
    }, [id, tenantId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenantId) {
            addToast("Erro de autenticação", "error");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...formData,
                tenantId,
                inscriptionStart: formData.inscriptionStart ? new Date(formData.inscriptionStart).toISOString() : null,
                inscriptionEnd: formData.inscriptionEnd ? new Date(formData.inscriptionEnd).toISOString() : null,
                resultsDate: formData.resultsDate ? new Date(formData.resultsDate).toISOString() : null,
                executionEnd: formData.executionEnd ? new Date(formData.executionEnd).toISOString() : null,
                totalBudget: formData.totalBudget ? parseFloat(formData.totalBudget) : null,
                maxPerProject: formData.maxPerProject ? parseFloat(formData.maxPerProject) : null
            };

            if (isEdit) {
                await api.put(`/notices/${id}`, payload);
            } else {
                await api.post("/notices", payload);
            }
            addToast(isEdit ? "Edital atualizado com sucesso!" : "Edital criado com sucesso!", "success");
            navigate("/admin/editais");
        } catch (error) {
            console.error("Erro ao salvar edital:", error);
            addToast("Erro ao salvar edital. Verifique os dados.", "error");
        } finally {
            setSaving(false);
        }
    };

    const toggleCategory = (cat: string) => {
        setFormData(prev => ({
            ...prev,
            culturalCategories: prev.culturalCategories.includes(cat)
                ? prev.culturalCategories.filter(c => c !== cat)
                : [...prev.culturalCategories, cat]
        }));
    };

    const addRegion = () => {
        if (newRegion.trim() && !formData.targetRegions.includes(newRegion.trim())) {
            setFormData(prev => ({
                ...prev,
                targetRegions: [...prev.targetRegions, newRegion.trim()]
            }));
            setNewRegion("");
        }
    };

    const removeRegion = (region: string) => {
        setFormData(prev => ({
            ...prev,
            targetRegions: prev.targetRegions.filter(r => r !== region)
        }));
    };

    if (loading) {
        return <div className="text-center p-8">Carregando edital...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" onClick={() => navigate("/admin/editais")} className="p-2">
                    <ArrowLeft size={24} />
                </Button>
                <div>
                    <h1 className="section-title">{isEdit ? "Editar Edital" : "Novo Edital"}</h1>
                    <p className="section-subtitle">
                        {isEdit ? "Atualize as informações do edital público" : "Crie um novo edital de fomento cultural"}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informações Básicas */}
                <div className="card">
                    <h2 className="card-title flex items-center gap-2 mb-6">
                        <FileText size={20} className="text-gold" /> Informações Básicas
                    </h2>

                    <Input
                        label="Título do Edital *"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ex: Edital de Fomento à Cultura 2024"
                        required
                    />

                    <Textarea
                        label="Descrição"
                        rows={4}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Descreva os objetivos, público-alvo e regras do edital..."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Status"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                        >
                            {STATUS_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </Select>

                        <Input
                            label="Link do Documento (PDF)"
                            type="url"
                            value={formData.documentUrl}
                            onChange={e => setFormData({ ...formData, documentUrl: e.target.value })}
                            placeholder="https://exemplo.com/edital.pdf"
                        />
                    </div>
                </div>

                {/* Datas */}
                <div className="card">
                    <h2 className="card-title flex items-center gap-2 mb-6">
                        <Calendar size={20} className="text-gold" /> Cronograma
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Início das Inscrições *"
                            type="date"
                            value={formData.inscriptionStart}
                            onChange={e => setFormData({ ...formData, inscriptionStart: e.target.value })}
                            required
                        />
                        <Input
                            label="Fim das Inscrições *"
                            type="date"
                            value={formData.inscriptionEnd}
                            onChange={e => setFormData({ ...formData, inscriptionEnd: e.target.value })}
                            required
                        />
                        <Input
                            label="Data de Divulgação dos Resultados"
                            type="date"
                            value={formData.resultsDate}
                            onChange={e => setFormData({ ...formData, resultsDate: e.target.value })}
                        />
                        <Input
                            label="Prazo de Execução"
                            type="date"
                            value={formData.executionEnd}
                            onChange={e => setFormData({ ...formData, executionEnd: e.target.value })}
                        />
                    </div>
                </div>

                {/* Orçamento */}
                <div className="card">
                    <h2 className="card-title flex items-center gap-2 mb-6">
                        <DollarSign size={20} className="text-gold" /> Orçamento
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Orçamento Total (R$)"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.totalBudget}
                            onChange={e => setFormData({ ...formData, totalBudget: e.target.value })}
                            placeholder="500000.00"
                        />
                        <Input
                            label="Valor Máximo por Projeto (R$)"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.maxPerProject}
                            onChange={e => setFormData({ ...formData, maxPerProject: e.target.value })}
                            placeholder="50000.00"
                        />
                    </div>
                </div>

                {/* Categorias */}
                <div className="card">
                    <h2 className="card-title flex items-center gap-2 mb-4">
                        🎨 Categorias Culturais
                    </h2>
                    <p className="text-sm text-gray-400 mb-4">Selecione as categorias aceitas neste edital.</p>

                    <div className="flex flex-wrap gap-2">
                        {CULTURAL_CATEGORIES.map(cat => {
                            const isSelected = formData.culturalCategories.includes(cat);
                            return (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => toggleCategory(cat)}
                                    className={`
                                        px-4 py-2 rounded-full text-sm transition-colors border
                                        ${isSelected
                                            ? "bg-blue-500/20 border-blue-500 text-blue-400"
                                            : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"}
                                    `}
                                >
                                    {cat}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Regiões */}
                <div className="card">
                    <h2 className="card-title flex items-center gap-2 mb-4">
                        <MapPin size={20} className="text-gold" /> Regiões Alvo
                    </h2>

                    <div className="flex gap-2 mb-4">
                        <Input
                            value={newRegion}
                            onChange={e => setNewRegion(e.target.value)}
                            placeholder="Ex: Zona Norte, Centro..."
                            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addRegion())}
                            containerClassName="mb-0 flex-1"
                            className="bg-gray-900 border-gray-700"
                        />
                        <Button type="button" variant="secondary" onClick={addRegion} leftIcon={<Plus size={18} />}>
                            Adicionar
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {formData.targetRegions.length === 0 && (
                            <p className="text-gray-500 italic text-sm">Nenhuma região adicionada.</p>
                        )}
                        {formData.targetRegions.map(region => (
                            <span
                                key={region}
                                className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm flex items-center gap-2"
                            >
                                {region}
                                <button
                                    type="button"
                                    onClick={() => removeRegion(region)}
                                    className="hover:text-red-400 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Acessibilidade */}
                <div className="card">
                    <h2 className="card-title flex items-center gap-2 mb-4">
                        ♿ Acessibilidade
                    </h2>

                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-700">
                        <input
                            type="checkbox"
                            checked={formData.requiresAccessibilityPlan}
                            onChange={e => setFormData({ ...formData, requiresAccessibilityPlan: e.target.checked })}
                            className="w-5 h-5 rounded text-gold focus:ring-gold bg-gray-900 border-gray-600"
                        />
                        <span className="text-gray-200">Exigir plano de acessibilidade nos projetos inscritos</span>
                    </label>
                </div>

                {/* Ações */}
                <div className="flex justify-end gap-4 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate("/admin/editais")}
                        disabled={saving}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        isLoading={saving}
                        leftIcon={<Save size={18} />}
                    >
                        {isEdit ? "Salvar Alterações" : "Criar Edital"}
                    </Button>
                </div>
            </form>
        </div>
    );
};
